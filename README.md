# Proposal Scorer

Reads a draft proposal against the client's RFP and shows where it falls short, with the
passage behind every judgment so a reviewer can check the call rather than trust a number.
SiviHack 2026, Track 1 (FPT Software Europe).

## 1. What the product is

A reviewer for sales proposals, not a writer of them. Paste or upload the client's RFP and the
draft proposal (Markdown, plain text, or a PDF with a text layer), press **Run review**, and
watch the review arrive stage by stage:

- **Seven criteria scored 1–5** (Appendix A of the brief: problem understanding, scope and
  deliverables, pricing, timeline, completeness vs RFP, tone, risk transparency), each with a
  one-sentence weakness and, where earned, a strength. Completeness is counted in code from
  the coverage table rather than judged by the model. The overall is a weighted mean computed
  in code; the weight sliders recompute it instantly without a model call.
- **Configurable criteria**: switch any of the seven off, change its weight, or add up to
  five of your own (a name and what to check). A custom criterion is scored 1–5 by the model
  in one extra call and cited like the rest; the seven fixed criteria keep their cache.
- **Requirement coverage table** derived from the RFP: every explicit ask marked addressed,
  partial, not found or contradicted, with the RFP passage and the answering proposal passage.
- **Constraint violations kept apart from risk findings**: a proposal that crosses a hard
  client limit (budget, deadline, excluded technology, a system the client said to keep) is
  called out under the verdict, not buried in a list.
- **Every finding points at an exact location**: section id, a verbatim quote verified by
  code against the source text, and a suggested fix ready to copy into the draft.
- **Works without an RFP**: the draft is scored on six criteria and the coverage stage is
  skipped, with the omission stated on screen.
- **AI-suggested weights from the RFP**, which the user accepts or adjusts.
- **Code-derived evidence beside the scores**: the amounts, dates and vague phrases the
  draft contains, each a live citation, under the Pricing and Timeline criteria.
- **Export** of the whole review as Markdown or Word, to hand to the proposal writer.

## 2. Setup and how to run the demo

Docker path (the demo):

```bash
cp app/.env.example app/.env        # then paste GEMINI_API_KEY into app/.env
cd app && docker compose up -d --build
./run.sh warm                       # fill the cache from the recorded answers, no model call
open http://localhost               # the app; the API is proxied under /api
```

Dev path (hot reload):

```bash
cd app && uv sync && uv run --env-file .env uvicorn app.main:app --reload --port 8000   # API docs at :8000/docs
cd frontend && npm ci && VITE_API_URL=/api npm run dev      # http://localhost:5173
```

Offline paths: `uv run --env-file .env.replay uvicorn app.main:app` serves the recorded
Gemini answers for the sample set with no key and no cost; `npm run dev` without
`VITE_API_URL` runs the frontend alone on the recorded results.

Checks: `make check` (backend tests, lint, type checks, frontend build). The manual browser
protocol is in `docs/verification.md`; the spend ledger in `docs/budget.md`.

Demo script (5 minutes): the problem (manual, inconsistent review) → load the weak sample
and run → point at one finding, its quote and its fix → drag a weight slider → load the
overpromising sample and show the constraint violation → open **More test data** and run a
real State of Michigan bid → invite the judge to paste their own pair or upload a PDF from
`sample_data/pdf/`. After `warm` the samples and the real bids answer from the cache (with `USE_CACHE=true`
in `app/.env`, the default); an unseen pair is scored live.

## 3. Tech used

- Backend: Python 3.13, FastAPI (native Server-Sent Events), Pydantic v2, `google-genai`
  with Gemini 3.8 Flash, rapidfuzz and json-repair for grounding and salvage, pymupdf4llm for
  PDF to Markdown; uv, pytest, ruff, basedpyright.
- Frontend: React 19, Vite 8, TypeScript, Tailwind v4, shadcn/ui, TanStack Query
  (streamed query), react-markdown, `eventsource-parser`, zod, `docx` for the Word export;
  types and zod schemas generated from the backend's OpenAPI document with
  `@hey-api/openapi-ts`; oxlint.
- Deployment: Docker Compose with nginx in front (`/api/*` → backend, `/` → the built app).
- Architecture: one extraction call on the RFP (cached by its text), then a coverage call and
  three parallel scoring groups, plus one call for custom criteria when there are any; a
  grounding pass verifies every quote and section; amounts, dates and vague phrases are found
  by code; the completeness score and the overall are computed in code; a disk cache and a
  replay provider make repeated runs and tests free.

## 4. Dataset, API, libraries and template used

- Dataset: `sample_data/` (the sponsor's fictional NordFrame RFP, four responses and a scoring
  example; `sample_data/pdf/` has the same documents as PDF for the upload path, plus a real
  bid and a scanned example, see its README). `docs/realworld/`: four public State of
  Michigan solicitations with ten submitted bids and the State's award synopses as answer
  keys, converted from the public PDFs to text (one scanned bid through macOS OCR); only the
  extracted text is committed and the source URLs are in its README. These are the
  **More test data** entries in the app. `docs/rehearsal/`: a fictional pair written by the
  team. No client data.
- API: the Google Gemini API through the official `google-genai` SDK. No other external service.
- Python libraries: `requirements.txt` at the repository root, generated from `uv.lock` with
  `make requirements` and checked by a test.
- JavaScript libraries: `frontend/package.json`.
- Template: the Vite `react-ts` template with shadcn/ui components.
- Recorded model answers for tests and the offline demo: `app/tests/fixtures/replay`
  (keyed by prompt) and `frontend/src/api/fixtures/results` (full results per sample).

Everything the pitch claims is in this repository: grounded quotes in
`app/src/app/grounding.py`; constraint violations in `app/src/app/schema.py` and
`app/src/app/prompts.py`; split calls, the cache and the custom-criteria call in
`app/src/app/pipeline.py`; completeness, weights and the rubric checks in code (a group may only score its own
criteria, a missing score makes the review partial, a violation caps problem understanding)
in `app/src/app/pipeline.py`, `app/src/app/aggregate.py` and `frontend/src/lib/score.ts`; code-derived signals in `app/src/app/signals.py`; PDF conversion
in `app/src/app/convert.py`; streaming in `app/src/app/main.py` and
`frontend/src/api/stream.ts`; the export in `frontend/src/lib/export.ts`; recorded fixtures
in `app/src/app/replay.py`; the results on the real bids against the State's verdicts in
`docs/realworld/README.md`.

## 5. Current limitations

- PDF upload reads the text layer only: a scanned PDF is refused with a message. PowerPoint
  exports work when exported to PDF with text; there is no OCR in the container.
- English prompts and rubric.
- Five model calls per review, six with custom criteria. Measured on Gemini 3.8 Flash: a
  sample-sized pair costs USD 0.03–0.04 and usually takes 20–40 seconds, over a minute when
  the model is slow; a real bid of 30–100 pages costs USD 0.07–0.57 and takes up to about a
  minute. A free-tier key can hit its per-minute
  limit when two people run at once.
- One extraction call reads the RFP. On a long real solicitation it reaches only a part of
  several hundred numbered requirements, and pricing or plans kept in separate attachments are
  never seen (every Michigan bid scores 1 on pricing). The reviewer reproduces the State's
  ranking and reasons on two of the three multi-bid solicitations, not on the third.
- The rubric's cap for a constraint violation (problem understanding at most 3) is enforced in
  code; the pricing and timeline caps stay instructions to the model, because the amount and
  date detector misses spellings such as "78,500 euros".
- The guard against hallucination covers citations only: every quote is checked against the
  source text and dropped or marked when it is not there, so a finding cannot point at words
  that do not exist. The judgement itself is the model's. The prompts force every score and
  finding to rest on a cited passage, which limits drift but does not remove it: a wrong
  reading of a real passage passes the check.
- The reasoning asked of each scoring group is simple: name the defects first, then score
  against the rubric anchors. There is no deeper chain of thought, self-check or second pass,
  so two runs on the same pair can differ by a few tenths.
- A custom criterion is judged on its one-line instruction with generic 1 / 3 / 5 anchors,
  not a tuned rubric, and it yields a score with citations but no findings of its own.
- Quotes are at most 20 words and are dropped when the model paraphrases (the count is in
  `meta.ungroundedDropped`); a near match is shown with a "≈" mark.
- Completeness is derived from coverage, not judged by the model.
- No authentication and no persistence beyond the on-disk cache; one RFP per run.
- Suggested weights are a heuristic read of the RFP, not a calibrated model.
- In the demo the samples and the real bids answer from the cache; only an unseen pair or an
  uploaded PDF reaches the model.
