import type { Criterion, Review, WeightSuggestion } from "@/api/schema"
import type { ScoringResult } from "@/api/backend"
import { adapt } from "@/api/adapt"
import { SAMPLES, type SampleId } from "@/api/fixtures/documents"
import { WEIGHT_SUGGESTIONS } from "@/api/fixtures/criteria"
import { RESULTS } from "@/api/fixtures/results"

/**
 * The one client. Every request in the app originates here, so headers,
 * retries and error handling have exactly one home.
 *
 * By default this build answers from mock results: `ScoringResult`s authored
 * for the four samples in exactly the shape `POST /score` returns. They go
 * through the same adapter a live answer would. Set `VITE_API_URL` (`/api`
 * for the Vite dev proxy or nginx) to switch to the FastAPI backend; nothing
 * outside this file changes.
 */

const API = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || ""

/** True when this build answers from the mock results. */
export const MOCK = API === ""

const MOCK_LATENCY = { step: 420, jitter: 160 }

/** The trace moves on from a step after this long while the model is still working. */
const STEP_PACE = 6000

export class ReviewError extends Error {
  code: "empty-input" | "unknown-document" | "transport" | "upstream"

  constructor(message: string, code: ReviewError["code"]) {
    super(message)
    this.name = "ReviewError"
    this.code = code
  }
}

/** The trace a run emits. The backend does these in this order. */
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

/** Which sample is on the table, for the mock build. */
function identify(proposal: string): SampleId | null {
  const needle = normalise(proposal)
  const ids = Object.keys(SAMPLES) as SampleId[]
  return ids.find((id) => normalise(SAMPLES[id].text) === needle) ?? null
}

async function runMock(
  input: { rfp: string; proposal: string; criteria: Criterion[] },
  opts: RunOptions,
): Promise<Review> {
  const sample = identify(input.proposal)
  if (!sample) {
    throw new ReviewError(
      "This build runs on mock results for the sample set — no backend is wired up. Load one of the four sample responses to see a full review.",
      "unknown-document",
    )
  }
  for (let i = 0; i < RUN_STEPS.length; i++) {
    opts.onStep?.(i)
    await wait(MOCK_LATENCY.step + Math.random() * MOCK_LATENCY.jitter, opts.signal)
  }
  return adapt(RESULTS[sample], input)
}

/**
 * The backend answers once, after two model calls. The trace paces itself
 * through the steps it knows are happening and holds the last one until the
 * answer lands, so it never claims a step the model has not finished.
 */
function pace(onStep: RunOptions["onStep"], signal?: AbortSignal) {
  let step = 0
  onStep?.(step)
  const timer = setInterval(() => {
    if (step < RUN_STEPS.length - 2) onStep?.(++step)
  }, STEP_PACE)
  const stop = () => clearInterval(timer)
  signal?.addEventListener("abort", stop)
  return stop
}

async function detail(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown }
    if (typeof body.detail === "string") return body.detail
  } catch {
    // not JSON
  }
  return `${res.status} ${res.statusText}`.trim()
}

async function runLive(
  input: { rfp: string; proposal: string; criteria: Criterion[] },
  opts: RunOptions,
): Promise<Review> {
  const stop = pace(opts.onStep, opts.signal)
  try {
    const res = await fetch(`${API}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfp: input.rfp, proposal: input.proposal }),
      signal: opts.signal,
    })
    if (res.status === 400) throw new ReviewError(await detail(res), "empty-input")
    if (!res.ok) {
      throw new ReviewError(
        `The review could not be completed — the service said: ${await detail(res)}`,
        "upstream",
      )
    }
    const result = (await res.json()) as ScoringResult
    opts.onStep?.(RUN_STEPS.length - 1)
    return adapt(result, input)
  } catch (error) {
    if (error instanceof ReviewError) throw error
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ReviewError(
      `The review service at ${API} could not be reached. Is the backend running?`,
      "transport",
    )
  } finally {
    stop()
  }
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
  return MOCK ? runMock(input, opts) : runLive(input, opts)
}

/**
 * Weight suggestions are the authored ones for the NordFrame RFP; the backend
 * has no endpoint for them yet. Right for the sample set, a placeholder for
 * anything else.
 */
export async function suggestWeights(
  _rfp: string,
  opts: { signal?: AbortSignal } = {},
): Promise<WeightSuggestion[]> {
  await wait(900, opts.signal)
  return WEIGHT_SUGGESTIONS
}
