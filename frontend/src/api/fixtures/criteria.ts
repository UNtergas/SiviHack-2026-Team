import type { Criterion, WeightSuggestion } from "@/api/schema"

/**
 * The seven base criteria from the sponsor's rubric (TRACK.md, Appendix A),
 * and the authored weight suggestion for the NordFrame RFP.
 */

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
