import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

import type { Citation, RequirementStatus } from "@/api/schema"

/** How a collation is washed in the witnesses: the status it illustrates, or the plain lemma ochre. */
export type Tone = RequirementStatus | null

/**
 * Collation is the signature interaction. Clicking a citation does not scroll
 * a page: both witnesses align on the cited passage at the same moment and
 * the lemma is marked in both, so two people at one screen point at the same
 * thing together. A witness that is closed opens for it (`onCollate`).
 */

interface CollationState {
  marks: Citation[]
  /** The entry that produced the current marks, so it can show as live. */
  sourceId: string | null
  tone: Tone
  collate: (sourceId: string, citations: (Citation | null)[], tone?: Tone) => void
  clear: () => void
}

const Ctx = createContext<CollationState | null>(null)

export function CollationProvider({
  children,
  onCollate,
}: {
  children: ReactNode
  /** Told of every collation, with the marks that were set: the layout opens the witnesses they need. */
  onCollate?: (sourceId: string, marks: Citation[]) => void
}) {
  const [marks, setMarks] = useState<Citation[]>([])
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [tone, setTone] = useState<Tone>(null)

  /**
   * Marks are state; the panes set them into the text and each first mark
   * brings its own pane to it on mount. Both witnesses align in the same
   * render, which is the point.
   */
  const collate = useCallback(
    (nextSourceId: string, citations: (Citation | null)[], nextTone: Tone = null) => {
      const next = citations.filter((c): c is Citation => c !== null)
      setMarks(next)
      setSourceId(nextSourceId)
      setTone(nextTone)
      onCollate?.(nextSourceId, next)
    },
    [onCollate],
  )

  const clear = useCallback(() => {
    setMarks([])
    setSourceId(null)
    setTone(null)
  }, [])

  const value = useMemo(
    () => ({ marks, sourceId, tone, collate, clear }),
    [marks, sourceId, tone, collate, clear],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCollation() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCollation must be used inside CollationProvider")
  return ctx
}
