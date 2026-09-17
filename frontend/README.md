# Proposal Scorer — Frontend

SiviHack 2026, FPT Software Europe challenge. Reads a draft proposal against
the client's RFP and shows where it falls short, with the passage behind every
judgment.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and press one of the four sample buttons.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |

## Status

This build runs on the sponsor's sample set. **No model is wired up yet** — the
review for each of the four sample responses is authored in
`src/api/fixtures/reviews.ts`, and pasting an unrecognised document returns a
clear error rather than inventing findings. The weak sample reproduces the
score and findings in `sample_data/scoring_example.md`, which is the sponsor's
own reference for what good output looks like.

## Wiring up the backend

Every request originates in `src/api/client.ts` — `no-restricted-globals` bans
raw `fetch` and `XMLHttpRequest` everywhere else, so headers, retries and error
handling have one home. To go live:

1. Replace the bodies of `runReview` and `suggestWeights` with POSTs to the n8n
   webhook URLs.
2. Move the run trace to `src/api/stream.ts` over `EventSource`. `RUN_STEPS`
   already mirrors the node sequence it should emit.

Nothing outside `src/api/` needs to change: the signatures, the step sequence
and `ReviewError` are what the rest of the app is written against.

## Layout

```
src/
  api/
    schema.ts              the edition's vocabulary — Citation, Requirement, Issue, Review
    client.ts              the one client (fixture-backed; the seam to n8n)
    fixtures/
      documents.ts         the sponsor's .md files, imported verbatim
      reviews.ts           authored findings for all four sample responses
      samples/             copies of sample_data/, so the frontend builds standalone
  components/
    apparatus/             the visual world: sigla, citations, collation, witness panes
    ui/                    shadcn primitives
  features/review/         setup, criteria, run trace, review
  lib/score.ts             weighted scoring, weight redistribution, verdict thresholds
```

Design decisions are recorded in `DESIGN.md`; the surface's direction contract
is in `.impeccable/surfaces/`.

## Stack

React 19 · Vite · TypeScript · Tailwind v4 · shadcn/ui · TanStack Query ·
Brygada 1918 + Archivo, self-hosted so the venue network is not a dependency.
