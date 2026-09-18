/**
 * The sponsor's sample set, imported verbatim from the Markdown files rather
 * than transcribed, so every citation quotes text that is really there. Copied
 * into the app from `sample_data/` at the repo root so the frontend builds and
 * deploys standalone; a backend test keeps the copies byte-identical.
 *
 * All parties in these documents are fictional; the files say so themselves.
 */

import { canonical } from "@/lib/quote"

import rfp from "./samples/rfp_nordframe.md?raw"
import weak from "./samples/response_1_weak.md?raw"
import medium from "./samples/response_2_medium.md?raw"
import strong from "./samples/response_3_strong.md?raw"
import overpromise from "./samples/response_4_overpromise.md?raw"
import limsRfp from "./realworld/lims-rfp.md?raw"
import limsOnq from "./realworld/lims-onq.md?raw"
import limsClinisys from "./realworld/lims-clinisys.md?raw"

export type SampleId = "weak" | "medium" | "strong" | "overpromise" | "lims-clinisys" | "lims-onq"

/**
 * `canonical` drops the `**Variant: WEAK — …**` fixture banner (it would announce the
 * verdict inside the text under review) and trailing whitespace. The backend's recordings
 * and cache are keyed on exactly this text.
 */
export const RFP_TEXT = canonical(rfp)

export interface Sample {
  label: string
  note: string
  /** The RFP this response answers. */
  rfp: string
  text: string
}

export const SAMPLES: Record<SampleId, Sample> = {
  weak: {
    label: "Weak",
    note: "Generic, pricing and timeline deferred, several requirements unaddressed",
    rfp: RFP_TEXT,
    text: canonical(weak),
  },
  medium: {
    label: "Medium",
    note: "Good functional scope, but vague on pricing, timeline and risk",
    rfp: RFP_TEXT,
    text: canonical(medium),
  },
  strong: {
    label: "Strong",
    note: "Addresses every requirement, priced and scheduled, risks disclosed",
    rfp: RFP_TEXT,
    text: canonical(strong),
  },
  overpromise: {
    label: "Overpromising",
    note: "Scope balloons past the ask and contradicts a stated constraint",
    rfp: RFP_TEXT,
    text: canonical(overpromise),
  },
  /*
   * A real procurement: the State of Michigan's 2025 RFP for a public-health laboratory
   * information system, and the losing bid, as the State's own template split into the
   * requirements and the bidder's answers (see docs/realworld). The State scored it 48.5 of
   * 130 and named offshore access and offshore personnel among the reasons.
   */
  "lims-clinisys": {
    label: "Clinisys · won, 107.25 / 130",
    note: "Michigan RFP 250000000859, the awarded bid, read from a scanned PDF: redlines, extra costs, a UK security officer",
    rfp: canonical(limsRfp),
    text: canonical(limsClinisys),
  },
  "lims-onq": {
    label: "OnQ Software · lost, 48.5 / 130",
    note: "Michigan RFP 250000000859, a 300-page bid: offshore staff, deferred pricing, no public-health references",
    rfp: canonical(limsRfp),
    text: canonical(limsOnq),
  },
}

/** How the setup screen groups the buttons. A `live` group needs a backend: nothing is recorded for the mock build. */
export const SAMPLE_GROUPS: { label: string; ids: SampleId[]; live?: boolean }[] = [
  { label: "Load a sample", ids: ["weak", "medium", "strong", "overpromise"] },
  { label: "Real RFP · Michigan LIMS", ids: ["lims-clinisys", "lims-onq"], live: true },
]
