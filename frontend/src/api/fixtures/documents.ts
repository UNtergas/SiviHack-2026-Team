/**
 * The sponsor's sample set, imported verbatim from the Markdown files rather
 * than transcribed, so line numbers in a citation always match the text on
 * screen. Copied into the app from `sample_data/` at the repo root so the
 * frontend builds and deploys standalone.
 *
 * All parties in these documents are fictional; the files say so themselves.
 */

import rfp from "./samples/rfp_nordframe.md?raw"
import weak from "./samples/response_1_weak.md?raw"
import medium from "./samples/response_2_medium.md?raw"
import strong from "./samples/response_3_strong.md?raw"
import overpromise from "./samples/response_4_overpromise.md?raw"

export type SampleId = "weak" | "medium" | "strong" | "overpromise"

/**
 * The sample files carry a `**Variant: WEAK — …**` annotation describing what
 * each response is meant to demonstrate. That is fixture metadata, not part of
 * the proposal, and leaving it in would announce the verdict inside the text
 * under review. Dropped before the text is split, so line numbers, the
 * rendered page and every anchor-derived citation agree.
 */
const stripVariantBanner = (text: string) =>
  text
    .split("\n")
    .filter((line) => !/^\s*\*\*Variant:/i.test(line))
    .join("\n")

export const RFP_TEXT = rfp.trimEnd()

export const SAMPLES: Record<
  SampleId,
  { label: string; note: string; text: string }
> = {
  weak: {
    label: "Weak",
    note: "Generic, pricing and timeline deferred, several requirements unaddressed",
    text: stripVariantBanner(weak).trimEnd(),
  },
  medium: {
    label: "Medium",
    note: "Good functional scope, but vague on pricing, timeline and risk",
    text: stripVariantBanner(medium).trimEnd(),
  },
  strong: {
    label: "Strong",
    note: "Addresses every requirement, priced and scheduled, risks disclosed",
    text: stripVariantBanner(strong).trimEnd(),
  },
  overpromise: {
    label: "Overpromising",
    note: "Scope balloons past the ask and contradicts a stated constraint",
    text: stripVariantBanner(overpromise).trimEnd(),
  },
}

export const RFP_LINES = RFP_TEXT.split("\n")

export const SAMPLE_LINES: Record<SampleId, string[]> = {
  weak: SAMPLES.weak.text.split("\n"),
  medium: SAMPLES.medium.text.split("\n"),
  strong: SAMPLES.strong.text.split("\n"),
  overpromise: SAMPLES.overpromise.text.split("\n"),
}

/**
 * Citations are authored against text, not counted line numbers, so editing a
 * sample can never silently move a finding onto the wrong passage.
 */
export function lineOf(lines: string[], anchor: string): number {
  const i = lines.findIndex((l) => l.includes(anchor))
  if (i === -1) throw new Error(`sample anchor not found: ${anchor}`)
  return i + 1
}

export function spanOf(
  lines: string[],
  startAnchor: string,
  endAnchor = startAnchor,
): [number, number] {
  return [lineOf(lines, startAnchor), lineOf(lines, endAnchor)]
}
