/**
 * Quotes are the currency of citations. The model returns verbatim passages,
 * the apparatus highlights them in the set text, and Apply inserts a fix after
 * them. Matching is insensitive to whitespace, case and Markdown markers,
 * because a passage is quoted from the raw file but read as set type.
 */

export interface Normalized {
  text: string
  /** `map[i]` is the index in the source of normalized character `i`. */
  map: number[]
}

/** Heading hashes, list bullets and numbers, blockquote marks — at line start. */
const BLOCK_MARKER = /^[ \t]{0,3}(?:#{1,6}[ \t]+|[-*+][ \t]+|\d+[.)][ \t]+|>[ \t]?)/

/** Table pipes are structure, not words, so a quoted row matches its cells. */
const isSpace = (ch: string) =>
  ch === " " || ch === "\t" || ch === "\r" || ch === "\f" || ch === "|"

export function normalize(source: string): Normalized {
  const text: string[] = []
  const map: number[] = []
  let pendingSpace = -1
  let offset = 0

  for (const line of source.split("\n")) {
    const marker = BLOCK_MARKER.exec(line)
    for (let j = marker ? marker[0].length : 0; j < line.length; j++) {
      const ch = line[j]
      if (ch === "*" || ch === "_" || ch === "`") continue
      if (isSpace(ch)) {
        if (pendingSpace < 0) pendingSpace = offset + j
        continue
      }
      if (pendingSpace >= 0 && text.length > 0) {
        text.push(" ")
        map.push(pendingSpace)
      }
      pendingSpace = -1
      text.push(ch.toLowerCase())
      map.push(offset + j)
    }
    if (pendingSpace < 0) pendingSpace = offset + line.length
    offset += line.length + 1
  }
  return { text: text.join(""), map }
}

/** Source range `[start, end)` of the first occurrence of `quote`, or null. */
export function findQuote(
  source: string,
  quote: string,
): { start: number; end: number } | null {
  const q = normalize(quote).text
  if (!q) return null
  const src = normalize(source)
  const at = src.text.indexOf(q)
  if (at < 0) return null
  return { start: src.map[at], end: src.map[at + q.length - 1] + 1 }
}

/** The nearest heading above the quote, as plain words. Null if none. */
export function sectionOf(source: string, quote: string): string | null {
  const hit = findQuote(source, quote)
  if (!hit) return null
  const before = source.slice(0, hit.start).split("\n")
  for (let i = before.length - 1; i >= 0; i--) {
    const m = /^[ \t]{0,3}#{1,6}[ \t]+(.+)$/.exec(before[i])
    if (m) return plain(m[1])
  }
  return null
}

/**
 * Insert `block` as its own paragraph after the paragraph that contains
 * `quote`, or at the end of the text when the quote cannot be found. The
 * inserted form is exactly `\n\n${block}`, which is what revert removes.
 */
export function insertAfterQuote(source: string, quote: string | null, block: string): string {
  const hit = quote ? findQuote(source, quote) : null
  if (!hit) return `${source.trimEnd()}\n\n${block}`
  const gap = /\n[ \t]*\n/g
  gap.lastIndex = hit.end
  const next = gap.exec(source)
  const at = next ? next.index : source.length
  return `${source.slice(0, at)}\n\n${block}${source.slice(at)}`
}

/** Markdown as plain words for display: markers dropped, whitespace collapsed. */
export function plain(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => line.replace(BLOCK_MARKER, ""))
    .join(" ")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** The first `n` words of a passage, for a lemma. */
export function excerpt(markdown: string, n = 8): string {
  const words = plain(markdown).split(" ")
  return words.length <= n ? words.join(" ") : `${words.slice(0, n).join(" ")}…`
}
