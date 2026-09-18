# PDFs for the upload path

The same documents as PDF, for the "Upload .md or .pdf" button. Every one here has a text
layer except the scan, which is there to show the refusal.

| File | What it is |
|---|---|
| `rfp_nordframe.pdf`, `response_1_weak.pdf` … `response_4_overpromise.pdf` | The sponsor's samples, rendered from the Markdown next door with `docs/realworld/tools/md_to_pdf.py`. The converter restores every heading and the sentences come back verbatim, so the review reads the same as from the .md file. The variant banner is left out. |
| `youth_permit_portal_rfp.pdf` | The State of Michigan's RFP 260000000387 (Youth Employment Permit Portal), the template text split out of a bid, rendered to 16 pages. |
| `youth_permit_portal_bid_concourse.pdf` | Concourse Tech's public bid for that RFP, the original 37-page PDF from the State's procurement site. It ignored the State's template and was disqualified for it; the review shows the gaps. |
| `scanned_example.pdf` | Three pages with no text layer. Upload it to see "this PDF has no text layer: it is a scan". |

A PDF's text differs a little from the Markdown (line breaks, bold marks), so the first review
of each is a live model run, about three cents and ten to twenty seconds for the samples; with
the cache on, the second is free.
