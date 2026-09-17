import { Fragment, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * A witness prints as a page, not as a source file.
 *
 * Markdown markers are set rather than shown — a heading becomes a heading,
 * `**x**` becomes bold in place. One source line stays exactly one rendered
 * line, because the line numbers are what every citation points at.
 */

type Kind = "h1" | "h2" | "h3" | "bullet" | "table" | "rule" | "text"

interface Parsed {
  kind: Kind
  text: string
  indent: number
  cells?: string[]
}

export function parseWitnessLine(raw: string): Parsed {
  const heading = raw.match(/^(#{1,6})\s+(.*)$/)
  if (heading) {
    const level = Math.min(heading[1].length, 3)
    return { kind: `h${level}` as Kind, text: heading[2], indent: 0 }
  }

  if (/^\s*\|[\s:-]*\|[\s|:-]*$/.test(raw) && raw.includes("-")) {
    return { kind: "rule", text: "", indent: 0 }
  }

  if (/^\s*\|.*\|\s*$/.test(raw)) {
    const cells = raw
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim())
    return { kind: "table", text: raw, indent: 0, cells }
  }

  const bullet = raw.match(/^(\s*)[-*]\s+(.*)$/)
  if (bullet) {
    return { kind: "bullet", text: bullet[2], indent: bullet[1].length }
  }

  return { kind: "text", text: raw, indent: 0 }
}

/** `**bold**` set in place. Everything else passes through verbatim. */
function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/)
    return bold ? (
      <strong key={i} className="font-semibold">
        {bold[1]}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  })
}

export function WitnessLine({ raw }: { raw: string }) {
  const line = parseWitnessLine(raw)

  if (line.kind === "rule") {
    return (
      <span className="witness-line block py-[0.55em]">
        <span className="bg-rule block h-px w-full" />
      </span>
    )
  }

  if (line.kind === "table") {
    return (
      <span className="witness-line flex flex-wrap gap-x-4">
        {line.cells?.map((cell, i) => (
          <span
            key={i}
            className={cn(i === 0 ? "text-ink font-semibold" : "text-ink")}
          >
            {inline(cell)}
          </span>
        ))}
      </span>
    )
  }

  if (line.kind === "h1" || line.kind === "h2" || line.kind === "h3") {
    return (
      <span
        className={cn(
          "hand-condensed block font-semibold tracking-wide uppercase",
          line.kind === "h1" && "text-ink pt-1 text-[1.05em]",
          line.kind === "h2" && "text-ink text-[0.92em]",
          line.kind === "h3" && "text-ink-2 text-[0.85em]",
        )}
      >
        {line.text}
      </span>
    )
  }

  if (line.kind === "bullet") {
    return (
      <span
        className="witness-line block"
        style={{ paddingLeft: `${1.15 + line.indent * 0.5}em` }}
      >
        <span aria-hidden className="text-ink-3 inline-block w-[1.15em] -ml-[1.15em]">
          &bull;
        </span>
        {inline(line.text)}
      </span>
    )
  }

  return <span className="witness-line block">{inline(line.text)}</span>
}
