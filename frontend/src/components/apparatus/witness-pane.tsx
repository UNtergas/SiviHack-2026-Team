import { Fragment, useCallback } from "react"

import { cn } from "@/lib/utils"
import type { Witness } from "@/api/schema"

import { Siglum } from "./siglum"
import { WitnessLine } from "./witness-line"
import { useCollation } from "./collation"

/**
 * A witness, set as a page: line numbers in a strict gutter column, printed
 * every fifth line the way an edition prints them, plus any line currently
 * carrying a mark.
 */
export function WitnessPane({
  witness,
  className,
}: {
  witness: Witness
  className?: string
}) {
  const { marks, registerPane, pending } = useCollation()

  const scroller = useCallback(
    (el: HTMLDivElement | null) => registerPane(witness.siglum, el),
    [registerPane, witness.siglum],
  )

  const mine = marks.filter((m) => m.witness === witness.siglum)
  const preview =
    pending && pending.at.witness === witness.siglum ? pending : null
  const isMarked = (n: number) => mine.some((m) => n >= m.from && n <= m.to)
  const markKey = mine.map((m) => `${m.from}-${m.to}`).join(",")

  return (
    <section
      className={cn("flex min-h-0 min-w-0 flex-col bg-paper", className)}
      aria-label={`${witness.title}, witness ${witness.siglum}`}
    >
      <header
        className={cn(
          "flex items-center gap-3 px-4 py-2.5",
          witness.siglum === "R" ? "bg-witness-r" : "bg-witness-p",
        )}
      >
        <Siglum of={witness.siglum} size="md" className="bg-cloth-text/15" />
        <div className="min-w-0">
          <h2 className="hand-condensed text-cloth-text text-[0.95rem] leading-tight font-semibold tracking-wide uppercase">
            {witness.title}
          </h2>
          <p className="text-cloth-text/70 text-[0.7rem] leading-tight">
            {witness.subtitle}
          </p>
        </div>
      </header>

      <div
        ref={scroller}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain py-3"
        tabIndex={0}
      >
        {witness.lines.map((line, i) => {
          const n = i + 1
          const marked = isMarked(n)
          const numbered = marked || n % 5 === 0

          return (
            <Fragment key={`${n}:${marked ? markKey : ""}`}>
            <div
              data-line={n}
              className={cn(
                "grid grid-cols-[2.75rem_1fr] items-baseline",
                marked && "bg-lemma",
                marked && "animate-[lemma-settle_200ms_ease-out]",
              )}
            >
              <span
                data-numeric
                aria-hidden
                className={cn(
                  "select-none pr-3 text-right font-sans text-[0.75rem] leading-[1.75] tabular-nums",
                  marked ? "text-ink font-semibold" : "text-ink-3",
                )}
              >
                {numbered ? n : ""}
              </span>
              <span
                className={cn(
                  "prose-witness min-w-0 pr-4 break-words",
                  line.trim() === "" && "h-[1.6em]",
                )}
              >
                {line.trim() === "" ? null : <WitnessLine raw={line} />}
              </span>
            </div>

            {preview && preview.at.to === n && (
              <div className="grid grid-cols-[2.75rem_1fr] items-baseline">
                <span
                  aria-hidden
                  className="editorial text-ink-3 select-none pr-3 pt-2 text-right"
                >
                  +
                </span>
                <div className="border-ink bg-paper-inset my-1.5 mr-4 animate-[pending-settle_180ms_ease-out] border-l">
                  <p className="editorial text-ink-2 px-2.5 pt-1.5">
                    Suggested, not yet applied
                  </p>
                  <p className="prose-witness text-ink px-2.5 py-2 whitespace-pre-wrap">
                    {preview.text}
                  </p>
                </div>
              </div>
            )}
            </Fragment>
          )
        })}
        <div className="h-[45%]" aria-hidden />
      </div>
    </section>
  )
}
