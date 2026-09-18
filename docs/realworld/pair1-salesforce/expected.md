# Pair 1 — Michigan RFP 250000001460, MPSC Salesforce Maintenance and Support (LARA)

Source: the State's Award Letter and Evaluation Synopsis (Notice of Intent 250000000989,
25 August 2025). Fifteen bids; 80 of 100 technical points needed. Criteria: Schedule A Statement of
Work 40; Attachment 1 Business Specification Worksheet 40; Vendor Questions Worksheet 5;
resumes 5; compliance with the State's terms 10.

| Bidder | Technical score | Result |
|---|---|---|
| Aimpoint Technology, LLC | 96 | Award, USD 450,000 |
| Devcare Solutions | 95 | passed |
| Brite Systems | 94 | passed |
| Youngsoft | 93 | passed |
| 580 Strategies | 89 | passed |
| Intellibee | 77 | below threshold |
| Spruce Technology, Truenorth Technologies | 75 | below threshold |
| Global Solutions Group | 74 | below threshold: −15 on the specification worksheet, −8 on scope, −3 staffing |
| Kyra Solutions | 70 | below threshold |
| Slalom | 61 | below threshold: −13 for not accepting the State's terms |
| Provisio Partners, RADcube | disqualified | did not accept the State's contract terms nor submit redlines |
| Cloud Digital | disqualified | no Key Resources and no response to the Business Specification Worksheet |
| HighCloud Solutions | disqualified | no response to the Business Specification Worksheet |

## Bids in this pair

- `aimpoint.md`, the winner (96): the only deductions were −3 for not agreeing to the Schedule D
  service-level terms and −1 on data retention detail.
- `intellibee.md`, Intellibee (77): −15 on the specification worksheet, −6 on scope for answering
  sections 4, 5, 7, 8 and 9 with Salesforce's own material instead of its own approach and for
  suggesting to store data in its own system, −2 on staffing. (Global Solutions Group, 74, did not
  embed the State template in its file and could not be split.)
- `radcube.md`, disqualified for not accepting the contract terms (the Vendor Questions Worksheet
  section 6 answer).
- `highcloud.md`, disqualified for leaving the Business Specification Worksheet unanswered.

## What a correct review should show

1. Aimpoint with the fewest gaps; GSG with more partial and missing answers.
2. HighCloud's worksheet gap visible as a block of missing requirements.
3. RADcube's refusal of the terms surfaced from the worksheet, if the RFP text carries the ask.

## What the reviewer found (18 September 2026, Gemini 3.8 Flash, recorded)

Template from Aimpoint's file (about 13.6k tokens, 42 requirements and 12 constraints extracted,
including the Business Specification Worksheet).

| | Aimpoint (awarded, 96) | Intellibee (77) | RADcube (disqualified) | HighCloud (disqualified) |
|---|---|---|---|---|
| Overall | **3.1 / 5, Fix before sending** | **3.0 / 5, Fix before sending** | **2.4 / 5, Not ready** | **1.7 / 5, Not ready** |
| Coverage | 35 addressed, 2 partial, 4 missing, 1 contradicted | 36 addressed, 4 partial, 2 missing | 35 addressed, 3 partial, 3 missing, 1 contradicted | 20 addressed, 15 partial, 7 missing |
| Violations | none | none | 1 HIGH: CI/CD set-up "may involve further costs" | none |
| Cost, time | USD 0.14, 51 s | USD 0.11, 35 s | USD 0.15, 30 s | USD 0.13, 54 s |

**The State's order is reproduced** (96 > 77 > the two disqualified bids), and both
disqualification reasons surface:

- RADcube: the contradicted requirement is "the bidder explicitly responded No to affirming
  agreement with the attached Contract Terms", the State's own reason. The reviewer also files
  the conditional CI/CD and regression-tool costs as a violation of the fixed-price ask and
  the TBD subcontractor pricing as a HIGH vagueness finding.
- HighCloud: the unanswered Business Specification Worksheet becomes fifteen partial and seven
  missing requirements and a 1.7 overall, the lowest of the four.
- Intellibee: the problem-understanding weakness is that "no additional security measures need
  to be implemented beyond built-in Salesforce features", the pattern the evaluators deducted
  for across five sections (answering with Salesforce's material instead of its own approach);
  the 600 annual support hours are not committed to.
- Aimpoint: the only sharp finding, a requested exemption from the State's SUITE methodology
  (contradicted r33), is real but was not held against it by the State; the missing EEO-1
  report and ICHAT certifications are attachments.

The winner and the runner-up are only 0.14 apart, less than the State's 19 points, because the
40-point specification worksheet is one of 42 extracted requirements here rather than a scored
section of its own, and pricing scores 1 for everyone (Schedule B is a separate file).
