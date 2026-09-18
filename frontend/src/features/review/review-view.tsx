import { useState, type ReactNode } from "react"
import { ArrowRight, ChevronDown, Download, Pencil, RotateCw } from "lucide-react"
import { toast } from "sonner"
import { useDefaultLayout, type Layout } from "react-resizable-panels"

import { cn } from "@/lib/utils"
import type {
  Citation,
  Criterion,
  Issue,
  Requirement,
  RequirementStatus,
  Review,
  Verdict,
  Witness,
} from "@/api/schema"
import { download, reportBlocks, reportFilename, toDocx, toMarkdown } from "@/lib/export"
import { excerpt, samePassage } from "@/lib/quote"
import { useMediaQuery } from "@/lib/use-media-query"
import { ClothBand } from "@/components/apparatus/cloth-band"
import { WitnessPane } from "@/components/apparatus/witness-pane"
import { Siglum } from "@/components/apparatus/siglum"
import { CollationProvider, useCollation } from "@/components/apparatus/collation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import {
  CONSTRAINT_LABEL,
  CriteriaPanel,
  IssuesPanel,
  RequirementsPanel,
  STATUS_LABEL,
  StatusSwatch,
  type EmptyReason,
  type RequirementFilter,
} from "./apparatus"

type Panel = "issues" | "requirements" | "criteria"

/* ----------------------------------------------------------- notices -- */

/**
 * One notice for the two ways a draft goes against the RFP: a contradicted
 * requirement and a violated constraint. Neither is left inside a tab; both are
 * stated under the verdict in the RFP's words and the draft's, with a way
 * straight to both passages. When both cite the same passage, the violation
 * speaks alone.
 */
type Conflict =
  | { kind: "violation"; issue: Issue & { kind: "violation" } }
  | { kind: "contradiction"; req: Requirement; issue: Issue | null }

function ConflictNotice({
  requirements,
  issues,
  onShow,
}: {
  requirements: Requirement[]
  issues: Issue[]
  onShow: (target: Conflict) => void
}) {
  const violations = issues.filter((i): i is Issue & { kind: "violation" } => i.kind === "violation")
  const contradictions = requirements
    .filter((r) => r.status === "contradicted")
    .map((req) => ({ req, issue: issues.find((i) => i.id === `cov-${req.id}`) ?? null }))
    .filter(
      ({ req }) =>
        !violations.some((v) => samePassage(v.location?.quote ?? null, req.answeredAt?.quote ?? null)),
    )
  const items: Conflict[] = [
    ...violations.map((issue): Conflict => ({ kind: "violation", issue })),
    ...contradictions.map((c): Conflict => ({ kind: "contradiction", ...c })),
  ]
  // One or two conflicts are shown in full; a longer list folds to its summary line until asked.
  const [open, setOpen] = useState(items.length <= 2)
  if (items.length === 0) return null
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`
  const summary = [
    ...(violations.length ? [plural(violations.length, "violation")] : []),
    ...(contradictions.length ? [plural(contradictions.length, "contradicted requirement")] : []),
  ].join(" · ")

  return (
    <section
      role="alert"
      aria-label="The draft conflicts with the RFP"
      className="border-cloth-stop bg-paper border-b"
    >
      <div className="mx-auto max-w-[112rem] px-5 sm:px-8">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center justify-between gap-4 py-2.5 text-left"
        >
          <span className="hand-condensed text-cloth-stop flex flex-wrap items-center gap-x-2 text-[1.35rem] leading-none font-semibold tracking-tight uppercase">
            <StatusSwatch status="contradicted" className="size-3" />
            The draft conflicts with the RFP
            <span className="editorial text-ink-2 tracking-normal normal-case">{summary}</span>
          </span>
          <span className="editorial text-cloth-stop inline-flex shrink-0 items-center gap-1.5">
            {open ? "Collapse" : "Show"}
            <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
          </span>
        </button>
        {open && (
      <ul className="grid gap-y-3 pb-3.5">
        {items.map((item) => {
          const violation = item.kind === "violation"
          const asks = violation ? (item.issue.against?.quote ?? "") : item.req.text
          const says = violation
            ? (item.issue.quoted ?? "")
            : (item.issue?.quoted ?? item.req.answeredAt?.quote ?? "")
          const key = violation ? item.issue.id : item.req.id
          return (
            <li key={key} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
              <div className="min-w-0 max-w-[88ch]">
                <h2 className="hand-condensed text-cloth-stop flex flex-wrap items-center gap-x-2 text-[1.6rem] leading-none font-semibold tracking-tight uppercase">
                  <StatusSwatch status="contradicted" className="size-3" />
                  {violation ? "Violates a client constraint" : "Contradicts the RFP"}
                  {violation && (
                    <span className="editorial text-ink-2 tracking-normal normal-case">
                      Constraint · {CONSTRAINT_LABEL[item.issue.constraintKind]}
                    </span>
                  )}
                </h2>
                <p className="text-ink mt-1.5 text-[0.95rem] leading-snug">
                  <Siglum of="R" className="mr-1.5 translate-y-[0.1em]" />
                  <span className="text-ink-2">asks</span>{" "}
                  {violation ? (
                    <span className="font-serif italic">“{excerpt(asks, 18)}”</span>
                  ) : (
                    asks
                  )}
                  {says && (
                    <>
                      {" "}
                      <Siglum of="P" className="mr-1.5 ml-2 translate-y-[0.1em]" />
                      <span className="text-ink-2">says</span>{" "}
                      <span className="font-serif italic">“{excerpt(says, 18)}”</span>
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onShow(item)}
                className={cn(
                  "editorial border-cloth-stop text-cloth-stop inline-flex shrink-0 cursor-pointer items-center gap-2 border px-3.5 py-2.5",
                  "hover:bg-cloth-stop hover:text-cloth-text transition-colors",
                )}
              >
                {violation ? "Show the violation" : "Show the contradiction"}
                <ArrowRight className="size-3.5" />
              </button>
            </li>
          )
        })}
      </ul>
        )}
      </div>
    </section>
  )
}

/**
 * A review notice sits under the band: paper with a single rule beneath in its
 * tone and an outline button. Never a band, never a box. Only one shows at a
 * time: a partial review, an incomplete one, or the no-RFP note.
 */
function ReviewNotice({
  tone,
  role,
  title,
  children,
  action,
}: {
  tone: "info" | "partial" | "error"
  role: "status" | "alert" | "note"
  title: string
  children: ReactNode
  action?: { label: string; onClick: () => void; disabled?: boolean }
}) {
  const Tag = role === "note" ? "aside" : "section"
  return (
    <Tag
      role={role}
      aria-label={title}
      className={cn(
        "bg-paper border-b",
        tone === "partial" ? "border-cloth-fix" : tone === "error" ? "border-ink" : "border-rule",
      )}
    >
      <div className="mx-auto flex max-w-[112rem] flex-wrap items-start justify-between gap-x-6 gap-y-2.5 px-5 py-3.5 sm:px-8">
        <div className="min-w-0 max-w-[88ch]">
          {tone === "info" ? (
            <p className="editorial text-ink-2">{title}</p>
          ) : (
            <h2
              className={cn(
                "hand-condensed text-[1.6rem] leading-none font-semibold tracking-tight uppercase",
                tone === "partial" ? "text-cloth-fix" : "text-ink",
              )}
            >
              {title}
            </h2>
          )}
          <div className="text-ink mt-1.5 text-[0.9rem] leading-snug">{children}</div>
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="editorial border-ink text-ink hover:bg-ink hover:text-paper cursor-pointer border px-3.5 py-2.5 transition-colors disabled:opacity-50"
          >
            {action.label}
          </button>
        )}
      </div>
    </Tag>
  )
}

const PANELS: { id: Panel; label: string }[] = [
  { id: "issues", label: "Issues" },
  { id: "requirements", label: "Requirements" },
  { id: "criteria", label: "Criteria" },
]

const TALLY: RequirementStatus[] = ["addressed", "partial", "contradicted", "missing"]

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

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
function Columns({ panelIds, children }: { panelIds: string[]; children: ReactNode }) {
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

interface ReviewProps {
  review: Review
  criteria: Criterion[]
  onCriteria: (next: Criterion[]) => void
  witnesses: { R: Witness; P: Witness }
  score: number | null
  verdict: Verdict | null
  onEdit: () => void
  onRerun: () => void
  rerunning: boolean
  /** The draft has changed since this review ran, so citations may have moved. */
  stale: boolean
}

/** The apparatus entry a collation came from, by its source id, so the layout can bring it back into view. */
function entryFor(sourceId: string): string | null {
  const m = /^(iss|req|con)-(.+)$/.exec(sourceId) ?? /^(crit|ev)-(.+?)-\d+$/.exec(sourceId)
  if (!m) return null
  return `e-${m[1] === "ev" ? "crit" : m[1]}-${m[2]}`
}

/**
 * The shell holds what must outlive a change of layout — which witnesses are open, which
 * entries are open, the requirements filter — and answers every collation: a citation that
 * points into a closed witness opens it, and the entry that was clicked stays in view.
 */
export function ReviewView(props: ReviewProps) {
  const [shown, setShown] = useState<Shown>(loadShown)
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<RequirementFilter>("all")
  const noRfp = props.witnesses.R.text.trim() === ""

  const show = (next: Partial<Shown>) =>
    setShown((current) => {
      const merged = { ...current, ...next }
      if (merged.R === current.R && merged.P === current.P) return current
      saveShown(merged)
      return merged
    })

  const reveal = (sourceId: string, marks: Citation[]) => {
    const need = {
      R: !noRfp && marks.some((m) => m.witness === "R"),
      P: marks.some((m) => m.witness === "P"),
    }
    if (!((need.R && !shown.R) || (need.P && !shown.P))) return
    show({ R: shown.R || need.R, P: shown.P || need.P })
    // Opening a witness re-lays the columns; bring the clicked entry back once they settle.
    const entry = entryFor(sourceId)
    if (entry) {
      window.setTimeout(() => document.getElementById(entry)?.scrollIntoView({ block: "nearest" }), 80)
    }
  }

  return (
    <CollationProvider onCollate={reveal}>
      <ReviewBody
        {...props}
        shown={shown}
        onShow={show}
        openIds={openIds}
        onToggleOpen={(id, open) => setOpenIds((current) => ({ ...current, [id]: open }))}
        filter={filter}
        onFilter={setFilter}
      />
    </CollationProvider>
  )
}

function ReviewBody({
  review,
  criteria,
  onCriteria,
  witnesses,
  score,
  verdict,
  onEdit,
  onRerun,
  rerunning,
  stale,
  shown,
  onShow,
  openIds,
  onToggleOpen,
  filter,
  onFilter,
}: ReviewProps & {
  shown: Shown
  onShow: (next: Partial<Shown>) => void
  openIds: Record<string, boolean>
  onToggleOpen: (id: string, open: boolean) => void
  filter: RequirementFilter
  onFilter: (next: RequirementFilter) => void
}) {
  const [panel, setPanel] = useState<Panel>("issues")
  const wide = useMediaQuery("(min-width: 80rem)")
  const { collate } = useCollation()

  const noRfp = witnesses.R.text.trim() === ""
  /** The analysis call failed: the requirements are real, nothing after them is. */
  const unassessed = review.error !== null
  const noRequirements = review.requirements.length === 0
  const emptyReason: EmptyReason = noRequirements
    ? noRfp
      ? "no-rfp"
      : "nothing-extracted"
    : null
  const showR = shown.R && !noRfp

  const enabled = criteria.filter((c) => c.enabled)
  const scored = enabled.filter(
    (c) => review.criteria.find((s) => s.criterionId === c.id)?.score != null,
  ).length
  const counts: Record<Panel, string> = {
    issues: String(review.issues.length),
    requirements: String(review.requirements.length),
    criteria: scored < enabled.length ? `${scored}/${enabled.length}` : String(enabled.length),
  }

  const tally = TALLY.map((status) => ({
    status,
    n: review.requirements.filter((r) => r.status === status).length,
  })).filter(({ n }) => n > 0)

  const toggle = (witness: keyof Shown) => onShow({ [witness]: !shown[witness] })

  /** The review as a file for the writer: Markdown for readers of text, Word for the rest. */
  const exportAs = async (ext: "md" | "docx") => {
    const blocks = reportBlocks(review, criteria, score, witnesses)
    const name = reportFilename(witnesses, ext)
    try {
      const blob =
        ext === "md"
          ? new Blob([toMarkdown(blocks)], { type: "text/markdown;charset=utf-8" })
          : await toDocx(blocks, name.replace(/\.docx$/, ""))
      download(blob, name)
      toast.success(`Exported ${name}`)
    } catch (e) {
      toast.error(`Could not build the ${ext === "md" ? "Markdown" : "Word"} file: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const panelIds = [
    "apparatus",
    ...(showR ? ["witness-r"] : []),
    ...(shown.P ? ["witness-p"] : []),
  ]

  /** Open the entry behind a conflict with both passages marked in crimson. */
  const showConflict = (target: Conflict) => {
    setPanel("issues")
    onShow({ R: true, P: true })
    const issue = target.kind === "violation" ? target.issue : target.issue
    if (issue) {
      onToggleOpen(issue.id, true)
      collate(`iss-${issue.id}`, [issue.location, issue.against], "contradicted")
      window.setTimeout(() => {
        document.getElementById(`e-iss-${issue.id}`)?.scrollIntoView({ block: "start", behavior: "smooth" })
      }, 80)
    } else if (target.kind === "contradiction") {
      collate(`req-${target.req.id}`, [target.req.source, target.req.answeredAt], "contradicted")
    }
  }

  const notice = review.partial && !unassessed ? (
    <ReviewNotice
      tone="partial"
      role="status"
      title="Partial review"
      action={{ label: "Re-run", onClick: onRerun, disabled: rerunning }}
    >
      <p>Part of the review did not finish. What is shown is real; what is missing is listed here.</p>
      {review.warnings.length > 0 && (
        <ul className="mt-1.5 list-disc pl-5">
          {review.warnings.map((w) => (
            <li key={w}>{capital(w)}</li>
          ))}
        </ul>
      )}
      <p className="mt-1.5">Criteria marked — were not scored and are left out of the overall.</p>
    </ReviewNotice>
  ) : unassessed ? (
    <ReviewNotice
      tone="error"
      role="alert"
      title="Review incomplete"
      action={{ label: "Re-run", onClick: onRerun, disabled: rerunning }}
    >
      <p>
        The requirements were extracted, but the analysis call failed: {review.error}. Coverage,
        scores and suggested fixes are missing.
      </p>
    </ReviewNotice>
  ) : noRequirements ? (
    <ReviewNotice
      tone="info"
      role="note"
      title="No RFP provided"
      action={{ label: noRfp ? "Add the RFP" : "Edit the RFP", onClick: onEdit }}
    >
      <p>
        {noRfp
          ? "No RFP was provided: requirements coverage was skipped and Completeness vs RFP is not assessable. The overall is the weighted mean of the six scored criteria."
          : "No requirements were found in the RFP: coverage was skipped and Completeness vs RFP is not assessable."}
      </p>
    </ReviewNotice>
  ) : null

  const apparatus = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <nav className="border-rule flex shrink-0 gap-0 border-b" aria-label="Review sections">
        {PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPanel(p.id)}
            aria-current={panel === p.id}
            className={cn(
              "editorial relative cursor-pointer px-4 py-3 transition-colors",
              panel === p.id ? "text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {p.label}
            <span data-numeric className="ml-1.5 tabular-nums opacity-60">
              {counts[p.id]}
            </span>
            {panel === p.id && (
              <span aria-hidden className="bg-ink absolute inset-x-0 -bottom-px h-[2px]" />
            )}
          </button>
        ))}
      </nav>

      <div className="@container min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        {panel === "issues" && (
          <IssuesPanel
            issues={review.issues}
            criteria={criteria}
            openIds={openIds}
            onToggle={onToggleOpen}
            unassessed={unassessed}
          />
        )}
        {panel === "requirements" && (
          <RequirementsPanel
            requirements={review.requirements}
            constraints={review.constraints}
            issues={review.issues}
            unassessed={unassessed}
            emptyReason={emptyReason}
            filter={filter}
            onFilter={onFilter}
          />
        )}
        {panel === "criteria" && (
          <CriteriaPanel
            criteria={criteria}
            scores={review.criteria}
            evidence={review.evidence}
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
        note={
          noRequirements || unassessed
            ? undefined
            : tally.map(({ status, n }) => (
                <span key={status}>
                  <span data-numeric className="text-cloth-text font-bold tabular-nums">
                    {n}
                  </span>{" "}
                  {STATUS_LABEL[status]}
                </span>
              ))
        }
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Export the review"
            className={cn(
              "editorial border-cloth-text/40 text-cloth-text/90 inline-flex cursor-pointer items-center gap-2 border px-4 py-3",
              "hover:bg-cloth-text/12 hover:text-cloth-text transition-colors",
            )}
          >
            <Download className="size-3.5" />
            Export
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-rule min-w-[11rem] rounded-none bg-paper text-ink">
            <DropdownMenuItem className="editorial cursor-pointer rounded-none" onSelect={() => void exportAs("md")}>
              Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem className="editorial cursor-pointer rounded-none" onSelect={() => void exportAs("docx")}>
              Word (.docx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

      {!unassessed && (
        <ConflictNotice requirements={review.requirements} issues={review.issues} onShow={showConflict} />
      )}

      {notice}

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
            {showR && (
              <>
                <Split />
                <ResizablePanel id="witness-r" minSize="18" className="flex min-h-0 min-w-0 flex-col">
                  <WitnessPane witness={witnesses.R} className="min-h-0 flex-1" onHide={() => toggle("R")} />
                </ResizablePanel>
              </>
            )}
            {shown.P && (
              <>
                <Split />
                <ResizablePanel id="witness-p" minSize="18" className="flex min-h-0 min-w-0 flex-col">
                  <WitnessPane witness={witnesses.P} className="min-h-0 flex-1" onHide={() => toggle("P")} />
                </ResizablePanel>
              </>
            )}
          </Columns>
          {!showR && !noRfp && <WitnessRail witness={witnesses.R} vertical onShow={() => toggle("R")} />}
          {!shown.P && <WitnessRail witness={witnesses.P} vertical onShow={() => toggle("P")} />}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1">
          {apparatus}
          {noRfp ? null : showR ? (
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
