import type {
  Citation,
  Criterion,
  Issue,
  Requirement,
  RequirementStatus,
  Review,
  Severity,
  WeightSuggestion,
} from "@/api/schema"
import { verdictFor, weightedScore } from "@/lib/score"

import {
  RFP_LINES,
  SAMPLE_LINES,
  type SampleId,
  spanOf,
} from "./documents"

const r = (section: string, start: string, end = start): Citation => {
  const [from, to] = spanOf(RFP_LINES, start, end)
  return { witness: "R", section, from, to }
}

const p = (
  sample: SampleId,
  section: string,
  start: string,
  end = start,
): Citation => {
  const [from, to] = spanOf(SAMPLE_LINES[sample], start, end)
  return { witness: "P", section, from, to }
}

/* ------------------------------------------------------------------ rubric */

export const BASE_CRITERIA: Criterion[] = [
  {
    id: "c-problem",
    name: "Problem Understanding",
    whatToCheck:
      "Does the proposal reflect the client's actual stated problem and goals, rather than a generic pitch?",
    enabled: true,
    weight: 15,
  },
  {
    id: "c-scope",
    name: "Scope & Deliverables Clarity",
    whatToCheck:
      "Are deliverables specific and unambiguous? Is it clear what is and is not included?",
    enabled: true,
    weight: 15,
  },
  {
    id: "c-pricing",
    name: "Pricing Clarity",
    whatToCheck:
      "Is pricing stated, broken down, and easy to understand, rather than vague or deferred?",
    enabled: true,
    weight: 14,
  },
  {
    id: "c-timeline",
    name: "Timeline Clarity",
    whatToCheck:
      "Are milestones and dates concrete, rather than 'in due course' or 'to be confirmed'?",
    enabled: true,
    weight: 14,
  },
  {
    id: "c-completeness",
    name: "Completeness vs RFP",
    whatToCheck:
      "Does the proposal address every requirement the RFP explicitly asked for?",
    enabled: true,
    weight: 14,
  },
  {
    id: "c-tone",
    name: "Tone & Persuasiveness",
    whatToCheck:
      "Does it read as confident and client-focused, rather than generic boilerplate?",
    enabled: true,
    weight: 14,
  },
  {
    id: "c-risk",
    name: "Risk & Assumptions",
    whatToCheck:
      "Are assumptions, limitations and risks flagged openly rather than omitted?",
    enabled: true,
    weight: 14,
  },
]

/**
 * The RFP repeats "no migration to a new database" and "minimal disruption",
 * which is the client priority the scoring example says to detect. The
 * suggestion weights toward continuity and away from polish.
 */
export const WEIGHT_SUGGESTIONS: WeightSuggestion[] = [
  {
    criterionId: "c-completeness",
    weight: 26,
    reason:
      "R lists seven numbered requirements. Whether each is met is the single biggest signal in this RFP.",
  },
  {
    criterionId: "c-risk",
    weight: 18,
    reason:
      "R requirement 7 asks for risks in writing, and says why: inventory decisions will be made on this system.",
  },
  {
    criterionId: "c-problem",
    weight: 14,
    reason:
      "R repeats 'no migration' and 'minimal disruption'. Continuity matters here more than sophistication.",
  },
  {
    criterionId: "c-pricing",
    weight: 14,
    reason: "R states a budget band, so a response can be checked against it.",
  },
  {
    criterionId: "c-timeline",
    weight: 13,
    reason:
      "R gives two hard gates — pilot at 3 months, all six sites at 6 months.",
  },
  {
    criterionId: "c-scope",
    weight: 10,
    reason: "Covered largely by completeness; kept to catch unasked-for scope.",
  },
  {
    criterionId: "c-tone",
    weight: 5,
    reason: "R never asks about tone. Lowered rather than removed.",
  },
]

/* ------------------------------------------------------- the RFP's asks --- */

const ASKS = {
  dashboard: {
    ref: "1",
    section: "Req. 1",
    text: "Web-based dashboard showing real-time inventory across all 6 warehouses.",
    cite: r("Req. 1", "1. A **web-based dashboard**", "   warehouses."),
  },
  alerts: {
    ref: "2",
    section: "Req. 2",
    text: "Automated low-stock alerts to warehouse managers, configurable threshold.",
    cite: r(
      "Req. 2",
      "2. **Automated low-stock alerts**",
      "below a configurable threshold.",
    ),
  },
  postgres: {
    ref: "3",
    section: "Req. 3",
    text: "Integration with the existing PostgreSQL database — no migration.",
    cite: r(
      "Req. 3",
      "3. Integration with our **existing PostgreSQL",
      "migration to a new database.",
    ),
  },
  roles: {
    ref: "4",
    section: "Req. 4",
    text: "Role-based access: managers see only their site, HQ sees all sites.",
    cite: r(
      "Req. 4",
      "4. **Role-based access**",
      "site; HQ staff should see all sites.",
    ),
  },
  rollout: {
    ref: "5",
    section: "Req. 5",
    text: "Migration / onboarding plan across all 6 sites with minimal disruption.",
    cite: r(
      "Req. 5",
      "5. A **data migration / onboarding plan**",
      "sites with minimal disruption.",
    ),
  },
  support: {
    ref: "6",
    section: "Req. 6",
    text: "Support and maintenance terms after go-live, with response times and SLAs.",
    cite: r("Req. 6", "6. **Support & maintenance terms**"),
  },
  risks: {
    ref: "7",
    section: "Req. 7",
    text: "Documented assumptions, limitations and risks.",
    cite: r(
      "Req. 7",
      "7. Clear documentation of any",
      "inventory decisions will be made based on this system.",
    ),
  },
  budget: {
    ref: "8",
    section: "Budget",
    text: "Total of 80,000 to 120,000 euro, including the first year of support.",
    cite: r("Budget", "total, including first year of support."),
  },
  timeline: {
    ref: "9",
    section: "Timeline",
    text: "Pilot at one warehouse within 3 months; all 6 sites within 6 months.",
    cite: r(
      "Timeline",
      "Working pilot at one warehouse within 3 months",
      "within 6 months.",
    ),
  },
} as const

type AskKey = keyof typeof ASKS

const requirements = (
  rows: {
    key: AskKey
    status: RequirementStatus
    at: Citation | null
    note: string
  }[],
): Requirement[] =>
  rows.map(({ key, status, at, note }) => ({
    id: `req-${ASKS[key].ref}`,
    ref: ASKS[key].ref,
    section: ASKS[key].section,
    text: ASKS[key].text,
    status,
    source: ASKS[key].cite,
    answeredAt: at,
    note,
  }))

let issueSeq = 0
const issue = (
  severity: Severity,
  criterionId: string,
  lemma: string,
  quoted: string | null,
  location: Citation,
  against: Citation | null,
  whyItMatters: string,
  suggestedFix: string,
): Issue => ({
  id: `iss-${++issueSeq}`,
  ref: "",
  severity,
  criterionId,
  lemma,
  quoted,
  location,
  against,
  whyItMatters,
  suggestedFix,
})

const number = (issues: Issue[]): Issue[] => {
  const order: Severity[] = ["must", "should", "optional"]
  const sorted = [...issues].sort(
    (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
  )
  return sorted.map((entry, i) => ({ ...entry, ref: String(i + 1) }))
}

const assemble = (
  scores: { id: string; score: number; strength: string | null; weakness: string; cites: Citation[] }[],
  reqs: Requirement[],
  issues: Issue[],
): Review => {
  const criteria = scores.map((s) => ({
    criterionId: s.id,
    score: s.score,
    strength: s.strength,
    weakness: s.weakness,
    citations: s.cites,
  }))
  const overall = weightedScore(BASE_CRITERIA, criteria)
  return {
    verdict: verdictFor(overall),
    overall,
    criteria,
    requirements: reqs,
    issues: number(issues),
  }
}

/* ------------------------------------------------------------------- weak */

const WEAK = assemble(
  [
    {
      id: "c-problem",
      score: 3,
      strength: "States the general problem correctly.",
      weakness:
        "Only at surface level. 'Better visibility into warehouse inventory' never names the six sites, the two countries, or the legacy system the dashboard has to live alongside.",
      cites: [
        p("weak", "Our Understanding", "NordFrame needs better visibility"),
        r("Background", "NordFrame Logistics operates 6 regional warehouses"),
      ],
    },
    {
      id: "c-scope",
      score: 2,
      strength: null,
      weakness:
        "The feature list is three lines long and every line is generic. Nothing states what is included or excluded, and no deliverable is specific enough to hold anyone to.",
      cites: [p("weak", "Features", "- Real-time inventory dashboard", "- Secure login for different users")],
    },
    {
      id: "c-pricing",
      score: 1,
      strength: null,
      weakness:
        "Entirely deferred — 'provided upon further discussion'. R states a budget band, so a figure could have been checked against it.",
      cites: [
        p("weak", "Pricing", "Pricing will be provided upon further discussion"),
        ASKS.budget.cite,
      ],
    },
    {
      id: "c-timeline",
      score: 1,
      strength: null,
      weakness:
        "No dates and no milestones. 'In a timely manner' is offered against an RFP that names a 3-month pilot and a 6-month rollout.",
      cites: [
        p("weak", "Timeline", "We will begin work shortly after contract signing"),
        ASKS.timeline.cite,
      ],
    },
    {
      id: "c-completeness",
      score: 2,
      strength: "Requirements 1 and 2 are gestured at.",
      weakness:
        "Four of the seven numbered requirements are unaddressed, including the PostgreSQL constraint the RFP states twice over.",
      cites: [r("Requirements", "## Requirements"), p("weak", "Features", "## Features")],
    },
    {
      id: "c-tone",
      score: 2,
      strength: "Readable and free of jargon.",
      weakness:
        "Generic and boilerplate, not tailored to NordFrame. 'Modern, scalable cloud architecture and industry best practices' would sit unchanged in any proposal to any client.",
      cites: [
        p("weak", "Our Approach", "will be built using modern, scalable cloud architecture"),
        p("weak", "Why BrightPath", "We have a talented team of engineers"),
      ],
    },
    {
      id: "c-risk",
      score: 1,
      strength: null,
      weakness:
        "Nothing disclosed anywhere. R requirement 7 asks for this directly and gives the reason: inventory decisions will be made on this system.",
      cites: [ASKS.risks.cite],
    },
  ],
  requirements([
    {
      key: "dashboard",
      status: "partial",
      at: p("weak", "Our Approach", "We will build a cloud-based dashboard that displays"),
      note: "A real-time dashboard is promised, but never across all six warehouses by name.",
    },
    {
      key: "alerts",
      status: "partial",
      at: p("weak", "Features", "- Notifications for low stock"),
      note: "Four words. No configurable threshold, and no mention of who is notified.",
    },
    {
      key: "postgres",
      status: "missing",
      at: null,
      note: "The proposal says only 'cloud-based dashboard'. The no-migration constraint is never confirmed.",
    },
    {
      key: "roles",
      status: "partial",
      at: p("weak", "Features", "- Secure login for different users"),
      note: "'Different users' is not the split R asks for: managers on their own site, HQ across all six.",
    },
    { key: "rollout", status: "missing", at: null, note: "No rollout or onboarding plan appears anywhere." },
    {
      key: "support",
      status: "missing",
      at: null,
      note: "No support terms, no response times, no SLA. The document ends without mentioning them.",
    },
    { key: "risks", status: "missing", at: null, note: "No risk, assumption or limitation is disclosed." },
    {
      key: "budget",
      status: "missing",
      at: p("weak", "Pricing", "Pricing will be provided upon further discussion"),
      note: "Deferred in full, so the stated budget band is neither met nor challenged.",
    },
    {
      key: "timeline",
      status: "missing",
      at: p("weak", "Timeline", "We will begin work shortly after contract signing"),
      note: "No date is given against either of the RFP's two gates.",
    },
  ]),
  [
    issue(
      "must",
      "c-completeness",
      "the PostgreSQL constraint is never confirmed",
      "We will build a cloud-based dashboard that displays inventory data in real time.",
      p("weak", "Our Approach", "We will build a cloud-based dashboard that displays"),
      ASKS.postgres.cite,
      "R requires integration with the existing PostgreSQL database with no migration to a new one. 'Cloud-based dashboard' does not confirm that constraint is respected — and a client who has written it down is reading for it.",
      "The dashboard connects directly to your existing PostgreSQL inventory database. No migration and no schema changes are required; we read from it in place.",
    ),
    issue(
      "must",
      "c-completeness",
      "no migration or onboarding plan",
      null,
      p("weak", "Our Approach", "## Our Approach"),
      ASKS.rollout.cite,
      "R requirement 5 asks for a rollout plan across all six sites with minimal disruption. Nothing in the proposal addresses it, and rollout risk is what a six-site operator worries about most.",
      "Add a Rollout Plan section: the order sites go live, one pilot warehouse first, then the remaining five in batches, and how each site keeps running on its current process until its data is confirmed.",
    ),
    issue(
      "must",
      "c-completeness",
      "no support or maintenance terms",
      null,
      p("weak", "Why BrightPath", "## Why BrightPath"),
      ASKS.support.cite,
      "R requirement 6 explicitly asks for response times and SLA terms after go-live. The document ends without mentioning support at all.",
      "Add a Support & Maintenance section with concrete commitments: response time for a critical issue, response time for a minor one, the hours they apply in, and what is included in year one.",
    ),
    issue(
      "must",
      "c-pricing",
      "Pricing will be provided upon further discussion",
      "Pricing will be provided upon further discussion of detailed requirements, and will depend on final scope.",
      p("weak", "Pricing", "Pricing will be provided upon further discussion", "and will depend on final scope."),
      ASKS.budget.cite,
      "R gives a budget band of 80,000 to 120,000 euro including first-year support. Deferring entirely leaves the client unable to compare this against any other response.",
      "Give at least a rough breakdown inside the stated band, even where final numbers depend on discovery:\n  Dashboard and database integration — EUR [X]\n  Alerts and role-based access — EUR [X]\n  Rollout across 6 sites — EUR [X]\n  Year 1 support — EUR [X]\n  Total — EUR [X], within your stated budget.",
    ),
    issue(
      "must",
      "c-timeline",
      "aim to deliver the solution in a timely manner",
      "We will begin work shortly after contract signing and aim to deliver the solution in a timely manner, with regular updates along the way.",
      p("weak", "Timeline", "We will begin work shortly after contract signing", "solution in a timely manner, with regular updates along the way."),
      ASKS.timeline.cite,
      "R names two gates: a working pilot at one warehouse within 3 months, and all six sites within 6 months. A response with no dates cannot be judged against either, and the decision is made at the end of this quarter.",
      "Add a milestone table mapping to the RFP's own gates:\n  Pilot live at warehouse 1 — week [X], inside your 3-month target\n  Validation in parallel with current process — weeks [X]\n  Remaining 5 sites — weeks [X], inside your 6-month target",
    ),
    issue(
      "should",
      "c-scope",
      "Secure login for different users",
      "- Secure login for different users",
      p("weak", "Features", "- Secure login for different users"),
      ASKS.roles.cite,
      "R asks specifically that warehouse managers see only their own site and HQ staff see all six. 'Secure login for different users' describes authentication, not the access split they asked for.",
      "State it in their words: warehouse managers see only their assigned site's inventory; HQ staff see all 6 sites. Access is enforced on the query, not hidden in the interface.",
    ),
    issue(
      "should",
      "c-risk",
      "no risks, assumptions or limitations",
      null,
      p("weak", "Why BrightPath", "## Why BrightPath"),
      ASKS.risks.cite,
      "R requirement 7 asks for these in writing, and says why: inventory decisions will be made on the back of this system. Silence reads as either not having looked or not wanting to say.",
      "Add a short Risks & Assumptions section naming at least one real dependency — database access being granted, onboarding time per site, or the accuracy of the legacy data being migrated — and what happens to the schedule if it slips.",
    ),
    issue(
      "optional",
      "c-tone",
      "industry best practices to ensure reliability and performance",
      "The system will be built using modern, scalable cloud architecture and industry best practices to ensure reliability and performance.",
      p("weak", "Our Approach", "will be built using modern, scalable cloud architecture", "practices to ensure reliability and performance."),
      null,
      "This sentence would sit unchanged in a proposal to any client in any industry. It costs a line and earns nothing, in a document that is missing four requirements it could have used the space on.",
      "Replace it with something only this client's proposal could say: 'Because your inventory data stays in PostgreSQL, the dashboard reads live from the system your team already trusts — there is no second copy of stock levels to reconcile.'",
    ),
  ],
)

/* ----------------------------------------------------------------- medium */

const MEDIUM = assemble(
  [
    {
      id: "c-problem",
      score: 4,
      strength: "Names the six warehouses, the spreadsheets and the legacy system.",
      weakness:
        "Reads the situation correctly but stops there; it never names what the client said matters most, which is continuity during the switch.",
      cites: [p("medium", "Our Understanding", "NordFrame's six warehouses currently rely on spreadsheets")],
    },
    {
      id: "c-scope",
      score: 4,
      strength: "Four deliverables, each stated specifically enough to hold to.",
      weakness:
        "Rollout is described as an approach rather than a plan: 'in phases' without saying how many, in what order, or over what period.",
      cites: [p("medium", "Proposed Solution", "- **Rollout approach**: we will onboard warehouses in phases")],
    },
    {
      id: "c-pricing",
      score: 3,
      strength: "A band is given, and it sits inside the client's own budget.",
      weakness:
        "Still a range with a firm quote deferred to discovery, and no breakdown showing what the 40,000 euro spread buys.",
      cites: [
        p("medium", "Pricing", "Our typical packages for a project of this scope range"),
        ASKS.budget.cite,
      ],
    },
    {
      id: "c-timeline",
      score: 2,
      strength: null,
      weakness:
        "Phases are named in order but carry no dates, and 'within the timeframe you've outlined' asks the client to supply the commitment themselves.",
      cites: [
        p("medium", "Timeline", "We will begin with discovery and design"),
        ASKS.timeline.cite,
      ],
    },
    {
      id: "c-completeness",
      score: 3,
      strength: "Requirements 1 to 4 are addressed directly and correctly.",
      weakness:
        "Requirements 6 and 7 — support terms and risk disclosure — are absent, and requirement 5 is gestured at rather than planned.",
      cites: [r("Requirements", "## Requirements")],
    },
    {
      id: "c-tone",
      score: 3,
      strength: "Plain, specific, and free of superlatives.",
      weakness:
        "The closing section is one sentence about the vendor's track record with no named client or outcome behind it.",
      cites: [p("medium", "Why Clarion", "Clarion has delivered inventory and logistics dashboards")],
    },
    {
      id: "c-risk",
      score: 1,
      strength: null,
      weakness:
        "No assumption, limitation or risk anywhere, against a requirement that asks for them by name.",
      cites: [ASKS.risks.cite],
    },
  ],
  requirements([
    {
      key: "dashboard",
      status: "addressed",
      at: p("medium", "Proposed Solution", "- **Dashboard**: real-time inventory levels across all 6 warehouses"),
      note: "Named exactly as asked, across all six sites.",
    },
    {
      key: "alerts",
      status: "addressed",
      at: p("medium", "Proposed Solution", "- **Low-stock alerts**: configurable thresholds per item"),
      note: "Configurable per item, routed to the responsible manager.",
    },
    {
      key: "postgres",
      status: "addressed",
      at: p("medium", "Proposed Solution", "  on top of your existing PostgreSQL database"),
      note: "States the constraint back: built on the existing database, no migration required.",
    },
    {
      key: "roles",
      status: "addressed",
      at: p("medium", "Proposed Solution", "- **Role-based access**: warehouse managers see only their own site's data"),
      note: "The split is stated in the client's own terms.",
    },
    {
      key: "rollout",
      status: "partial",
      at: p("medium", "Proposed Solution", "- **Rollout approach**: we will onboard warehouses in phases"),
      note: "The intent is right — phased, to reduce disruption — but no order, count or schedule is given.",
    },
    { key: "support", status: "missing", at: null, note: "No support terms, response times or SLA appear." },
    { key: "risks", status: "missing", at: null, note: "No assumption, limitation or risk is disclosed." },
    {
      key: "budget",
      status: "partial",
      at: p("medium", "Pricing", "Our typical packages for a project of this scope range"),
      note: "A range inside the client's band, but no breakdown and the firm quote is deferred.",
    },
    {
      key: "timeline",
      status: "partial",
      at: p("medium", "Timeline", "We will begin with discovery and design"),
      note: "Phases in the right order, no dates against either the 3-month or 6-month gate.",
    },
  ]),
  [
    issue(
      "must",
      "c-completeness",
      "no support or maintenance terms",
      null,
      p("medium", "Why Clarion", "## Why Clarion"),
      ASKS.support.cite,
      "R requirement 6 asks for response times and SLAs after go-live. This response answers the first four requirements well, which makes the omission stand out rather than blend in.",
      "Add a Support & Maintenance section: response time for a system-down issue, response time for a minor one, the hours they apply in, and confirmation that year one is included in the quoted range.",
    ),
    issue(
      "must",
      "c-risk",
      "no risks, assumptions or limitations",
      null,
      p("medium", "Why Clarion", "## Why Clarion"),
      ASKS.risks.cite,
      "R requirement 7 asks for these explicitly. The proposal already depends on database access and on sites being available to onboard — both are assumptions worth stating rather than discovering later.",
      "Add Risks & Assumptions: read access to the production PostgreSQL database is granted without schema changes; each site can free a point of contact for onboarding; alert thresholds need tuning in the first weeks after each site goes live.",
    ),
    issue(
      "should",
      "c-timeline",
      "Exact scheduling will be confirmed once we begin discovery",
      "We will begin with discovery and design, followed by a pilot phase, and aim to complete full rollout within the timeframe you've outlined.",
      p("medium", "Timeline", "We will begin with discovery and design", "scheduling will be confirmed once we begin discovery."),
      ASKS.timeline.cite,
      "The phases are right but the client has to supply the dates themselves. R gives two concrete gates to commit against, and a decision is made at the end of this quarter.",
      "Put weeks against the phases you already named:\n  Discovery and design — weeks 1 to [X]\n  Pilot at warehouse 1 — live by week [X], inside your 3-month target\n  Remaining 5 sites — weeks [X] to [X], inside your 6-month target",
    ),
    issue(
      "should",
      "c-scope",
      "we will onboard warehouses in phases",
      "- **Rollout approach**: we will onboard warehouses in phases rather than all at once, to reduce disruption during the transition.",
      p("medium", "Proposed Solution", "- **Rollout approach**: we will onboard warehouses in phases", "  all at once, to reduce disruption during the transition."),
      ASKS.rollout.cite,
      "R asks for a plan, not an approach. The instinct is correct and matches what the client said they care about, which makes it worth the extra four lines to turn into something they can hold you to.",
      "Name the sequence: pilot site first, a validation period running alongside the existing spreadsheet process to prove the numbers match, then the remaining five in two batches.",
    ),
    issue(
      "optional",
      "c-pricing",
      "range from EUR 70,000 to EUR 110,000",
      "Our typical packages for a project of this scope range from €70,000 to €110,000 depending on final integration complexity.",
      p("medium", "Pricing", "Our typical packages for a project of this scope range", "quote after discovery."),
      ASKS.budget.cite,
      "A 40,000 euro spread on a 120,000 euro ceiling is a third of the budget left open. The band sits inside theirs, which is good, but a breakdown would show where the variance actually lives.",
      "Break the range into its parts and say what moves: the dashboard and integration are fixed; only the connector work varies with schema complexity, between EUR [X] and EUR [X].",
    ),
  ],
)

/* ----------------------------------------------------------------- strong */

const STRONG = assemble(
  [
    {
      id: "c-problem",
      score: 5,
      strength:
        "Names the six sites, both countries, the spreadsheets and the legacy system — and then names the actual constraint: no disruption to data infrastructure or operations during rollout.",
      weakness:
        "Nothing material. It reads as though the RFP was read twice.",
      cites: [p("strong", "Our Understanding", "NordFrame operates 6 warehouses across Germany and Austria")],
    },
    {
      id: "c-scope",
      score: 5,
      strength:
        "Five numbered deliverables, each specific enough to hold to, with no unasked-for scope attached.",
      weakness:
        "Alerts are offered by email and SMS where R asked only that managers be notified; SMS carries a cost nobody has priced.",
      cites: [p("strong", "Proposed Solution", "### 2. Low-Stock Alerts")],
    },
    {
      id: "c-pricing",
      score: 5,
      strength:
        "Four line items, a total of 102,000 euro, and it states that the figure sits inside the client's band.",
      weakness: "Nothing material.",
      cites: [
        p("strong", "Pricing", "| **Total** | **"),
        ASKS.budget.cite,
      ],
    },
    {
      id: "c-timeline",
      score: 5,
      strength:
        "Weeks against every step, and each one is mapped explicitly back to the RFP's own 3-month and 6-month gates.",
      weakness:
        "The end-of-quarter decision date is never acknowledged, so week 1 has no anchor in the calendar.",
      cites: [
        p("strong", "Proposed Solution", "| Pilot | 1 warehouse, Weeks"),
        ASKS.timeline.cite,
      ],
    },
    {
      id: "c-completeness",
      score: 5,
      strength:
        "All seven numbered requirements are answered, plus budget and timeline. The no-migration constraint is stated back in bold.",
      weakness: "Nothing material.",
      cites: [r("Requirements", "## Requirements"), p("strong", "Proposed Solution", "via a read-only connector")],
    },
    {
      id: "c-tone",
      score: 4,
      strength:
        "Confident without superlatives. It earns trust by being checkable rather than by claiming to be trustworthy.",
      weakness:
        "The closing line cites two logistics operators without naming either or saying what was delivered.",
      cites: [p("strong", "Why Fernglow", "We've delivered similar inventory visibility platforms")],
    },
    {
      id: "c-risk",
      score: 5,
      strength:
        "Three assumptions, each naming the dependency and what happens to the plan if it does not hold.",
      weakness:
        "R asks for limitations as well as assumptions and risks; what the system will not do is not stated.",
      cites: [p("strong", "Risks & Assumptions", "- Assumes read access to the existing PostgreSQL database")],
    },
  ],
  requirements([
    {
      key: "dashboard",
      status: "addressed",
      at: p("strong", "Sol. 1", "### 1. Real-Time Dashboard", "your existing PostgreSQL database via a read-only connector"),
      note: "Live across all six, refreshed continuously from the existing database.",
    },
    {
      key: "alerts",
      status: "addressed",
      at: p("strong", "Sol. 2", "### 2. Low-Stock Alerts", "responsible warehouse manager automatically."),
      note: "Configurable per item, routed to the responsible manager.",
    },
    {
      key: "postgres",
      status: "addressed",
      at: p("strong", "Sol. 1", "via a read-only connector"),
      note: "Read-only connector, stated in bold: no migration or schema changes required.",
    },
    {
      key: "roles",
      status: "addressed",
      at: p("strong", "Sol. 3", "### 3. Role-Based Access", "not just hidden in the UI."),
      note: "The split is exact, and enforced at the query rather than in the interface.",
    },
    {
      key: "rollout",
      status: "addressed",
      at: p("strong", "Sol. 4", "### 4. Rollout / Onboarding Plan", "| Phased rollout |"),
      note: "A three-step table with weeks, including a parallel-run validation before cutover.",
    },
    {
      key: "support",
      status: "addressed",
      at: p("strong", "Sol. 5", "### 5. Support & Maintenance", "CET business hours."),
      note: "24 hours for critical, 3 business days for minor, with the hours stated.",
    },
    {
      key: "risks",
      status: "partial",
      at: p("strong", "Risks", "## Risks & Assumptions", "real usage may take 2"),
      note: "Assumptions and risks are disclosed well. Limitations, which R also asks for, are not.",
    },
    {
      key: "budget",
      status: "addressed",
      at: p("strong", "Pricing", "| **Total** | **"),
      note: "102,000 euro, itemised, and explicitly placed inside the stated band.",
    },
    {
      key: "timeline",
      status: "addressed",
      at: p("strong", "Sol. 4", "| Pilot | 1 warehouse, Weeks"),
      note: "Both of the RFP's gates are named and met, in weeks.",
    },
  ]),
  [
    issue(
      "should",
      "c-risk",
      "limitations are not stated",
      null,
      p("strong", "Risks", "## Risks & Assumptions"),
      ASKS.risks.cite,
      "R requirement 7 asks for assumptions, limitations and risks. Two of the three are covered thoroughly. Limitations — what this system will not tell them — is the one a client discovers after go-live if nobody writes it down.",
      "Add one line to the same section: the dashboard reflects what is in PostgreSQL, so stock that has not been booked in will not appear; it reports current levels rather than forecasting demand.",
    ),
    issue(
      "optional",
      "c-timeline",
      "Weeks 1 to 10",
      "| Pilot | 1 warehouse, Weeks 1–10 (within your 3-month target) |",
      p("strong", "Sol. 4", "| Pilot | 1 warehouse, Weeks"),
      r("Decision Date", "End of this quarter."),
      "The week numbers are mapped to the RFP's targets, which is exactly right, but they are relative to a start date nobody has fixed. R names a decision at the end of this quarter, so the calendar is available.",
      "Anchor week 1: 'Weeks run from contract signature. On a decision at the end of this quarter, the pilot is live by [date] and all six sites by [date].'",
    ),
    issue(
      "optional",
      "c-tone",
      "two regional logistics operators",
      "We've delivered similar inventory visibility platforms for two regional logistics operators in the past two years, both still in production today.",
      p("strong", "Why Fernglow", "We've delivered similar inventory visibility platforms", "both still in production today."),
      null,
      "The whole proposal earns trust by being checkable, and this is the one sentence that asks to be taken on faith. 'Both still in production' is the most persuasive claim in the document and the only one with nothing behind it.",
      "Name them, or offer them: 'Both are available as references on request — [operator], [scope], live since [year]; [operator], [scope], live since [year].'",
    ),
  ],
)

/* ----------------------------------------------------------- overpromise */

const OVERPROMISE = assemble(
  [
    {
      id: "c-problem",
      score: 2,
      strength: "Correctly identifies inventory visibility as the subject.",
      weakness:
        "Opens by telling the client their own brief was too small. 'NordFrame deserves more than a simple dashboard' answers a question nobody asked, while the constraint they wrote down twice goes the other way.",
      cites: [p("overpromise", "Our Vision", "NordFrame deserves more than a simple dashboard")],
    },
    {
      id: "c-scope",
      score: 1,
      strength: null,
      weakness:
        "Six deliverables, four of which were never requested — forecasting, reorder recommendations, supplier scoring, and a platform migration the RFP rules out. Two requirements that were asked for are missing entirely.",
      cites: [p("overpromise", "Proposed Solution", "- **AI demand forecasting** to predict stock needs")],
    },
    {
      id: "c-pricing",
      score: 3,
      strength: "A single total is stated and it sits inside the client's band.",
      weakness:
        "98,000 euro covers a platform migration, four analytics modules and a year of support, with no breakdown. Against the strong response's 102,000 for a fraction of the scope, the number reads as unserious rather than competitive.",
      cites: [
        p("overpromise", "Pricing", "Total project cost: **"),
        ASKS.budget.cite,
      ],
    },
    {
      id: "c-timeline",
      score: 1,
      strength: null,
      weakness:
        "Eight weeks for a database migration plus four AI modules, against an RFP that allows three months for a single-warehouse pilot. No milestones, and the phrase doing the work is 'accelerated delivery methodology'.",
      cites: [
        p("overpromise", "Timeline", "the complete suite"),
        ASKS.timeline.cite,
      ],
    },
    {
      id: "c-completeness",
      score: 2,
      strength: "The dashboard and alerts requirements are covered.",
      weakness:
        "Role-based access and the rollout plan are absent, support terms are a single clause, and requirement 3 is not merely missed but reversed.",
      cites: [r("Requirements", "## Requirements")],
    },
    {
      id: "c-tone",
      score: 2,
      strength: "Energetic and clearly written.",
      weakness:
        "The energy is pointed at the vendor's capabilities rather than the client's problem. 'Cutting-edge', 'full power', 'maximum performance' carry the argument where specifics should.",
      cites: [p("overpromise", "Why Vantix", "Vantix specializes in cutting-edge AI transformation")],
    },
    {
      id: "c-risk",
      score: 1,
      strength: null,
      weakness:
        "None disclosed, on the proposal with by far the most to disclose: a production database migration on an eight-week schedule.",
      cites: [ASKS.risks.cite],
    },
  ],
  requirements([
    {
      key: "dashboard",
      status: "addressed",
      at: p("overpromise", "Proposed Solution", "- **Real-time dashboard** across all 6 warehouses"),
      note: "Covered, with predictive analytics attached that nobody asked for.",
    },
    {
      key: "alerts",
      status: "partial",
      at: p("overpromise", "Proposed Solution", "- **Real-time alerts** across all locations simultaneously."),
      note: "No configurable threshold, and alerts go everywhere at once rather than to the responsible manager.",
    },
    {
      key: "postgres",
      status: "contradicted",
      at: p("overpromise", "Proposed Solution", "- **Full platform migration**: we recommend migrating away", "  best performance and scalability."),
      note: "R rules out migration to a new database. The proposal recommends exactly that, to a proprietary platform.",
    },
    { key: "roles", status: "missing", at: null, note: "Role-based access is never mentioned." },
    { key: "rollout", status: "missing", at: null, note: "No rollout or onboarding plan, on the proposal with the largest change to roll out." },
    {
      key: "support",
      status: "partial",
      at: p("overpromise", "Pricing", "including the data platform migration, all AI modules, and one year of"),
      note: "One year of support is priced in. No response times and no SLA.",
    },
    { key: "risks", status: "missing", at: null, note: "Nothing disclosed." },
    {
      key: "budget",
      status: "addressed",
      at: p("overpromise", "Pricing", "Total project cost: **"),
      note: "98,000 euro, inside the band — though for a scope that makes the figure hard to credit.",
    },
    {
      key: "timeline",
      status: "partial",
      at: p("overpromise", "Timeline", "the complete suite"),
      note: "Beats both gates on paper, at eight weeks including a database migration. No milestones behind it.",
    },
  ]),
  [
    issue(
      "must",
      "c-completeness",
      "migrating away from your current PostgreSQL database",
      "**Full platform migration**: we recommend migrating away from your current PostgreSQL database to our proprietary cloud data platform for best performance and scalability.",
      p("overpromise", "Proposed Solution", "- **Full platform migration**: we recommend migrating away", "  best performance and scalability."),
      ASKS.postgres.cite,
      "R requirement 3 asks for integration with the existing PostgreSQL database and says 'no migration to a new database' in as many words. This proposes the opposite, as the lead item. It is the single fastest way for this response to be set aside, and it takes a proprietary-platform lock-in with it.",
      "Replace the lead item: the dashboard reads from your existing PostgreSQL database in place, through a read-only connector. No migration, no schema change, and no new data platform to depend on.",
    ),
    issue(
      "must",
      "c-timeline",
      "within 8 weeks",
      "Given our accelerated delivery methodology, we are confident we can deliver the complete suite — including the platform migration and all analytics modules — within **8 weeks**, well ahead of typical industry timelines.",
      p("overpromise", "Timeline", "Given our accelerated delivery methodology", "well ahead of typical industry timelines."),
      ASKS.timeline.cite,
      "R allows three months for a pilot at one warehouse. This promises a production database migration and four analytics modules across six sites in eight weeks. A client who has run a migration will read this as inexperience rather than speed.",
      "Drop the migration, then commit to their gates rather than beating them: pilot live at one warehouse by week [X] inside your 3-month target, all six sites by week [X] inside your 6-month target, with a parallel-run validation before each cutover.",
    ),
    issue(
      "must",
      "c-completeness",
      "role-based access is absent",
      null,
      p("overpromise", "Proposed Solution", "## Proposed Solution"),
      ASKS.roles.cite,
      "R requirement 4 is specific: managers see only their own site, HQ sees all six. It appears nowhere, on a proposal that found room for supplier performance scoring.",
      "Add it as a named deliverable: warehouse managers see only their assigned site's inventory; HQ staff see all 6 sites; the restriction is enforced on the query rather than in the interface.",
    ),
    issue(
      "must",
      "c-completeness",
      "no rollout or onboarding plan",
      null,
      p("overpromise", "Timeline", "## Timeline"),
      ASKS.rollout.cite,
      "R requirement 5 asks for a rollout plan across six sites with minimal disruption. This proposal changes more than any other — a new data platform underneath six live warehouses — and is the only one with no plan for landing it.",
      "Add a Rollout Plan: which site goes first, how long it runs alongside the current process before cutover, and the order the remaining five follow.",
    ),
    issue(
      "should",
      "c-scope",
      "predictive demand forecasting, reorder recommendations, supplier scoring",
      "combining real-time inventory visibility with predictive demand forecasting, automated reorder recommendations, supplier performance scoring, and a complete migration to a modern cloud-native data platform for maximum performance.",
      p("overpromise", "Our Vision", "with predictive demand forecasting", "cloud-native data platform for maximum performance."),
      r("Requirements", "## Requirements"),
      "Three of these were never requested, and they arrive in a document that is missing two requirements that were. Unasked-for scope against a fixed budget invites one question: what did it displace?",
      "Deliver the seven requirements first, then offer the rest honestly: 'Forecasting, reorder recommendations and supplier scoring are available as a later phase, priced separately, once the dashboard is live across all six sites.'",
    ),
    issue(
      "should",
      "c-risk",
      "no risks against a database migration",
      null,
      p("overpromise", "Why Vantix", "## Why Vantix"),
      ASKS.risks.cite,
      "R requirement 7 asks for risks, and this proposal carries the most of any: a production database migration, a proprietary platform, and an eight-week schedule. Disclosing none of it is the part a technical reviewer will circle.",
      "If the migration stays in the proposal, its risks belong in it: what happens to inventory accuracy during cutover, what the rollback is, and what the client depends on afterwards that they do not depend on today.",
    ),
  ],
)

export const REVIEWS: Record<SampleId, Review> = {
  weak: WEAK,
  medium: MEDIUM,
  strong: STRONG,
  overpromise: OVERPROMISE,
}
