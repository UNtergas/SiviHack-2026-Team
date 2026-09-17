import { cn } from "@/lib/utils"
import type { Citation } from "@/api/schema"
import { excerpt } from "@/lib/quote"

import { Siglum } from "./siglum"
import { useCollation } from "./collation"

/**
 * `R §4.4` — the receipt. Every judgment in the apparatus carries one, and
 * every one is live: it collates rather than navigates.
 */
export function CitationRef({
  citation,
  sourceId,
  also,
  className,
}: {
  citation: Citation
  sourceId: string
  /** Collated at the same time, so both witnesses align together. */
  also?: (Citation | null)[]
  className?: string
}) {
  const { collate, sourceId: live } = useCollation()
  const isLive = live === sourceId

  const label = citation.section || excerpt(citation.quote, 4)

  return (
    <button
      type="button"
      onClick={() => collate(sourceId, [citation, ...(also ?? [])])}
      title={`${citation.witness} §${citation.section}: “${excerpt(citation.quote, 12)}”`}
      className={cn(
        "group/cite inline-flex items-baseline gap-[0.3em] align-baseline",
        "font-sans text-[0.7rem] font-semibold tracking-wide whitespace-nowrap",
        "cursor-pointer transition-colors duration-150",
        isLive ? "text-ink" : "text-ink-2 hover:text-ink",
        className,
      )}
    >
      <Siglum of={citation.witness} className="translate-y-[0.06em]" />
      <span
        className={cn(
          "underline decoration-rule underline-offset-[3px]",
          "group-hover/cite:decoration-ink",
          isLive && "decoration-ink",
        )}
      >
        §{label}
      </span>
    </button>
  )
}
