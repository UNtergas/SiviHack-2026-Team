import type {
  Citation,
  Criterion,
  CriterionScore,
  Issue,
  Requirement,
  RequirementStatus,
  Review,
  Severity,
  Siglum,
} from "@/api/schema"
import type { RiskFinding, RiskType, ScoringResult } from "@/api/backend"
import { excerpt, findQuote, plain, sectionOf } from "@/lib/quote"
import { verdictFor, weightedScore } from "@/lib/score"

/**
 * The backend speaks in requirements, coverage, scores and risks. The edition
 * speaks in issues, each with a lemma and a citation. This is the one place
 * the two vocabularies meet.
 */

const CRITERION: Record<string, string> = {
  problem_understanding: "c-problem",
  scope_clarity: "c-scope",
  pricing_clarity: "c-pricing",
  timeline_clarity: "c-timeline",
  completeness: "c-completeness",
  tone_persuasiveness: "c-tone",
  risk_transparency: "c-risk",
}

const RISK_CRITERION: Record<RiskType, string> = {
  OVERCOMMIT: "c-scope",
  SCOPE_CREEP: "c-scope",
  UNREALISTIC_TIMELINE: "c-timeline",
  PRICING_MISMATCH: "c-pricing",
  CONTRADICTION: "c-completeness",
}

/** The words being judged, when the risk is a kind rather than a passage. */
const RISK_LEMMA: Record<RiskType, string> = {
  OVERCOMMIT: "a commitment the draft cannot keep",
  SCOPE_CREEP: "scope beyond what was asked",
  UNREALISTIC_TIMELINE: "a timeline that cannot hold",
  PRICING_MISMATCH: "a price that does not fit the brief",
  CONTRADICTION: "a contradiction of the brief",
}

const RISK_SEVERITY: Record<RiskFinding["severity"], Severity> = {
  HIGH: "must",
  MEDIUM: "should",
  LOW: "optional",
}

const ORDER: Severity[] = ["must", "should", "optional"]

/** A coverage gap lands on the criterion its requirement is really about. */
function criterionForGap(rfpQuote: string): string {
  if (/budget|€|\$|£|price|pricing|cost/i.test(rfpQuote)) return "c-pricing"
  if (/timeline|deadline|month|week|rollout|pilot/i.test(rfpQuote)) return "c-timeline"
  if (/risk|assumption|limitation/i.test(rfpQuote)) return "c-risk"
  return "c-completeness"
}

export function adapt(
  result: ScoringResult,
  input: { rfp: string; proposal: string; criteria: Criterion[] },
): Review {
  const cite = (witness: Siglum, text: string, quote: string): Citation => ({
    witness,
    section: sectionOf(text, quote) ?? "",
    quote,
  })
  const R = (quote: string) => cite("R", input.rfp, quote)
  const P = (quote: string) => cite("P", input.proposal, quote)

  const coverage = new Map(result.coverage.map((c) => [c.requirementId, c]))
  const byId = new Map(result.requirements.map((r) => [r.id, r]))

  const requirements: Requirement[] = result.requirements.map((r) => {
    const cov = coverage.get(r.id)
    return {
      id: r.id,
      ref: r.id.replace(/^r/i, ""),
      section: r.section ?? sectionOf(input.rfp, r.rfpQuote) ?? "RFP",
      text: plain(r.rfpQuote),
      status: (cov?.status.toLowerCase() as RequirementStatus | undefined) ?? "missing",
      answeredAt: cov?.proposalQuote ? P(cov.proposalQuote) : null,
      source: R(r.rfpQuote),
      note: cov?.explanation ?? "The model returned no assessment for this requirement.",
    }
  })

  const issues: Issue[] = []

  for (const cov of result.coverage) {
    if (cov.status === "ADDRESSED") continue
    const req = byId.get(cov.requirementId)
    const label = req?.label ?? cov.requirementId
    issues.push({
      id: `cov-${cov.requirementId}`,
      ref: "",
      severity: cov.status === "PARTIAL" ? "should" : "must",
      criterionId: req ? criterionForGap(req.rfpQuote) : "c-completeness",
      lemma: cov.proposalQuote
        ? excerpt(cov.proposalQuote)
        : `nothing on ${label.charAt(0).toLowerCase()}${label.slice(1)}`,
      quoted: cov.proposalQuote ? plain(cov.proposalQuote) : null,
      location: cov.proposalQuote ? P(cov.proposalQuote) : null,
      against: req ? R(req.rfpQuote) : null,
      whyItMatters: cov.explanation,
      suggestedFix: cov.fix ?? "",
    })
  }

  // A risk on the same passage and the same criterion as a coverage gap is
  // the same finding seen twice. The coverage entry keeps it, with the
  // requirement attached, and takes the risk's severity if that is higher.
  const span = (quote: string | null | undefined) =>
    quote ? findQuote(input.proposal, quote) : null
  const restated = (risk: RiskFinding, criterionId: string): boolean => {
    const a = span(risk.proposalQuote)
    if (!a) return false
    const twin = issues.find((issue) => {
      if (issue.criterionId !== criterionId) return false
      const b = span(issue.location?.quote)
      return b !== null && a.start < b.end && b.start < a.end
    })
    if (!twin) return false
    const severity = RISK_SEVERITY[risk.severity] ?? "should"
    if (ORDER.indexOf(severity) < ORDER.indexOf(twin.severity)) twin.severity = severity
    return true
  }

  result.risks.forEach((risk, i) => {
    const type = risk.type as RiskType
    if (restated(risk, RISK_CRITERION[type] ?? "c-risk")) return
    issues.push({
      id: `risk-${i + 1}`,
      ref: "",
      severity: RISK_SEVERITY[risk.severity] ?? "should",
      criterionId: RISK_CRITERION[type] ?? "c-risk",
      lemma: RISK_LEMMA[type] ?? plain(String(risk.type)).toLowerCase(),
      quoted: plain(risk.proposalQuote),
      location: P(risk.proposalQuote),
      against: risk.rfpQuote ? R(risk.rfpQuote) : null,
      whyItMatters: risk.explanation,
      suggestedFix: risk.fix ?? "",
    })
  })

  issues.sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity))
  issues.forEach((issue, i) => {
    issue.ref = String(i + 1)
  })

  const criteria: CriterionScore[] = result.scores.flatMap((s) => {
    const criterionId = CRITERION[s.id]
    if (!criterionId) return []
    const cited = s.evidenceQuote
      ? [s.source === "rfp" ? R(s.evidenceQuote) : P(s.evidenceQuote)]
      : []
    return [
      {
        criterionId,
        score: Math.max(1, Math.min(5, Math.round(s.score))),
        strength: null,
        weakness: s.rationale,
        citations: cited,
      },
    ]
  })

  const overall = weightedScore(input.criteria, criteria)
  return { verdict: verdictFor(overall), overall, criteria, requirements, issues }
}
