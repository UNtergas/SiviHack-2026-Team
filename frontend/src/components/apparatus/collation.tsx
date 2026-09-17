import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import type { Citation } from "@/api/schema"

/**
 * Collation is the signature interaction. Clicking a citation does not scroll
 * a page: both witnesses align on the cited passage at the same moment and
 * the lemma is marked in both, so two people at one screen point at the same
 * thing together.
 */

/** A suggested fix shown in the witness before it is committed to the draft. */
export interface PendingFix {
  issueId: string
  at: Citation
  text: string
}

interface CollationState {
  marks: Citation[]
  /** The entry that produced the current marks, so it can show as live. */
  sourceId: string | null
  collate: (sourceId: string, citations: (Citation | null)[]) => void
  clear: () => void
  registerPane: (siglum: "R" | "P", el: HTMLElement | null) => void
  pending: PendingFix | null
  preview: (fix: PendingFix | null) => void
}

const Ctx = createContext<CollationState | null>(null)

export function CollationProvider({ children }: { children: ReactNode }) {
  const [marks, setMarks] = useState<Citation[]>([])
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingFix | null>(null)
  const panes = useRef<Partial<Record<"R" | "P", HTMLElement | null>>>({})

  const registerPane = useCallback((siglum: "R" | "P", el: HTMLElement | null) => {
    panes.current[siglum] = el
  }, [])

  const collate = useCallback(
    (nextSourceId: string, citations: (Citation | null)[]) => {
      const next = citations.filter((c): c is Citation => c !== null)
      setMarks(next)
      setSourceId(nextSourceId)

      // Both panes move in the same frame: the alignment is the point.
      requestAnimationFrame(() => {
        for (const citation of next) {
          const pane = panes.current[citation.witness]
          const line = pane?.querySelector<HTMLElement>(
            `[data-line="${citation.from}"]`,
          )
          if (!pane || !line) continue

          const offset =
            line.offsetTop - pane.clientHeight / 2 + line.clientHeight / 2
          pane.scrollTo({ top: Math.max(0, offset), behavior: "auto" })
        }
      })
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
    () => ({ marks, sourceId, collate, clear, registerPane, pending, preview }),
    [marks, sourceId, collate, clear, registerPane, pending, preview],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCollation() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCollation must be used inside CollationProvider")
  return ctx
}
