# Pair 2 — Michigan RFP 250000000859, Laboratory Information Management System (MDHHS)

Source: the State's Award Recommendation and Evaluation Synopsis (Notice of Intent to Award
260000000085, 3 December 2025). Four bidders; 104 of 130 technical points needed to have pricing
evaluated.

| Bidder | Technical score | Result |
|---|---|---|
| Clinisys, Inc | 107.25 / 130 | Award, USD 4,215,779 over five years |
| LabVantage Solutions | 106.75 | passed technical |
| LabWare Holdings | 105.4 | passed technical; could not name dedicated personnel in negotiations |
| OnQ Software Pty Ltd | 48.5 | did not meet the requirements |

## What the evaluators held against OnQ (the loser, the file we test)

- Did not agree to the State's contract terms and submitted redlines (Vendor Questions Worksheet, 0/1).
- Sections 4–7 (5/8.5): no PATs for 5#1; 7.2.1.7, .8, .9, .14, .16, .18 not met.
- Sections 8–13 (12.5/62.5): 8.2.7, 8.3.1–8.3.7, 8.4.1, 8.4.2, 8.5.4, 9.5.4, 13.1.x, 13.2.x not met out
  of the box and require customization, "an important factor in a public health LIMS"; 9.4.7 not met;
  9.5.3 only cut-off values; no configuration detail or risk for 9.6.2, 9.6.6, 13.5.2; 11.3.3 and
  11.5.5 not met; partner "Synci Lab IoT Platform" named for 13.1.1 with no documentation; 13.2.1 and
  13.2.2 answers contradict each other.
- Sections 14–26 (18/30): 14.1.5, 14.1.7, 14.3.2, 16.2.1, 16.2.2, 16.2.4 not met; the State cannot
  configure its retention schedule (18.7); **offshore resources would access State data, prohibited
  under this RFP (21.3#1)**; no direct experience migrating a legacy public-health LIMS (23#4);
  training delegated to the partner JMC (25#1) and only a generic training sample (25#2); transition
  plan without in/out detail (26).
- Sections 27–36 (13/28): agreed to 27#1–4 without examples; **key personnel in 30.1, 30.2, 30.3 are
  all offshore, not allowable under the contract**; Data Conversion Personnel "to be determined"
  (30.4); support hours promised by JMC while most staff are in Australia (31.1); "an implementation
  project typically doesn't require defect tracking" (35.1); no high-level project plan (35.2#1);
  no release date for version 9.4.2 (36.1#11); only 16 customers on the latest version out of 200
  implementations (36.2#2); **references are all foreign labs, no public-health lab (36.2#3, 36.2#4)**;
  no figure for concurrent licences (36.2#5); largest customer 11 GB, "a very small customer in
  comparison to the scope" (36.7#3); no maximum concurrent users (36.7#7); **ODBC not supported,
  REST API offered instead; the State needs ODBC (36.7#9, #10)**.

## What the evaluators held against Clinisys (the winner)

Redlines to the terms and to Schedule E; some backend items not ADA compliant, no PATs (5#1);
extra cost for double data entry (9.2.1) and configuration (9.2.2); several answers unrelated to the
requirement (9.6.2, 9.7.11, 13.1.1, 13.2.2, 13.7.1); no migration references and only experience
migrating systems they had bought (23#1, 23#5); organisational change management only via a
subcontractor with no hours (30.5); exceptions to background checks (31.2); no concurrent licence
figure (36.2#5); complaint history not described (36.4#5).

## What a correct review of OnQ should therefore show

1. A constraint violation for offshore access and offshore personnel (21.3.5, 31.3, 30.1–30.3).
2. Coverage gaps or partials on the requirement groups the bidder marked "Requires Customization"
   or "Not Available" (8.3.x, 8.4.x, 13.x, 14.x, 16.2.x) and on 36.7#9/#10 (ODBC).
3. A weak experience picture: no public-health LIMS references, 16 of 200 customers on the current
   version, largest installation 11 GB.
4. A low overall, clearly under a "ready" verdict.

## What the reviewer found (run of 18 September 2026, Gemini 3.8 Flash, recorded)

Input: `rfp.md` about 39k tokens (107 sections), `onq.md` about 68k tokens (132 sections).
Five model calls, 67 seconds, USD 0.32. No truncation, 2 quotes dropped, 1 near match.

| Expectation | Result |
|---|---|
| Offshore access and offshore personnel are a disqualifying violation | **Caught twice, both HIGH**: "Prohibition of Offshore System Access" (21.3.5) and "Prohibition of Offshore Resources" (31.3), quoting the bid's own words "team members in Australia and New Zealand who perform level 3 support". |
| A low overall, clearly not ready | **2.4 / 5, "Not ready"**. Pricing 1 (deferred to after discovery), timeline 2 (no dates in the WBS), risk 2 and problem understanding 2 (both citing the offshore contradiction). |
| The bid is weak on requirements the State scored as unmet | **Only partly.** The extraction produced 21 requirements and 9 constraints from a template with about 380 numbered items, so coverage reads 16 addressed, 3 partial, 2 missing and completeness scores 4 / 5. The State's list of unmet items (8.3.x, 8.4.x, 13.x, 14.x, 16.2.x, ODBC) is not visible because those requirements were never extracted one by one. |
| Weak experience picture: foreign references, 16 of 200 on the current version, 11 GB largest customer | **Not flagged.** These live in the Vendor Questions Worksheet and section 36 answers; no finding type covers "insufficient experience". |
| Training delegated to a partner, transition plan without detail | Not flagged. |

Findings the reviewer added on its own: deferred pricing (§4.1, HIGH), a work breakdown without
dates (§33.2, HIGH), an unbounded scalability claim beside the 250-user ceiling (§6, OVERCOMMIT).

### Verdict on the system

The direction and the headline are right: the losing bid comes out "Not ready" with the same
disqualifier the State named, cited to the passage. The depth is not: a real Statement of Work has
hundreds of numbered requirements and one extraction call returns twenty, so requirement-level
gaps are under-reported and completeness is optimistic. The fix is a chunked extraction (one
call per section group, merged) and a coverage pass that runs per chunk when the list is long;
until then, real RFPs should be read as "constraints and the big asks", not as a compliance matrix.

## The winner, for comparison (Clinisys, from the OCR'd scan, same run settings)

Five calls, 41 seconds, USD 0.19. `clinisys.md` about 41k tokens: the bidder's answers only, the
checkbox tables lost to OCR, pricing and the project plan being separate attachments.

| | Clinisys (won, 107.25) | OnQ (lost, 48.5) |
|---|---|---|
| Overall | 2.3 / 5, Not ready | 2.4 / 5, Not ready |
| Violations | 1: offshore resources, a security officer based in the United Kingdom | 2: offshore access, offshore resources |
| Coverage of the 21 extracted requirements | 13 addressed, 6 partial, 2 missing | 16 addressed, 3 partial, 2 missing |
| Pricing / timeline / risk | 1 / 1 / 1 (the answers point to Schedule B and a separate project plan) | 1 / 2 / 2 |
| Findings | "see the separately provided Project Plan", customisation wording, exchange mechanisms "to be determined" | deferred pricing, a WBS without dates, an unbounded scalability claim |

**The reviewer does not reproduce the State's ranking on this pair.** The State separated the two on
Schedule A sections 8–13, the functional requirements (49.75 against 12.5 of 62.5 points), which is
exactly the level the single extraction call does not reach: with 21 requirements for both, coverage
cannot tell a bid that meets the reporting-rules, administration and interface requirements from one
that marks them "requires customization". What the reviewer does see, commercial clarity, is thin in
both bids because both keep pricing and the plan in attachments. The UK security officer is a
defensible catch the State did not raise.

Two changes would make this pair discriminating: chunked extraction so the numbered requirements
are covered one by one, and folding the pricing schedule and project plan attachments into the
proposal text.
