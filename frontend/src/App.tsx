import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { Criterion, Witness } from "@/api/schema"
import { suggestWeights } from "@/api/client"
import { ReviewError } from "@/api/errors"
import { EMPTY_PROGRESS } from "@/api/progress"
import { reviewKey, useReview, type RunRequest } from "@/api/use-review"
import { RFP_TEXT, SAMPLES, type SampleId } from "@/api/fixtures/documents"
import { BASE_CRITERIA } from "@/api/fixtures/criteria"
import { rebalance, verdictFor, weightedScore } from "@/lib/score"
import { ReviewView } from "@/features/review/review-view"
import { RunTrace } from "@/features/review/run-trace"
import { SetupView } from "@/features/review/setup-view"

const STAGE_PHRASE: Record<string, string> = {
  sections: "reading the documents",
  requirements: "extracting the client's requirements",
  coverage: "collating the draft",
  scores: "scoring the criteria",
  findings: "drafting the fixes",
}

/** The one sentence the setup rail prints for a failed run. */
function describe(error: unknown): string {
  if (error instanceof ReviewError) {
    if (error.stage && error.code === "upstream") {
      const phrase = STAGE_PHRASE[error.stage] ?? error.stage
      return `The review stopped while ${phrase}: ${error.message}. Nothing was saved — press Run review to try again.`
    }
    return error.message
  }
  return "The review could not be completed. Check both documents and try again."
}

export default function App() {
  const queryClient = useQueryClient()
  const [rfp, setRfp] = useState("")
  const [proposal, setProposal] = useState("")
  const [criteria, setCriteria] = useState<Criterion[]>(BASE_CRITERIA)
  const [editing, setEditing] = useState(false)
  const [activeSample, setActiveSample] = useState<SampleId | null>(null)
  /** The run on the table: the documents and weights as they were when Run was pressed. */
  const [run, setRun] = useState<RunRequest | null>(null)

  const review = useReview(run)
  const progress = review.data ?? EMPTY_PROGRESS
  const result = review.data?.review ?? null

  const weights = useMutation({
    mutationFn: (source: string) => suggestWeights(source),
    onSuccess: (advice) => {
      setCriteria((current) =>
        rebalance(
          current.map((c) => {
            const found = advice.suggestions.find((s) => s.criterionId === c.id)
            return found ? { ...c, weight: found.weight } : c
          }),
        ),
      )
    },
  })

  const witnesses = useMemo<{ R: Witness; P: Witness }>(
    () => ({
      R: {
        siglum: "R",
        title: "Request for Proposal",
        subtitle: "The client's brief",
        text: rfp,
      },
      P: {
        siglum: "P",
        title: "Draft Proposal",
        subtitle: "The text under review",
        text: proposal,
      },
    }),
    [rfp, proposal],
  )

  // Recomputed in code on every render, so a slider drag never costs a model call.
  const score = result ? weightedScore(criteria, result.criteria) : null
  const verdict = verdictFor(score)

  const startRun = () => {
    setEditing(false)
    setRun({ rfp, proposal, criteria, runId: Date.now() })
  }

  const stopRun = () => {
    if (run) void queryClient.cancelQueries({ queryKey: reviewKey(run) })
    setRun(null)
  }

  // Loading. The trace shows which stage is running, never a blank panel.
  if (review.isFetching) {
    return <RunTrace progress={progress} hasRfp={run?.rfp.trim() !== ""} onStop={stopRun} />
  }

  // Success.
  if (result && !editing) {
    return (
      <ReviewView
        review={result}
        criteria={criteria}
        onCriteria={setCriteria}
        witnesses={witnesses}
        score={score}
        verdict={verdict}
        onEdit={() => setEditing(true)}
        onRerun={startRun}
        rerunning={review.isFetching}
        stale={run !== null && proposal !== run.proposal}
      />
    )
  }

  // Empty, and error — the same view, which is also where recovery happens.
  return (
    <SetupView
      rfp={rfp}
      proposal={proposal}
      onRfp={(v) => {
        setRfp(v)
        setActiveSample(null)
      }}
      onProposal={(v) => {
        setProposal(v)
        setActiveSample(null)
      }}
      criteria={criteria}
      onCriteria={setCriteria}
      onSuggest={() => weights.mutate(rfp)}
      suggestions={weights.data?.suggestions ?? null}
      suggestState={weights.status}
      suggestError={weights.error ? describe(weights.error) : null}
      extracted={
        weights.data
          ? { requirements: weights.data.requirements, constraints: weights.data.constraints }
          : null
      }
      onRun={startRun}
      onSample={(id) => {
        setRfp(RFP_TEXT)
        setProposal(SAMPLES[id].text)
        setActiveSample(id)
      }}
      activeSample={activeSample}
      error={review.isError ? describe(review.error) : null}
    />
  )
}
