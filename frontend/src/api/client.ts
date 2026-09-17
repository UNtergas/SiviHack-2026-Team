import type { Criterion, Review, WeightSuggestion } from "@/api/schema"
import { SAMPLES, type SampleId } from "@/api/fixtures/documents"
import { REVIEWS, WEIGHT_SUGGESTIONS } from "@/api/fixtures/reviews"

/**
 * The one client. Every request in the app originates here, so headers,
 * retries and error handling have exactly one home.
 *
 * SEAM — this build runs on the sponsor's sample set; no n8n webhook exists
 * yet. When one does, the bodies below become POSTs to `VITE_N8N_BASE` and
 * the streaming trace moves to `api/stream.ts` over EventSource. Nothing
 * outside this file changes: the signatures, the step sequence and the error
 * type are what the rest of the app is written against.
 */

const FIXTURE_LATENCY = { step: 420, jitter: 160 }

export class ReviewError extends Error {
  code: "empty-input" | "unknown-document" | "transport" | "upstream"

  constructor(message: string, code: ReviewError["code"]) {
    super(message)
    this.name = "ReviewError"
    this.code = code
  }
}

/** The trace a run emits. Mirrors the n8n node sequence it will become. */
export const RUN_STEPS = [
  { id: "read-r", label: "Reading the RFP" },
  { id: "extract", label: "Extracting client requirements" },
  { id: "collate", label: "Collating the draft against them" },
  { id: "score", label: "Scoring the criteria" },
  { id: "fixes", label: "Drafting suggested fixes" },
] as const

export interface RunOptions {
  onStep?: (index: number) => void
  signal?: AbortSignal
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(t)
      reject(new DOMException("aborted", "AbortError"))
    })
  })

const normalise = (s: string) => s.replace(/\s+/g, " ").trim()

/** Which sample is on the table. Replaced by the model once one is wired up. */
function identify(proposal: string): SampleId | null {
  const needle = normalise(proposal)
  const ids = Object.keys(SAMPLES) as SampleId[]
  return ids.find((id) => normalise(SAMPLES[id].text) === needle) ?? null
}

export async function runReview(
  input: { rfp: string; proposal: string; criteria: Criterion[] },
  opts: RunOptions = {},
): Promise<Review> {
  if (!input.rfp.trim() || !input.proposal.trim()) {
    throw new ReviewError(
      "Both the RFP and the draft proposal are needed before a review can run.",
      "empty-input",
    )
  }

  const sample = identify(input.proposal)
  if (!sample) {
    throw new ReviewError(
      "This build runs on the sample set only — no model is wired up yet. Load one of the four sample responses to see a full review.",
      "unknown-document",
    )
  }

  for (let i = 0; i < RUN_STEPS.length; i++) {
    opts.onStep?.(i)
    await wait(
      FIXTURE_LATENCY.step + Math.random() * FIXTURE_LATENCY.jitter,
      opts.signal,
    )
  }

  return REVIEWS[sample]
}

export async function suggestWeights(
  _rfp: string,
  opts: { signal?: AbortSignal } = {},
): Promise<WeightSuggestion[]> {
  await wait(900, opts.signal)
  return WEIGHT_SUGGESTIONS
}
