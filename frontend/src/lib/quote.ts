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

/**
 * The backend folds typographic characters before it compares (app/src/app/normalize.py:
 * curly quotes, dashes, the ellipsis). So must we, or a quote the backend verified fails
 * to mark here because the model wrote a hyphen for the RFP's en dash. Same table.
 */
const FOLD: Record<string, string> = {
  "\u201c": "\"",
  "\u201d": "\"",
  "\u201e": "\"",
  "\u00ab": "\"",
  "\u00bb": "\"",
  "\u2018": "'",
  "\u2019": "'",
  "\u201a": "'",
  "\u2039": "'",
  "\u203a": "'",
  "\u2013": "-",
  "\u2014": "-",
  "\u2011": "-",
  "\u2212": "-",
  "\u2026": "...",
}

/** Table pipes are structure, not words, so a quoted row matches its cells; so are the odd spaces. */
const isSpace = (ch: string) =>
  ch === " " ||
  ch === "\t" ||
  ch === "\r" ||
  ch === "\f" ||
  ch === "|" ||
  ch === "\u00a0" || ch === "\u202f" || ch === "\u2009"

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
      for (const folded of (FOLD[ch] ?? ch).toLowerCase()) {
        text.push(folded)
        map.push(offset + j) // an ellipsis becomes three dots that all point at it
      }
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

/** Two quotes name the same passage when one contains the other after normalisation. */
export function samePassage(a: string | null, b: string | null): boolean {
  if (!a || !b) return false
  const x = normalize(a).text
  const y = normalize(b).text
  return x.length > 0 && y.length > 0 && (x.includes(y) || y.includes(x))
}

/**
 * The text as the backend takes it: the `**Variant: …**` fixture banner dropped and
 * trailing whitespace trimmed. Recordings and the backend cache are keyed on this form, so
 * sample buttons, uploads and the outgoing request all go through it.
 */
export function canonical(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^\s*\*\*Variant:/i.test(line))
    .join("\n")
    .trimEnd()
}
