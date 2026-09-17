import { cn } from "@/lib/utils"
import type { Verdict } from "@/api/schema"
import { VERDICT_LABEL } from "@/lib/score"

import { useSteppedNumber } from "./stepped-number"

const CLOTH: Record<Verdict, string> = {
  ready: "bg-cloth-ready",
  fix: "bg-cloth-fix",
  "not-ready": "bg-cloth-stop",
}

/**
 * The verdict is bookcloth at page scale, and the traffic light is the binding
 * itself rather than a dot. The judgment is the poster element; the score is a
 * bound numeral subordinate to it, at its left.
 */
export function ClothBand({
  verdict,
  score,
  children,
}: {
  verdict: Verdict
  score: number
  children?: React.ReactNode
}) {
  const shown = useSteppedNumber(score)

  return (
    <div
      className={cn(
        "text-cloth-text transition-colors duration-500",
        CLOTH[verdict],
      )}
    >
      <div className="mx-auto flex max-w-[112rem] flex-col gap-5 px-5 py-6 sm:px-8 md:flex-row md:items-center md:gap-8 md:py-7">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
          <span
            className="bg-ink/20 flex shrink-0 items-baseline gap-0.5 px-3 py-2"
            aria-label={`Overall score ${shown.toFixed(1)} out of 5`}
          >
            <span
              data-numeric
              aria-hidden
              className="font-sans text-[1.6rem] leading-none font-semibold tabular-nums sm:text-[2rem]"
            >
              {shown.toFixed(1)}
            </span>
            <span
              aria-hidden
              className="text-cloth-text/85 font-sans text-[0.8rem] font-semibold"
            >
              /5
            </span>
          </span>

          <h1
            className="hand-condensed min-w-0 flex-1 leading-[0.9] font-semibold uppercase"
            style={{
              fontSize: "clamp(2.1rem, 6.4vw, 6rem)",
              letterSpacing: "-0.035em",
            }}
          >
            {VERDICT_LABEL[verdict]}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3">{children}</div>
      </div>
    </div>
  )
}
