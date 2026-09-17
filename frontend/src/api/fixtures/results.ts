import type { ScoringResult } from "@/api/backend"
import { findQuote } from "@/lib/quote"

import { RFP_TEXT, SAMPLES, type SampleId } from "./documents"

/**
 * Mock backend results: one `ScoringResult` per sample, in exactly the shape
 * `POST /score` returns (`app/schema.d.ts`). The judgments are authored; the
 * shape is the backend's. They run through `adapt.ts` like a live result
 * would, so wiring the backend later changes nothing downstream.
 *
 * Every quote is verbatim from its source and checked at load in dev, the
 * same check the backend's grounding step performs.
 */

const R = {
  dashboard:
    "A **web-based dashboard** showing real-time inventory levels across all 6 warehouses.",
  alerts:
    "**Automated low-stock alerts** sent to warehouse managers when items fall below a configurable threshold.",
  postgres:
    "Integration with our **existing PostgreSQL inventory database** — no migration to a new database.",
  roles:
    "**Role-based access** — warehouse managers should only see their own site; HQ staff should see all sites.",
  rollout:
    "A **data migration / onboarding plan** for rolling this out across all 6 sites with minimal disruption.",
  support: "**Support & maintenance terms** after go-live (response times, SLAs).",
  risks:
    "Clear documentation of any **assumptions, limitations, or risks**, since inventory decisions will be made based on this system.",
  budget: "€80,000–€120,000 total, including first year of support.",
  timeline:
    "Working pilot at one warehouse within 3 months; full rollout to all 6 sites within 6 months.",
}

/** LLM call 1 — the same RFP, so the same extraction for every sample. */
const REQUIREMENTS: ScoringResult["requirements"] = [
  { id: "r1", label: "Web-based dashboard", rfpQuote: R.dashboard, section: "Requirements" },
  { id: "r2", label: "Low-stock alerts", rfpQuote: R.alerts, section: "Requirements" },
  { id: "r3", label: "Existing PostgreSQL, no migration", rfpQuote: R.postgres, section: "Requirements" },
  { id: "r4", label: "Role-based access", rfpQuote: R.roles, section: "Requirements" },
  { id: "r5", label: "Rollout / onboarding plan", rfpQuote: R.rollout, section: "Requirements" },
  { id: "r6", label: "Support & maintenance terms", rfpQuote: R.support, section: "Requirements" },
  { id: "r7", label: "Assumptions, limitations, risks", rfpQuote: R.risks, section: "Requirements" },
  { id: "r8", label: "Budget", rfpQuote: R.budget, section: "Budget" },
  { id: "r9", label: "Timeline", rfpQuote: R.timeline, section: "Timeline" },
]

const NONE = "No change needed."

const meta = (durationMs: number): ScoringResult["meta"] => ({
  model: "mock",
  temperature: 0.1,
  durationMs,
  ungroundedDropped: 0,
  cacheHit: true,
})

/* -------------------------------------------------------------------- weak */

const WEAK: ScoringResult = {
  overall: 1.71,
  weights: {},
  requirements: REQUIREMENTS,
  coverage: [
    {
      requirementId: "r1",
      status: "PARTIAL",
      proposalQuote:
        "We will build a cloud-based dashboard that displays inventory data in real time.",
      explanation:
        "A real-time dashboard is promised, but never across all six warehouses by name.",
      fix: "Name the sites in Our Approach: the dashboard shows live stock across all 6 NordFrame warehouses in Germany and Austria.",
    },
    {
      requirementId: "r2",
      status: "PARTIAL",
      proposalQuote: "Notifications for low stock",
      explanation: "Four words. No configurable threshold, and no mention of who is notified.",
      fix: "In Features, state that low-stock alerts go to the responsible warehouse manager and that the threshold is configurable per item.",
    },
    {
      requirementId: "r3",
      status: "MISSING",
      proposalQuote: null,
      explanation:
        "The RFP requires integration with the existing PostgreSQL database with no migration to a new one. 'Cloud-based dashboard' does not confirm that constraint is respected — and a client who has written it down is reading for it.",
      fix: "The dashboard connects directly to your existing PostgreSQL inventory database. No migration and no schema changes are required; we read from it in place.",
    },
    {
      requirementId: "r4",
      status: "PARTIAL",
      proposalQuote: "Secure login for different users",
      explanation:
        "The RFP asks specifically that warehouse managers see only their own site and HQ staff see all six. 'Secure login for different users' describes authentication, not the access split they asked for.",
      fix: "State it in their words: warehouse managers see only their assigned site's inventory; HQ staff see all 6 sites. Access is enforced on the query, not hidden in the interface.",
    },
    {
      requirementId: "r5",
      status: "MISSING",
      proposalQuote: null,
      explanation:
        "Requirement 5 asks for a rollout plan across all six sites with minimal disruption. Nothing in the proposal addresses it, and rollout risk is what a six-site operator worries about most.",
      fix: "Add a Rollout Plan section: the order sites go live, one pilot warehouse first, then the remaining five in batches, and how each site keeps running on its current process until its data is confirmed.",
    },
    {
      requirementId: "r6",
      status: "MISSING",
      proposalQuote: null,
      explanation:
        "Requirement 6 explicitly asks for response times and SLA terms after go-live. The document ends without mentioning support at all.",
      fix: "Add a Support & Maintenance section with concrete commitments: response time for a critical issue, response time for a minor one, the hours they apply in, and what is included in year one.",
    },
    {
      requirementId: "r7",
      status: "MISSING",
      proposalQuote: null,
      explanation:
        "Requirement 7 asks for these in writing, and says why: inventory decisions will be made on the back of this system. Silence reads as either not having looked or not wanting to say.",
      fix: "Add a short Risks & Assumptions section naming at least one real dependency — database access being granted, onboarding time per site, or the accuracy of the legacy data — and what happens to the schedule if it slips.",
    },
    {
      // Deferred outright, so MISSING; the passage is quoted so the fix can land after it.
      requirementId: "r8",
      status: "MISSING",
      proposalQuote:
        "Pricing will be provided upon further discussion of detailed requirements, and will depend on final scope.",
      explanation:
        "The RFP gives a budget band of €80,000 to €120,000 including first-year support. Deferring entirely leaves the client unable to compare this against any other response.",
      fix: "Give at least a rough breakdown inside the stated band, even where final numbers depend on discovery:\n  Dashboard and database integration — € [X – fill in]\n  Alerts and role-based access — € [X – fill in]\n  Rollout across 6 sites — € [X – fill in]\n  Year 1 support — € [X – fill in]\n  Total — € [X – fill in], within your stated budget.",
    },
    {
      requirementId: "r9",
      status: "MISSING",
      proposalQuote:
        "We will begin work shortly after contract signing and aim to deliver the solution in a timely manner, with regular updates along the way.",
      explanation:
        "The RFP names two gates: a working pilot at one warehouse within 3 months, and all six sites within 6 months. A response with no dates cannot be judged against either, and the decision is made at the end of this quarter.",
      fix: "Add a milestone table mapping to the RFP's own gates:\n  Pilot live at warehouse 1 — week [X – fill in], inside your 3-month target\n  Validation in parallel with current process — weeks [X – fill in]\n  Remaining 5 sites — weeks [X – fill in], inside your 6-month target",
    },
  ],
  scores: [
    {
      id: "problem_understanding",
      label: "Problem understanding",
      score: 3,
      rationale:
        "States the general problem correctly, but only at surface level: 'better visibility into warehouse inventory' never names the six sites, the two countries, or the legacy system the dashboard has to live alongside.",
      evidenceQuote: "NordFrame needs better visibility into warehouse inventory.",
      source: "proposal",
    },
    {
      id: "scope_clarity",
      label: "Scope & deliverables clarity",
      score: 2,
      rationale:
        "The feature list is three lines long and every line is generic. Nothing states what is included or excluded, and no deliverable is specific enough to hold anyone to.",
      evidenceQuote: "Real-time inventory dashboard",
      source: "proposal",
    },
    {
      id: "pricing_clarity",
      label: "Pricing clarity",
      score: 1,
      rationale:
        "Entirely deferred — 'provided upon further discussion'. The RFP states a budget band, so a figure could have been checked against it.",
      evidenceQuote: "Pricing will be provided upon further discussion of detailed requirements",
      source: "proposal",
    },
    {
      id: "timeline_clarity",
      label: "Timeline clarity",
      score: 1,
      rationale:
        "No dates and no milestones. 'In a timely manner' is offered against an RFP that names a 3-month pilot and a 6-month rollout.",
      evidenceQuote: "aim to deliver the solution in a timely manner",
      source: "proposal",
    },
    {
      id: "completeness",
      label: "Completeness vs RFP",
      score: 2,
      rationale:
        "Requirements 1 and 2 are gestured at. Four of the seven numbered requirements are unaddressed, including the PostgreSQL constraint the RFP states twice over.",
      evidenceQuote: null,
      source: null,
    },
    {
      id: "tone_persuasiveness",
      label: "Tone & persuasiveness",
      score: 2,
      rationale:
        "Readable and free of jargon, but generic and boilerplate, not tailored to NordFrame. 'Modern, scalable cloud architecture and industry best practices' would sit unchanged in any proposal to any client.",
      evidenceQuote:
        "The system will be built using modern, scalable cloud architecture and industry best practices to ensure reliability and performance.",
      source: "proposal",
    },
    {
      id: "risk_transparency",
      label: "Risk & assumptions transparency",
      score: 1,
      rationale:
        "Nothing disclosed anywhere. Requirement 7 asks for this directly and gives the reason: inventory decisions will be made on this system.",
      evidenceQuote: R.risks,
      source: "rfp",
    },
  ],
  risks: [
    {
      type: "OVERCOMMIT",
      proposalQuote:
        "We will build a cloud-based dashboard that displays inventory data in real time.",
      rfpQuote: R.postgres,
      explanation:
        "A cloud-hosted dashboard is promised without saying how it reaches the PostgreSQL database the RFP requires to stay in place.",
      severity: "LOW",
      fix: "State where the dashboard is hosted and how it connects to the existing database — a read-only connector, with no data copied out.",
    },
  ],
  meta: meta(41_200),
}

/* ------------------------------------------------------------------ medium */

const MEDIUM: ScoringResult = {
  overall: 2.86,
  weights: {},
  requirements: REQUIREMENTS,
  coverage: [
    {
      requirementId: "r1",
      status: "ADDRESSED",
      proposalQuote:
        "**Dashboard**: real-time inventory levels across all 6 warehouses, built on top of your existing PostgreSQL database — no database migration required.",
      explanation: "Named exactly as asked, across all six sites.",
      fix: NONE,
    },
    {
      requirementId: "r2",
      status: "ADDRESSED",
      proposalQuote:
        "**Low-stock alerts**: configurable thresholds per item, notifying warehouse managers automatically.",
      explanation: "Configurable per item, routed to the responsible manager.",
      fix: NONE,
    },
    {
      requirementId: "r3",
      status: "ADDRESSED",
      proposalQuote:
        "built on top of your existing PostgreSQL database — no database migration required.",
      explanation:
        "States the constraint back: built on the existing database, no migration required.",
      fix: NONE,
    },
    {
      requirementId: "r4",
      status: "ADDRESSED",
      proposalQuote:
        "**Role-based access**: warehouse managers see only their own site's data; HQ staff have visibility across all sites.",
      explanation: "The split is stated in the client's own terms.",
      fix: NONE,
    },
    {
      requirementId: "r5",
      status: "PARTIAL",
      proposalQuote:
        "**Rollout approach**: we will onboard warehouses in phases rather than all at once, to reduce disruption during the transition.",
      explanation:
        "The RFP asks for a plan, not an approach. The instinct is correct and matches what the client said they care about, which makes it worth the extra four lines to turn into something they can hold you to.",
      fix: "Name the sequence: pilot site first, a validation period running alongside the existing spreadsheet process to prove the numbers match, then the remaining five in two batches.",
    },
    {
      requirementId: "r6",
      status: "MISSING",
      proposalQuote: null,
      explanation:
        "Requirement 6 asks for response times and SLAs after go-live. This response answers the first four requirements well, which makes the omission stand out rather than blend in.",
      fix: "Add a Support & Maintenance section: response time for a system-down issue, response time for a minor one, the hours they apply in, and confirmation that year one is included in the quoted range.",
    },
    {
      requirementId: "r7",
      status: "MISSING",
      proposalQuote: null,
      explanation:
        "Requirement 7 asks for these explicitly. The proposal already depends on database access and on sites being available to onboard — both are assumptions worth stating rather than discovering later.",
      fix: "Add Risks & Assumptions: read access to the production PostgreSQL database is granted without schema changes; each site can free a point of contact for onboarding; alert thresholds need tuning in the first weeks after each site goes live.",
    },
    {
      requirementId: "r8",
      status: "PARTIAL",
      proposalQuote:
        "Our typical packages for a project of this scope range from €70,000 to €110,000 depending on final integration complexity. We will provide a firm quote after discovery.",
      explanation:
        "A €40,000 spread on a €120,000 ceiling is a third of the budget left open. The band sits inside theirs, which is good, but a breakdown would show where the variance actually lives.",
      fix: "Break the range into its parts and say what moves: the dashboard and integration are fixed; only the connector work varies with schema complexity, between € [X – fill in] and € [X – fill in].",
    },
    {
      requirementId: "r9",
      status: "PARTIAL",
      proposalQuote:
        "We will begin with discovery and design, followed by a pilot phase, and aim to complete full rollout within the timeframe you've outlined. Exact scheduling will be confirmed once we begin discovery.",
      explanation:
        "The phases are right but the client has to supply the dates themselves. The RFP gives two concrete gates to commit against, and a decision is made at the end of this quarter.",
      fix: "Put weeks against the phases you already named:\n  Discovery and design — weeks 1 to [X – fill in]\n  Pilot at warehouse 1 — live by week [X – fill in], inside your 3-month target\n  Remaining 5 sites — weeks [X – fill in] to [X – fill in], inside your 6-month target",
    },
  ],
  scores: [
    {
      id: "problem_understanding",
      label: "Problem understanding",
      score: 4,
      rationale:
        "Names the six warehouses, the spreadsheets and the legacy system. Reads the situation correctly but stops there; it never names what the client said matters most, which is continuity during the switch.",
      evidenceQuote:
        "NordFrame's six warehouses currently rely on spreadsheets and a legacy system, making real-time visibility difficult.",
      source: "proposal",
    },
    {
      id: "scope_clarity",
      label: "Scope & deliverables clarity",
      score: 4,
      rationale:
        "Four deliverables, each stated specifically enough to hold to. Rollout is described as an approach rather than a plan: 'in phases' without saying how many, in what order, or over what period.",
      evidenceQuote: "we will onboard warehouses in phases rather than all at once",
      source: "proposal",
    },
    {
      id: "pricing_clarity",
      label: "Pricing clarity",
      score: 3,
      rationale:
        "A band is given, and it sits inside the client's own budget. Still a range with a firm quote deferred to discovery, and no breakdown showing what the €40,000 spread buys.",
      evidenceQuote: "We will provide a firm quote after discovery.",
      source: "proposal",
    },
    {
      id: "timeline_clarity",
      label: "Timeline clarity",
      score: 2,
      rationale:
        "Phases are named in order but carry no dates, and 'within the timeframe you've outlined' asks the client to supply the commitment themselves.",
      evidenceQuote: "aim to complete full rollout within the timeframe you've outlined",
      source: "proposal",
    },
    {
      id: "completeness",
      label: "Completeness vs RFP",
      score: 3,
      rationale:
        "Requirements 1 to 4 are addressed directly and correctly. Requirements 6 and 7 — support terms and risk disclosure — are absent, and requirement 5 is gestured at rather than planned.",
      evidenceQuote: null,
      source: null,
    },
    {
      id: "tone_persuasiveness",
      label: "Tone & persuasiveness",
      score: 3,
      rationale:
        "Plain, specific, and free of superlatives. The closing section is one sentence about the vendor's track record with no named client or outcome behind it.",
      evidenceQuote:
        "Clarion has delivered inventory and logistics dashboards for several mid-size distribution companies across the DACH region.",
      source: "proposal",
    },
    {
      id: "risk_transparency",
      label: "Risk & assumptions transparency",
      score: 1,
      rationale:
        "No assumption, limitation or risk anywhere, against a requirement that asks for them by name.",
      evidenceQuote: R.risks,
      source: "rfp",
    },
  ],
  risks: [],
  meta: meta(38_700),
}

/* ------------------------------------------------------------------ strong */

const STRONG: ScoringResult = {
  overall: 4.86,
  weights: {},
  requirements: REQUIREMENTS,
  coverage: [
    {
      requirementId: "r1",
      status: "ADDRESSED",
      proposalQuote:
        "Live inventory levels across all 6 warehouses, refreshed continuously from your existing PostgreSQL database via a read-only connector",
      explanation: "Live across all six, refreshed continuously from the existing database.",
      fix: NONE,
    },
    {
      requirementId: "r2",
      status: "ADDRESSED",
      proposalQuote:
        "Configurable per-item thresholds; alerts sent by email/SMS to the responsible warehouse manager automatically.",
      explanation: "Configurable per item, routed to the responsible manager.",
      fix: NONE,
    },
    {
      requirementId: "r3",
      status: "ADDRESSED",
      proposalQuote: "via a read-only connector — **no migration or schema changes required.**",
      explanation: "Read-only connector, stated in bold: no migration or schema changes required.",
      fix: NONE,
    },
    {
      requirementId: "r4",
      status: "ADDRESSED",
      proposalQuote:
        "Warehouse managers see only their own site's inventory; HQ staff have company-wide visibility. Access is enforced at the database query level, not just hidden in the UI.",
      explanation: "The split is exact, and enforced at the query rather than in the interface.",
      fix: NONE,
    },
    {
      requirementId: "r5",
      status: "ADDRESSED",
      proposalQuote: "| Pilot | 1 warehouse, Weeks 1–10 (within your 3-month target) |",
      explanation:
        "A three-step table with weeks, including a parallel-run validation before cutover.",
      fix: NONE,
    },
    {
      requirementId: "r6",
      status: "ADDRESSED",
      proposalQuote:
        "Included in Year 1 pricing below: 24-hour response time for critical issues (system down), 3-business-day response for minor issues, during CET business hours.",
      explanation: "24 hours for critical, 3 business days for minor, with the hours stated.",
      fix: NONE,
    },
    {
      requirementId: "r7",
      status: "PARTIAL",
      proposalQuote:
        "Assumes read access to the existing PostgreSQL database can be granted without changes to your production schema; confirmed feasible based on the schema summary shared during scoping.",
      explanation:
        "Requirement 7 asks for assumptions, limitations and risks. Two of the three are covered thoroughly. Limitations — what this system will not tell them — is the one a client discovers after go-live if nobody writes it down.",
      fix: "Add one line to the same section: the dashboard reflects what is in PostgreSQL, so stock that has not been booked in will not appear; it reports current levels rather than forecasting demand.",
    },
    {
      requirementId: "r8",
      status: "ADDRESSED",
      proposalQuote: "| **Total** | **€102,000** (within your stated budget) |",
      explanation: "€102,000, itemised, and explicitly placed inside the stated band.",
      fix: NONE,
    },
    {
      requirementId: "r9",
      status: "ADDRESSED",
      proposalQuote:
        "| Phased rollout | Remaining 5 warehouses added in 2 batches, Weeks 13–24 (within your 6-month target) |",
      explanation: "Both of the RFP's gates are named and met, in weeks.",
      fix: NONE,
    },
  ],
  scores: [
    {
      id: "problem_understanding",
      label: "Problem understanding",
      score: 5,
      rationale:
        "Names the six sites, both countries, the spreadsheets and the legacy system — and then names the actual constraint: no disruption to data infrastructure or operations during rollout. It reads as though the RFP was read twice.",
      evidenceQuote:
        "without disrupting existing data infrastructure or operations during rollout.",
      source: "proposal",
    },
    {
      id: "scope_clarity",
      label: "Scope & deliverables clarity",
      score: 5,
      rationale:
        "Five numbered deliverables, each specific enough to hold to, with no unasked-for scope attached. Alerts are offered by email and SMS where the RFP asked only that managers be notified; SMS carries a cost nobody has priced.",
      evidenceQuote:
        "alerts sent by email/SMS to the responsible warehouse manager automatically.",
      source: "proposal",
    },
    {
      id: "pricing_clarity",
      label: "Pricing clarity",
      score: 5,
      rationale:
        "Four line items, a total of €102,000, and it states that the figure sits inside the client's band.",
      evidenceQuote: "**€102,000** (within your stated budget)",
      source: "proposal",
    },
    {
      id: "timeline_clarity",
      label: "Timeline clarity",
      score: 5,
      rationale:
        "Weeks against every step, and each one is mapped explicitly back to the RFP's own 3-month and 6-month gates. The end-of-quarter decision date is never acknowledged, so week 1 has no anchor in the calendar.",
      evidenceQuote: "Weeks 1–10 (within your 3-month target)",
      source: "proposal",
    },
    {
      id: "completeness",
      label: "Completeness vs RFP",
      score: 5,
      rationale:
        "All seven numbered requirements are answered, plus budget and timeline. The no-migration constraint is stated back in bold.",
      evidenceQuote: "**no migration or schema changes required.**",
      source: "proposal",
    },
    {
      id: "tone_persuasiveness",
      label: "Tone & persuasiveness",
      score: 4,
      rationale:
        "Confident without superlatives. It earns trust by being checkable rather than by claiming to be trustworthy. The closing line cites two logistics operators without naming either or saying what was delivered.",
      evidenceQuote:
        "We've delivered similar inventory visibility platforms for two regional logistics operators in the past two years, both still in production today.",
      source: "proposal",
    },
    {
      id: "risk_transparency",
      label: "Risk & assumptions transparency",
      score: 5,
      rationale:
        "Three assumptions, each naming the dependency and what happens to the plan if it does not hold. The RFP asks for limitations as well; what the system will not do is not stated.",
      evidenceQuote: "delays here would shift the Week 13–24 plan proportionally.",
      source: "proposal",
    },
  ],
  risks: [],
  meta: meta(44_900),
}

/* ------------------------------------------------------------- overpromise */

const OVERPROMISE: ScoringResult = {
  overall: 1.71,
  weights: {},
  requirements: REQUIREMENTS,
  coverage: [
    {
      requirementId: "r1",
      status: "ADDRESSED",
      proposalQuote:
        "**Real-time dashboard** across all 6 warehouses, plus predictive analytics on top.",
      explanation: "Covered, with predictive analytics attached that nobody asked for.",
      fix: NONE,
    },
    {
      requirementId: "r2",
      status: "PARTIAL",
      proposalQuote: "**Real-time alerts** across all locations simultaneously.",
      explanation:
        "No configurable threshold, and alerts go everywhere at once rather than to the responsible manager.",
      fix: "State that alerts are configurable per item and routed to the responsible warehouse manager, not broadcast to every location.",
    },
    {
      requirementId: "r3",
      status: "CONTRADICTED",
      proposalQuote:
        "**Full platform migration**: we recommend migrating away from your current PostgreSQL database to our proprietary cloud data platform for best performance and scalability.",
      explanation:
        "Requirement 3 asks for integration with the existing PostgreSQL database and says 'no migration to a new database' in as many words. This proposes the opposite, as the lead item. It is the single fastest way for this response to be set aside, and it takes a proprietary-platform lock-in with it.",
      fix: "Replace the lead item: the dashboard reads from your existing PostgreSQL database in place, through a read-only connector. No migration, no schema change, and no new data platform to depend on.",
    },
    {
      requirementId: "r4",
      status: "MISSING",
      proposalQuote: null,
      explanation:
        "Requirement 4 is specific: managers see only their own site, HQ sees all six. It appears nowhere, on a proposal that found room for supplier performance scoring.",
      fix: "Add it as a named deliverable: warehouse managers see only their assigned site's inventory; HQ staff see all 6 sites; the restriction is enforced on the query rather than in the interface.",
    },
    {
      requirementId: "r5",
      status: "MISSING",
      proposalQuote: null,
      explanation:
        "Requirement 5 asks for a rollout plan across six sites with minimal disruption. This proposal changes more than any other — a new data platform underneath six live warehouses — and is the only one with no plan for landing it.",
      fix: "Add a Rollout Plan: which site goes first, how long it runs alongside the current process before cutover, and the order the remaining five follow.",
    },
    {
      requirementId: "r6",
      status: "PARTIAL",
      proposalQuote:
        "including the data platform migration, all AI modules, and one year of support.",
      explanation: "One year of support is priced in. No response times and no SLA.",
      fix: "Add response times and SLA terms for year one: hours of cover, time to first response for a system-down issue and for a minor one.",
    },
    {
      requirementId: "r7",
      status: "MISSING",
      proposalQuote: null,
      explanation:
        "Requirement 7 asks for risks, and this proposal carries the most of any: a production database migration, a proprietary platform, and an eight-week schedule. Disclosing none of it is the part a technical reviewer will circle.",
      fix: "If the migration stays in the proposal, its risks belong in it: what happens to inventory accuracy during cutover, what the rollback is, and what the client depends on afterwards that they do not depend on today.",
    },
    {
      requirementId: "r8",
      status: "ADDRESSED",
      proposalQuote: "Total project cost: **€98,000**, covering the full suite described above",
      explanation:
        "€98,000, inside the band — though for a scope that makes the figure hard to credit.",
      fix: NONE,
    },
    {
      requirementId: "r9",
      status: "PARTIAL",
      proposalQuote:
        "we are confident we can deliver the complete suite — including the platform migration and all analytics modules — within **8 weeks**",
      explanation:
        "Beats both gates on paper, at eight weeks including a database migration. No milestones behind it.",
      fix: "Drop the migration, then commit to their gates rather than beating them: pilot live at one warehouse by week [X – fill in] inside your 3-month target, all six sites by week [X – fill in] inside your 6-month target, with a parallel-run validation before each cutover.",
    },
  ],
  scores: [
    {
      id: "problem_understanding",
      label: "Problem understanding",
      score: 2,
      rationale:
        "Correctly identifies inventory visibility as the subject, then opens by telling the client their own brief was too small. 'NordFrame deserves more than a simple dashboard' answers a question nobody asked, while the constraint they wrote down twice goes the other way.",
      evidenceQuote: "NordFrame deserves more than a simple dashboard.",
      source: "proposal",
    },
    {
      id: "scope_clarity",
      label: "Scope & deliverables clarity",
      score: 1,
      rationale:
        "Six deliverables, four of which were never requested — forecasting, reorder recommendations, supplier scoring, and a platform migration the RFP rules out. Two requirements that were asked for are missing entirely.",
      evidenceQuote: "**AI demand forecasting** to predict stock needs weeks in advance.",
      source: "proposal",
    },
    {
      id: "pricing_clarity",
      label: "Pricing clarity",
      score: 3,
      rationale:
        "A single total is stated and it sits inside the client's band. €98,000 covers a platform migration, four analytics modules and a year of support, with no breakdown; the number reads as unserious rather than competitive.",
      evidenceQuote: "Total project cost: **€98,000**",
      source: "proposal",
    },
    {
      id: "timeline_clarity",
      label: "Timeline clarity",
      score: 1,
      rationale:
        "Eight weeks for a database migration plus four AI modules, against an RFP that allows three months for a single-warehouse pilot. No milestones, and the phrase doing the work is 'accelerated delivery methodology'.",
      evidenceQuote: "Given our accelerated delivery methodology",
      source: "proposal",
    },
    {
      id: "completeness",
      label: "Completeness vs RFP",
      score: 2,
      rationale:
        "The dashboard and alerts requirements are covered. Role-based access and the rollout plan are absent, support terms are a single clause, and requirement 3 is not merely missed but reversed.",
      evidenceQuote: null,
      source: null,
    },
    {
      id: "tone_persuasiveness",
      label: "Tone & persuasiveness",
      score: 2,
      rationale:
        "Energetic and clearly written, but the energy is pointed at the vendor's capabilities rather than the client's problem. 'Cutting-edge', 'full power', 'maximum performance' carry the argument where specifics should.",
      evidenceQuote: "Vantix specializes in cutting-edge AI transformation",
      source: "proposal",
    },
    {
      id: "risk_transparency",
      label: "Risk & assumptions transparency",
      score: 1,
      rationale:
        "None disclosed, on the proposal with by far the most to disclose: a production database migration on an eight-week schedule.",
      evidenceQuote: R.risks,
      source: "rfp",
    },
  ],
  risks: [
    {
      type: "UNREALISTIC_TIMELINE",
      proposalQuote: "within **8 weeks**, well ahead of typical industry timelines.",
      rfpQuote: R.timeline,
      explanation:
        "The RFP allows three months for a pilot at one warehouse. This promises a production database migration and four analytics modules across six sites in eight weeks. A client who has run a migration will read this as inexperience rather than speed.",
      severity: "HIGH",
      fix: "Commit to the RFP's own gates with a milestone table, and keep a parallel-run validation before each cutover.",
    },
    {
      type: "SCOPE_CREEP",
      proposalQuote:
        "combining real-time inventory visibility with predictive demand forecasting, automated reorder recommendations, supplier performance scoring, and a complete migration to a modern cloud-native data platform for maximum performance.",
      rfpQuote: R.dashboard,
      explanation:
        "Three of these were never requested, and they arrive in a document that is missing two requirements that were. Unasked-for scope against a fixed budget invites one question: what did it displace?",
      severity: "MEDIUM",
      fix: "Deliver the seven requirements first, then offer the rest honestly: 'Forecasting, reorder recommendations and supplier scoring are available as a later phase, priced separately, once the dashboard is live across all six sites.'",
    },
    {
      type: "PRICING_MISMATCH",
      proposalQuote:
        "Total project cost: **€98,000**, covering the full suite described above, including the data platform migration, all AI modules, and one year of support.",
      rfpQuote: R.budget,
      explanation:
        "€98,000 for a platform migration, four AI modules and a year of support leaves no room in the number for the migration alone; either the scope is not real or the price is not.",
      severity: "MEDIUM",
      fix: "Price the seven requirements on their own, itemised, and quote the extra modules separately.",
    },
  ],
  meta: meta(47_300),
}

export const RESULTS: Record<SampleId, ScoringResult> = {
  weak: WEAK,
  medium: MEDIUM,
  strong: STRONG,
  overpromise: OVERPROMISE,
}

/**
 * The backend's grounding step, applied to the mocks: every quote must be a
 * verbatim substring of its source. Runs once at load in dev and throws with
 * the full list, so an authoring slip cannot ship silently.
 */
export function assertGrounded(): void {
  const misses: string[] = []
  const check = (where: string, source: string, quote: string | null | undefined) => {
    if (quote && !findQuote(source, quote)) misses.push(`${where}: “${quote.slice(0, 60)}…”`)
  }
  for (const [id, result] of Object.entries(RESULTS) as [SampleId, ScoringResult][]) {
    const proposal = SAMPLES[id].text
    for (const r of result.requirements) check(`${id} ${r.id}.rfpQuote`, RFP_TEXT, r.rfpQuote)
    for (const c of result.coverage) check(`${id} coverage ${c.requirementId}`, proposal, c.proposalQuote)
    for (const s of result.scores) {
      check(`${id} score ${s.id}`, s.source === "rfp" ? RFP_TEXT : proposal, s.evidenceQuote)
    }
    result.risks.forEach((k, i) => {
      check(`${id} risk ${i + 1}.proposalQuote`, proposal, k.proposalQuote)
      check(`${id} risk ${i + 1}.rfpQuote`, RFP_TEXT, k.rfpQuote)
    })
  }
  if (misses.length) throw new Error(`Ungrounded mock quotes:\n${misses.join("\n")}`)
}

if (import.meta.env.DEV) assertGrounded()
