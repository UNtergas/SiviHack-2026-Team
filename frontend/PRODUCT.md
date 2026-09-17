# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Sales, pre-sales, and account managers at FPT Software Europe who have a draft proposal in hand and a client deadline in front of them. They want a fast, honest second opinion before it goes out — comparable in usefulness to a quick review from an experienced colleague — without waiting on that colleague's availability.

**Secondary:** Sales managers and directors who do this review manually today. Their review is the thing being made more consistent, not replaced.

**Indirect:** The end client, who receives a clearer, better-matched proposal.

**The situation that defines the product:** the user is under time pressure, usually right before a deadline. That is when review quality slips today, and it is the moment the tool has to be good in.

## Product Purpose

Score and critique an existing draft proposal against the client's RFP, and say exactly what to fix.

The product exists because pre-send review at FPT Software Europe is manual, inconsistent — quality depends on who reviews and how much time they have — and rushed, so weak spots slip through to the client.

Success: a salesperson gets structured, specific, verifiable feedback on a draft in the time it takes to read it, and can act on every item without asking a human what was meant.

## Positioning

**The RFP is the yardstick, and every claim carries its receipt.**

A general writing assistant scores a proposal in isolation and cannot truthfully say whether it answers what *this* client asked for. This product reads the RFP alongside the draft, names the specific requirement that went unaddressed, and cites the exact passage the judgment came from — so the feedback can be verified against source text instead of trusted on faith.

Both halves matter. A rubric score without RFP grounding is generic; a finding without a citation is unverifiable. Neither survives a reviewer who asks "where did you get that?"

## Operating Context

**The organization:** FPT Software Europe, the overseas branch of FPT Software (global IT and digital transformation, headquartered in Vietnam, European HQ in Germany). Enterprise clients across DACH and the wider EU. Scoping and delivering software, cloud, and AI solutions means writing and submitting proposals and client-facing documents as daily sales work.

**The workflow today:** draft written → someone senior reviews manually → send. The review checks whether the draft addresses the client's stated needs, whether pricing and scope are clear, whether it reads persuasive and professional, and whether anything is missing or risky to promise. It is inconsistent and it happens under deadline pressure.

**The evaluation context — a factual part of how this product is judged:**

- Judges interact with it live: they paste or upload a sample proposal and watch feedback produced in real time.
- The sponsor brings an **unseen RFP/proposal pair** on the day, different from the samples given to teams. The tool has to perform on material it has never seen.
- A 7-minute Q&A follows, in which judges verify claims. Technical Assistants (AI-supported) read the repository to check that the code matches the solution presented.
- Two additional judging criteria govern everything: (1) is the feedback specific and actionable, pointing to an exact section/issue, rather than generic "could be clearer"? (2) does the tool meaningfully use the RFP to check the proposal against actual client requirements, rather than scoring it in isolation?
- Built inside a 24-hour hackathon (SiviHack 2026, "Proposal Scorer" challenge, sponsored by FPT Software Europe). Stability at demo time outranks feature count.

## Capabilities and Constraints

**Committed MVP** — cumulative, in build order:

1. **Rubric score with a comment per criterion.** Base criteria are Appendix A's seven: Problem Understanding, Scope & Deliverables Clarity, Pricing Clarity, Timeline Clarity, Completeness vs. RFP Requirements, Tone & Persuasiveness, Risk/Assumptions Transparency.
2. **RFP coverage check.** Flags specific client requirements that are unaddressed, unclear, or mismatched — e.g. "the RFP asks for a maintenance plan; the proposal doesn't mention one."
3. **Citations on every score and finding.** Each piece of feedback points back to where it came from, in the RFP or the proposal, so a reviewer can verify it against source text.
4. **A specific suggested fix per significant issue.** A rewritten paragraph, a drafted addition covering a missing requirement, or clearer phrasing for pricing/timelines. Scoped to the issue found.
5. **Configurable criteria.** Start from the base set; adjust weights, add or remove criteria before scoring. Optionally, let the model read the RFP and propose which criteria matter most for that client.

**Document input:** paste text, and upload `.md` files. Both. PDF is explicitly **out of MVP** — it is §8's bonus criterion, optional and not required, and extraction cost is not worth the demo risk.

**Hard product constraints:**

- **Reviewer, not writer.** The tool evaluates and improves an existing draft. It does not generate proposals from scratch. Suggested fixes stay scoped to an issue the tool actually found.
- **Specific over gentle.** "Section 3 doesn't mention the budget the client specified" is the bar. "Improve clarity" is a failure.
- **No real client data, ever.** Fictional and anonymized samples only.

**Technical constraints:**

- **The frontend speaks the backend's shape, not yet to the backend.** One `client.ts` is the only place a request originates. By default it answers from mock `ScoringResult`s authored for the four samples in exactly the shape `POST /score` returns (`app/schema.d.ts`), adapted into the edition's vocabulary in `api/adapt.ts`. Setting `VITE_API_URL` switches the same path to the live FastAPI backend in `app/` (the plan is `BACKEND.md`) with nothing else changing. Raw `fetch` and `XMLHttpRequest` are banned so headers, retries, and error handling have exactly one home.
- **Streaming is the exception to that shape.** The backend answers once today, so the run trace paces itself through the steps and holds the last one until the answer lands. If a run/events endpoint is added, consume it with `EventSource` in `api/stream.ts`. TanStack Query owns request/response; it is not a streaming tool.
- **Scoring takes seconds on the provided LLM, minutes on a local 7B, and can fail.** Every async view carries all four states — loading, empty, error, success — and a multi-step run shows which step it is on. A blank box for 20 seconds during a live demo loses points.
- **LLM is Ollama locally for test and any OpenAI-compatible endpoint in prod, switched by env (`BACKEND.md` §3).** The backend caches RFP extraction by input hash; build UI against saved real responses rather than live calls. If cached responses are used during the demo, that must be stated to the judges outright — a 7-minute Q&A with people reading the codebase makes discovery likely, and being caught turns a reasonable engineering decision into an honesty problem.

**Undecided, deliberately:**

- The product's own name. "Proposal Scorer" is the challenge title, not a chosen name.
- Interface language. Sample data and the client context are English; the team is Vietnamese. Not established.
- Whether scoring runs stream token-by-token or step-by-step; the trace contract is not yet defined.

## Brand Commitments

None established. FPT Software Europe is the challenge sponsor and the customer in the scenario; no identity, logo, voice, or visual constraint has been made binding, and none should be assumed from the sponsor relationship.

## Evidence on Hand

**In the repository:**

- `TRACK.md` — the sponsor challenge brief. Source of every product fact above.
- Appendix A of `TRACK.md` — the seven scoring criteria, verbatim and usable as the base rubric.
- `sample_data/` — Appendix B's set, received 2026-09-17:
  - `rfp_nordframe.md` — NordFrame Logistics GmbH, a warehouse inventory dashboard for 6 sites across Germany and Austria. Seven numbered requirements, a budget band of EUR 80,000–120,000, and two timeline gates (pilot at 3 months, all sites at 6).
  - `response_1_weak.md` · `response_2_medium.md` · `response_3_strong.md` · `response_4_overpromise.md` — four responses to that one RFP.
  - `scoring_example.md` — **the most load-bearing file in the set.** It is the sponsor's own worked example of good output against the weak response: a rubric table scoring 1.7/5, then Level-2 findings in the form "Missing / Vague / Deferred + the RFP passage + a suggested fix", then a Level-3 citation format. It closes by naming what it is testing for: "pointing to the exact requirement, where it should appear, and a concrete fix — what separates a genuinely useful Proposal Scorer from a generic 'looks good / needs work' tool."

  Every party in these files is fictional and the files say so on their face.

**Never available in advance:** the sponsor's separate validation RFP/proposal pair, used live during judging.

**Does not exist:** real client data, real proposals, customers, testimonials, benchmarks, pricing, or deployment history. Nothing in this category may be invented.

## Product Principles

1. **Every claim is checkable.** A score without a source pointer is a number a reviewer cannot verify and cannot act on. Citations are not a feature tier — they are what makes the output trustworthy.
2. **The RFP is the yardstick.** Nothing is scored in isolation from what this specific client actually asked for.
3. **Review, never author.** The salesperson wrote the draft. The product makes their draft better; it does not replace their voice or write the thing for them.
4. **Specific beats gentle.** Name the section, name the missing requirement, show the fix. Feedback that spares feelings at the cost of precision has failed its only job.
5. **Show the work while it runs.** Scoring is slow and can fail. A run that reveals where it is and admits when it broke earns more trust than one that finishes faster in silence.
