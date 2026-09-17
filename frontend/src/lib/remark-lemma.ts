import type { Data, Parent, Root, RootContent, Text } from "mdast"
import { visit } from "unist-util-visit"

import { normalize } from "./quote"

/**
 * The witness is set by react-markdown; this plugin makes it an edition.
 *
 * 1. Every block gets its source line for the gutter (`data-line`), so a
 *    reader can still say "line 17" about set text.
 * 2. Every cited passage is wrapped in `<mark>` — across bold, across soft
 *    line breaks, across list items — matched the same way `findQuote` does.
 * 3. The block that ends a pending fix's passage is flagged, so the preview
 *    can be set right after it.
 */

export interface LemmaQuote {
  quote: string
  kind: "mark" | "pending"
}

interface Props extends Record<string, unknown> {
  className?: string[]
}

type WithData = { data?: Data & { hName?: string; hProperties?: Props } }

const props = (node: WithData): Props => {
  node.data ??= {}
  ;(node.data as { hProperties?: Props }).hProperties ??= {}
  return (node.data as { hProperties: Props }).hProperties
}

const BLOCKS = new Set(["paragraph", "heading", "table", "blockquote", "code", "thematicBreak", "html"])

interface Slot {
  node: Text
  parent: Parent
  index: number
  block: RootContent & WithData
  /** This node's raw text occupies `[at, end)` of the stream. */
  at: number
  end: number
}

interface Segment {
  start: number
  end: number
  pending: boolean
}

export function remarkLemma(options: { quotes: LemmaQuote[] }) {
  return (tree: Root) => {
    // ---- 1. blocks and their lines -------------------------------------------------
    const blocks = new Map<Text, RootContent & WithData>()
    const cells = new Map<Text, RootContent | null>()
    const annotate = (node: RootContent & WithData, depth: number) => {
      const p = props(node)
      p.dataBlock = "true"
      p.dataLine = String(node.position?.start.line ?? "")
      if (depth) p.dataDepth = String(depth)
    }
    const walk = (
      parent: Parent,
      depth: number,
      block: (RootContent & WithData) | null,
      cell: RootContent | null,
    ) => {
      for (const child of parent.children as (RootContent & WithData)[]) {
        let own = block
        if (child.type === "listItem") {
          annotate(child, depth)
          own = child
          walk(child as Parent, depth + 1, own, cell)
          continue
        }
        if (child.type === "list") {
          walk(child as Parent, depth, own, cell)
          continue
        }
        if (!own && BLOCKS.has(child.type)) {
          annotate(child, depth)
          own = child
        }
        const inCell = child.type === "tableCell" ? child : cell
        if (child.type === "text" && own) {
          blocks.set(child as Text, own)
          cells.set(child as Text, inCell)
        }
        if ("children" in child) walk(child as Parent, depth, own, inCell)
      }
    }
    walk(tree, 0, null, null)

    if (options.quotes.length === 0) return

    // ---- 2. the stream ---------------------------------------------------------------
    // Raw text of every text node in order, blocks separated by a newline, then
    // normalized once, so whitespace at node boundaries survives and every
    // normalized character maps back to a raw offset.
    const slots: Slot[] = []
    let raw = ""
    let lastBlock: RootContent | null = null
    let lastCell: RootContent | null = null
    visit(tree, "text", (node: Text, index, parent) => {
      if (index === undefined || !parent) return
      const block = blocks.get(node)
      if (!block) return
      const cell = cells.get(node) ?? null
      if (lastBlock && block !== lastBlock) raw += "\n"
      else if (cell !== lastCell) raw += " "
      lastBlock = block
      lastCell = cell
      const at = raw.length
      raw += node.value
      slots.push({ node, parent, index, block, at, end: raw.length })
    })
    const norm = normalize(raw)

    // ---- 3. match quotes, in raw offsets ------------------------------------------
    const segments: Segment[] = []
    for (const { quote, kind } of options.quotes) {
      const q = normalize(quote).text
      if (!q) continue
      const at = norm.text.indexOf(q)
      if (at < 0) continue
      segments.push({
        start: norm.map[at],
        end: norm.map[at + q.length - 1] + 1,
        pending: kind === "pending",
      })
    }
    if (segments.length === 0) return

    segments.sort((a, b) => a.start - b.start)
    const merged: Segment[] = []
    for (const s of segments) {
      const last = merged[merged.length - 1]
      if (last && s.start <= last.end) {
        last.end = Math.max(last.end, s.end)
        last.pending ||= s.pending
      } else merged.push({ ...s })
    }

    // ---- 4. split text nodes and wrap the covered pieces ----------------------------
    let first = true
    const replacements = new Map<Slot, RootContent[]>()
    for (const slot of slots) {
      const pieces: RootContent[] = []
      let cursor = 0
      for (const seg of merged) {
        if (seg.end <= slot.at || seg.start >= slot.end) continue
        const sa = Math.max(seg.start, slot.at) - slot.at
        const sb = Math.min(seg.end, slot.end) - slot.at
        if (sa > cursor) pieces.push({ type: "text", value: slot.node.value.slice(cursor, sa) })
        const mark: Text & WithData = {
          type: "text",
          value: slot.node.value.slice(sa, sb),
          data: {
            hName: "mark",
            hProperties: {
              dataLemma: seg.pending ? "pending" : "mark",
              ...(first ? { dataLemmaScroll: "true" } : {}),
            },
          },
        }
        first = false
        pieces.push(mark)
        cursor = sb
        props(slot.block).dataMarked = "true"
        if (seg.pending && seg.end <= slot.end) props(slot.block).dataPending = "true"
      }
      if (pieces.length === 0) continue
      if (cursor < slot.node.value.length) {
        pieces.push({ type: "text", value: slot.node.value.slice(cursor) })
      }
      replacements.set(slot, pieces)
    }

    // Splice from the end of each parent so earlier indices stay valid.
    const byParent = new Map<Parent, Slot[]>()
    for (const slot of replacements.keys()) {
      const list = byParent.get(slot.parent) ?? []
      list.push(slot)
      byParent.set(slot.parent, list)
    }
    for (const [parent, list] of byParent) {
      list.sort((a, b) => b.index - a.index)
      for (const slot of list) {
        parent.children.splice(slot.index, 1, ...(replacements.get(slot) as never[]))
      }
    }
  }
}
