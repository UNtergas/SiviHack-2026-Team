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
import yeppRfp from "./realworld/yepp-rfp.md?raw"
import yeppEarnstride from "./realworld/yepp-earnstride.md?raw"
import yeppKla from "./realworld/yepp-kla.md?raw"
import yeppConcourse from "./realworld/yepp-concourse.md?raw"
import mpscRfp from "./realworld/mpsc-rfp.md?raw"
import mpscAimpoint from "./realworld/mpsc-aimpoint.md?raw"
import mpscIntellibee from "./realworld/mpsc-intellibee.md?raw"
import mpscRadcube from "./realworld/mpsc-radcube.md?raw"
import mpscHighcloud from "./realworld/mpsc-highcloud.md?raw"
import minivanRfp from "./realworld/minivan-rfp.md?raw"
import minivanBsi from "./realworld/minivan-bsi.md?raw"

export type SampleId =
  | "weak"
  | "medium"
  | "strong"
  | "overpromise"
  | "lims-clinisys"
  | "lims-onq"
  | "yepp-earnstride"
  | "yepp-kla"
  | "yepp-concourse"
  | "mpsc-aimpoint"
  | "mpsc-intellibee"
  | "mpsc-radcube"
  | "mpsc-highcloud"
  | "minivan-bsi"

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
    label: "Clinisys",
    note: "The State awarded this bid: 107.25 of 130 points. Read from a scanned PDF. Redlines, extra costs, a UK security officer.",
    rfp: canonical(limsRfp),
    text: canonical(limsClinisys),
  },
  "lims-onq": {
    label: "OnQ Software",
    note: "The State scored this bid 48.5 of 130: offshore staff, deferred pricing, no public-health references.",
    rfp: canonical(limsRfp),
    text: canonical(limsOnq),
  },
  /* Michigan LEO's 2025 Youth Employment Permit Portal: three bids, one outside the template. */
  "yepp-earnstride": {
    label: "EarnStride",
    note: "The State awarded this bid: 89.5 of 100. Only the experience references were marked down.",
    rfp: canonical(yeppRfp),
    text: canonical(yeppEarnstride),
  },
  "yepp-kla": {
    label: "KL&A",
    note: "The State scored this bid 88.9 of 100: no commitment to the go-live date, train-the-trainer only, missing mobile detail.",
    rfp: canonical(yeppRfp),
    text: canonical(yeppKla),
  },
  "yepp-concourse": {
    label: "Concourse Tech",
    note: "Disqualified: a free-form proposal instead of the State template, no worksheet, no confidentiality form.",
    rfp: canonical(yeppRfp),
    text: canonical(yeppConcourse),
  },
  /* Michigan LARA's 2025 Salesforce maintenance and support: fifteen bids, four of them here. */
  "mpsc-aimpoint": {
    label: "Aimpoint",
    note: "The State awarded this bid: 96 of 100.",
    rfp: canonical(mpscRfp),
    text: canonical(mpscAimpoint),
  },
  "mpsc-intellibee": {
    label: "Intellibee",
    note: "The State scored this bid 77 of 100, under the 80 needed: answered with Salesforce's own material, −15 on the specification worksheet.",
    rfp: canonical(mpscRfp),
    text: canonical(mpscIntellibee),
  },
  "mpsc-radcube": {
    label: "RADcube",
    note: "Disqualified: did not accept the State's contract terms nor submit redlines.",
    rfp: canonical(mpscRfp),
    text: canonical(mpscRadcube),
  },
  "mpsc-highcloud": {
    label: "HighCloud",
    note: "Disqualified: no response to the Business Specification Worksheet.",
    rfp: canonical(mpscRfp),
    text: canonical(mpscHighcloud),
  },
  /* Michigan MDOT's 2026 accessible minivan: a hardware procurement, one bid in template form. */
  "minivan-bsi": {
    label: "Bus Service Inc.",
    note: "The State scored this bid 96 of 100: training pricing placed in the technical response, no org chart.",
    rfp: canonical(minivanRfp),
    text: canonical(minivanBsi),
  },
}

/** How the setup screen groups the buttons. A `live` group needs a backend: nothing is recorded for the mock build. */
export const SAMPLE_GROUPS: { label: string; ids: SampleId[]; live?: boolean }[] = [
  { label: "Load a sample", ids: ["weak", "medium", "strong", "overpromise"] },
  { label: "Real RFP · Michigan LIMS", ids: ["lims-clinisys", "lims-onq"], live: true },
  { label: "Real RFP · Youth Employment Permit Portal", ids: ["yepp-earnstride", "yepp-kla", "yepp-concourse"], live: true },
  { label: "Real RFP · MPSC Salesforce support", ids: ["mpsc-aimpoint", "mpsc-intellibee", "mpsc-radcube", "mpsc-highcloud"], live: true },
  { label: "Real RFP · Accessible minivan", ids: ["minivan-bsi"], live: true },
]
