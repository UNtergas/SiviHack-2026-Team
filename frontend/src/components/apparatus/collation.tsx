import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { Citation, Siglum } from "@/api/schema"

/**
 * Collation is the signature interaction. Clicking a citation does not scroll
 * a page: both witnesses align on the cited passage at the same moment and
 * the lemma is marked in both, so two people at one screen point at the same
 * thing together.
 */

/** A suggested fix shown in the witness before it is committed to the draft. */
export interface PendingFix {
  issueId: string
  witness: Siglum
  /** The passage the fix follows; null sets it at the end of the witness. */
  at: Citation | null
  text: string
}

interface CollationState {
  marks: Citation[]
  /** The entry that produced the current marks, so it can show as live. */
  sourceId: string | null
  collate: (sourceId: string, citations: (Citation | null)[]) => void
  clear: () => void
  pending: PendingFix | null
  preview: (fix: PendingFix | null) => void
}

const Ctx = createContext<CollationState | null>(null)

export function CollationProvider({ children }: { children: ReactNode }) {
  const [marks, setMarks] = useState<Citation[]>([])
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingFix | null>(null)

  /**
   * Marks are state; the panes set them into the text and each first mark
   * brings its own pane to it on mount. Both witnesses align in the same
   * render, which is the point.
   */
  const collate = useCallback(
    (nextSourceId: string, citations: (Citation | null)[]) => {
      setMarks(citations.filter((c): c is Citation => c !== null))
      setSourceId(nextSourceId)
    },
    [],
  )

  const clear = useCallback(() => {
    setMarks([])
    setSourceId(null)
    setPending(null)
  }, [])

  const preview = useCallback((fix: PendingFix | null) => setPending(fix), [])

  const value = useMemo(
    () => ({ marks, sourceId, collate, clear, pending, preview }),
    [marks, sourceId, collate, clear, pending, preview],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCollation() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCollation must be used inside CollationProvider")
  return ctx
}
