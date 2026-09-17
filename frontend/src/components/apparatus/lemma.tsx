import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * An apparatus entry: `lemma ] reading`.
 *
 * In a critical edition the square bracket divides the reading in the text
 * from what the witnesses say about it. It is the mark that makes an entry an
 * apparatus entry rather than a styled list row, and the whole world turns on
 * it. The lemma is set in the witnesses' face; the reading is the editor's.
 */
export function Lemma({
  children,
  reading,
  className,
  readingClassName,
}: {
  children: ReactNode
  reading: ReactNode
  className?: string
  readingClassName?: string
}) {
  return (
    <span className={cn("min-w-0", className)}>
      <span className="font-serif">{children}</span>
      <span aria-hidden className="lemma-bracket">
        ]
      </span>
      <span
        className={cn("editorial text-ink-2", readingClassName)}
      >
        {reading}
      </span>
    </span>
  )
}
