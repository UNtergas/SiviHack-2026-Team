import { useState, type ReactNode } from "react"
import { ArrowRight, Pencil, RotateCw } from "lucide-react"
import { useDefaultLayout, type Layout } from "react-resizable-panels"

import { cn } from "@/lib/utils"
import type {
  Criterion,
  Issue,
  Requirement,
  RequirementStatus,
  Review,
  Verdict,
  Witness,
} from "@/api/schema"
import { excerpt } from "@/lib/quote"
import { useMediaQuery } from "@/lib/use-media-query"
import { ClothBand } from "@/components/apparatus/cloth-band"
import { WitnessPane } from "@/components/apparatus/witness-pane"
import { Siglum } from "@/components/apparatus/siglum"
import { useCollation } from "@/components/apparatus/collation"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import {
  CriteriaPanel,
  IssuesPanel,
  RequirementsPanel,
  STATUS_LABEL,
  StatusSwatch,
  type IssueVerdict,
} from "./apparatus"

type Panel = "issues" | "requirements" | "criteria"

/**
 * A contradiction is the one finding that can sink a proposal on its own, so
 * it is not left inside a tab. It is stated under the verdict in the RFP's
 * words and the draft's, with a way straight to both passages.
 */
function ContradictionNotice({
  requirements,
  issues,
  verdicts,
  onShow,
}: {
  requirements: Requirement[]
  issues: Issue[]
  verdicts: Record<string, IssueVerdict>
  onShow: (req: Requirement, issue: Issue | null) => void
}) {
  const open = requirements
    .filter((r) => r.status === "contradicted")
    .map((req) => ({ req, issue: issues.find((i) => i.id === `cov-${req.id}`) ?? null }))
    .filter(({ issue }) => !issue || (verdicts[issue.id] ?? "open") === "open")
  if (open.length === 0) return null

  return (
    <section
      role="alert"
      aria-label="The draft contradicts the RFP"
      className="border-cloth-stop bg-paper border-b"
    >
      <ul className="mx-auto grid max-w-[112rem] gap-y-3 px-5 py-3.5 sm:px-8">
        {open.map(({ req, issue }) => {
          const said = issue?.quoted ?? req.answeredAt?.quote ?? ""
          return (
            <li
              key={req.id}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5"
            >
              <div className="min-w-0 max-w-[88ch]">
                <h2 className="hand-condensed text-cloth-stop flex items-center gap-2 text-[1.6rem] leading-none font-semibold tracking-tight uppercase">
                  <StatusSwatch status="contradicted" className="size-3" />
                  Contradicts the RFP
                </h2>
                <p className="text-ink mt-1.5 text-[0.95rem] leading-snug">
                  <Siglum of="R" className="mr-1.5 translate-y-[0.1em]" />
                  <span className="text-ink-2">asks</span> {req.text}
                  {said && (
                    <>
                      {" "}
                      <Siglum of="P" className="mr-1.5 ml-2 translate-y-[0.1em]" />
                      <span className="text-ink-2">says</span>{" "}
                      <span className="font-serif italic">“{excerpt(said, 18)}”</span>
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onShow(req, issue)}
                className={cn(
                  "editorial border-cloth-stop text-cloth-stop inline-flex shrink-0 cursor-pointer items-center gap-2 border px-3.5 py-2.5",
                  "hover:bg-cloth-stop hover:text-cloth-text transition-colors",
                )}
              >
                Show the contradiction
                <ArrowRight className="size-3.5" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const PANELS: { id: Panel; label: string }[] = [
  { id: "issues", label: "Issues" },
  { id: "requirements", label: "Requirements" },
  { id: "criteria", label: "Criteria" },
]

const TALLY: RequirementStatus[] = ["addressed", "partial", "contradicted", "missing"]

/* ------------------------------------------------------------- layout -- */

type Shown = { R: boolean; P: boolean }
const SHOWN_KEY = "review.witnesses.v2"

/** Which witnesses are open. Both start closed; a per-viewer convenience, so browser storage. */
function loadShown(): Shown {
  try {
    const raw = localStorage.getItem(SHOWN_KEY)
    if (raw) {
      const v = JSON.parse(raw) as Partial<Shown>
      return { R: v.R === true, P: v.P === true }
    }
  } catch {
    // storage unavailable; defaults apply
  }
  return { R: false, P: false }
}

function saveShown(next: Shown) {
  try {
    localStorage.setItem(SHOWN_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable; the session still works
  }
}

/** The starting split: the apparatus takes a little more than a witness. */
function defaultSplit(panelIds: string[]): Layout {
  if (panelIds.length === 1) return { [panelIds[0]]: 100 }
  if (panelIds.length === 2) return { [panelIds[0]]: 50, [panelIds[1]]: 50 }
  return { [panelIds[0]]: 38, [panelIds[1]]: 31, [panelIds[2]]: 31 }
}

/**
 * The three columns with draggable splits, remembered per combination of
 * open witnesses. Keyed by that combination from the parent, so the saved
 * layout is read fresh whenever a witness is opened or closed.
 */
function Columns({
  panelIds,
  children,
}: {
  panelIds: string[]
  children: ReactNode
}) {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: `review-columns:${panelIds.join("+")}`,
    panelIds,
  })
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      defaultLayout={defaultLayout ?? defaultSplit(panelIds)}
      onLayoutChanged={onLayoutChanged}
      className="min-h-0 flex-1"
    >
      {children}
    </ResizablePanelGroup>
  )
}

/** The split: a rule with a grip; drag to resize, double-click to reset. */
function Split() {
  return (
    <ResizableHandle
      withHandle
      title="Drag to resize · double-click to reset"
      className="bg-rule hover:bg-ink transition-colors after:w-2 [&>div]:h-6 [&>div]:w-[3px] [&>div]:rounded-none [&>div]:bg-ink-3"
    />
  )
}

/**
 * A closed witness folds into a rail at the edge that names it and reopens
 * it, so nothing about the layout is ever hidden in a menu.
 */
function WitnessRail({
  witness,
  vertical,
  onShow,
}: {
  witness: Witness
  vertical: boolean
  onShow: () => void
}) {
  return (
    <button
      type="button"
      onClick={onShow}
      aria-label={`Show the ${witness.title}`}
      title={`Show the ${witness.title}`}
      className={cn(
        "border-rule hover:bg-paper-inset flex shrink-0 cursor-pointer items-center gap-2.5 transition-colors",
        vertical ? "w-10 flex-col justify-start border-l py-3" : "w-full border-t px-5 py-2.5 sm:px-6",
      )}
    >
      <Siglum of={witness.siglum} size="md" />
      <span
        className={cn(
          "editorial text-ink-2 whitespace-nowrap",
          vertical && "rotate-180 [writing-mode:vertical-rl]",
        )}
      >
        {witness.title}
      </span>
    </button>
  )
}

export function ReviewView({
  review,
  criteria,
  onCriteria,
  witnesses,
  score,
  verdict,
  verdicts,
  onVerdict,
  onEdit,
  onRerun,
  rerunning,
  stale,
  appliedFixes,
  onApply,
  onRevert,
}: {
  review: Review
  criteria: Criterion[]
  onCriteria: (next: Criterion[]) => void
  witnesses: { R: Witness; P: Witness }
  score: number
  verdict: Verdict
  verdicts: Record<string, IssueVerdict>
  onVerdict: (id: string, next: IssueVerdict) => void
  onEdit: () => void
  onRerun: () => void
  rerunning: boolean
  /** The draft has changed since this review ran, so citations may have moved. */
  stale: boolean
  appliedFixes: Record<string, boolean>
  onApply: (issue: Issue) => void
  onRevert: (issue: Issue) => void
}) {
  const [panel, setPanel] = useState<Panel>("issues")
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null)
  const [shown, setShown] = useState<Shown>(loadShown)
  const wide = useMediaQuery("(min-width: 80rem)")
  const { collate } = useCollation()

  const counts = {
    issues: review.issues.filter((i) => (verdicts[i.id] ?? "open") === "open")
      .length,
    requirements: review.requirements.length,
    criteria: criteria.filter((c) => c.enabled).length,
  }

  const tally = TALLY.map((status) => ({
    status,
    n: review.requirements.filter((r) => r.status === status).length,
  })).filter(({ n }) => n > 0)

  const toggle = (witness: keyof Shown) =>
    setShown((current) => {
      const next = { ...current, [witness]: !current[witness] }
      saveShown(next)
      return next
    })

  const panelIds = [
    "apparatus",
    ...(shown.R ? ["witness-r"] : []),
    ...(shown.P ? ["witness-p"] : []),
  ]

  /** Open the issue behind a contradiction with both passages marked in crimson. */
  const showContradiction = (req: Requirement, issue: Issue | null) => {
    setPanel("issues")
    if (!shown.R || !shown.P) {
      const next = { R: true, P: true }
      saveShown(next)
      setShown(next)
    }
    if (issue) {
      setFocus((current) => ({ id: issue.id, n: (current?.n ?? 0) + 1 }))
      collate(`iss-${issue.id}`, [issue.location, issue.against], "contradicted")
      window.setTimeout(() => {
        document
          .getElementById(`e-iss-${issue.ref}`)
          ?.scrollIntoView({ block: "start", behavior: "smooth" })
      }, 80)
    } else {
      collate(`req-${req.id}`, [req.source, req.answeredAt], "contradicted")
    }
  }

  const apparatus = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <nav
        className="border-rule flex shrink-0 gap-0 border-b"
        aria-label="Review sections"
      >
        {PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPanel(p.id)}
            aria-current={panel === p.id}
            className={cn(
              "editorial relative cursor-pointer px-4 py-3 transition-colors",
              panel === p.id
                ? "text-ink"
                : "text-ink-3 hover:text-ink-2",
            )}
          >
            {p.label}
            <span
              data-numeric
              className="ml-1.5 tabular-nums opacity-60"
            >
              {counts[p.id]}
            </span>
            {panel === p.id && (
              <span
                aria-hidden
                className="bg-ink absolute inset-x-0 -bottom-px h-[2px]"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="@container min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        {panel === "issues" && (
          <IssuesPanel
            issues={review.issues}
            criteria={criteria}
            verdicts={verdicts}
            onVerdict={onVerdict}
            appliedFixes={appliedFixes}
            onApply={onApply}
            onRevert={onRevert}
            focus={focus}
          />
        )}
        {panel === "requirements" && (
          <RequirementsPanel requirements={review.requirements} />
        )}
        {panel === "criteria" && (
          <CriteriaPanel
            criteria={criteria}
            scores={review.criteria}
            onCriteria={onCriteria}
          />
        )}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-svh flex-col xl:h-svh xl:overflow-hidden">
      <ClothBand
        verdict={verdict}
        score={score}
        note={tally.map(({ status, n }) => (
          <span key={status}>
            <span data-numeric className="text-cloth-text font-bold tabular-nums">
              {n}
            </span>{" "}
            {STATUS_LABEL[status]}
          </span>
        ))}
      >
        <button
          type="button"
          onClick={onEdit}
          className={cn(
            "editorial border-cloth-text/40 text-cloth-text/90 inline-flex cursor-pointer items-center gap-2 border px-4 py-3",
            "hover:bg-cloth-text/12 hover:text-cloth-text transition-colors",
          )}
        >
          <Pencil className="size-3.5" />
          Edit the draft
        </button>
        <button
          type="button"
          onClick={onRerun}
          disabled={rerunning}
          className={cn(
            "editorial bg-cloth-text text-ink inline-flex cursor-pointer items-center gap-2 px-4 py-3",
            "transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <RotateCw className={cn("size-3.5", rerunning && "animate-spin")} />
          Re-run
        </button>
      </ClothBand>

      <ContradictionNotice
        requirements={review.requirements}
        issues={review.issues}
        verdicts={verdicts}
        onShow={showContradiction}
      />

      {stale && (
        <div role="status" className="border-ink bg-lemma border-b">
          <div className="mx-auto flex max-w-[112rem] flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:px-8">
            <p className="text-ink text-[0.9rem]">
              The draft has changed since this review ran. The passages the
              citations below point at may have moved or gone.
            </p>
            <button
              type="button"
              onClick={onRerun}
              disabled={rerunning}
              className="editorial border-ink text-ink hover:bg-ink hover:text-paper cursor-pointer border px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              Re-run against the edited draft
            </button>
          </div>
        </div>
      )}

      {wide ? (
        <div className="flex min-h-0 flex-1">
          <Columns key={panelIds.join("+")} panelIds={panelIds}>
            <ResizablePanel id="apparatus" minSize="24" className="flex min-h-0 min-w-0 flex-col">
              {apparatus}
            </ResizablePanel>
            {shown.R && (
              <>
                <Split />
                <ResizablePanel id="witness-r" minSize="18" className="flex min-h-0 min-w-0 flex-col">
                  <WitnessPane
                    witness={witnesses.R}
                    className="min-h-0 flex-1"
                    onHide={() => toggle("R")}
                  />
                </ResizablePanel>
              </>
            )}
            {shown.P && (
              <>
                <Split />
                <ResizablePanel id="witness-p" minSize="18" className="flex min-h-0 min-w-0 flex-col">
                  <WitnessPane
                    witness={witnesses.P}
                    className="min-h-0 flex-1"
                    onHide={() => toggle("P")}
                  />
                </ResizablePanel>
              </>
            )}
          </Columns>
          {!shown.R && <WitnessRail witness={witnesses.R} vertical onShow={() => toggle("R")} />}
          {!shown.P && <WitnessRail witness={witnesses.P} vertical onShow={() => toggle("P")} />}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1">
          {apparatus}
          {shown.R ? (
            <WitnessPane
              witness={witnesses.R}
              className="border-rule min-h-[22rem] border-t"
              onHide={() => toggle("R")}
            />
          ) : (
            <WitnessRail witness={witnesses.R} vertical={false} onShow={() => toggle("R")} />
          )}
          {shown.P ? (
            <WitnessPane
              witness={witnesses.P}
              className="border-rule min-h-[22rem] border-t"
              onHide={() => toggle("P")}
            />
          ) : (
            <WitnessRail witness={witnesses.P} vertical={false} onShow={() => toggle("P")} />
          )}
        </div>
      )}
    </div>
  )
}
