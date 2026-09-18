# Real-world procurement pairs

Public RFP responses from the State of Michigan's procurement site, with the State's own award
synopsis as the answer key. They test the reviewer on documents of real length and format,
which the four sponsor samples do not.

The State's documents are public records, but the archives are large and their site blocks
plain HTTP clients, so only extracted text is committed. `raw/` (archives, PDFs, intermediate
Markdown) is ignored by git.

## Pairs

| Pair | Solicitation | Files here | Answer key |
|---|---|---|---|
| 2 | 250000000859, Laboratory Information Management System (MDHHS) | `pair2-lims/rfp.md`; `pair2-lims/clinisys.md` (the awarded bid, 107.25 / 130, from a scanned PDF via OCR); `pair2-lims/onq.md` (the losing bid, 48.5 / 130) | `pair2-lims/expected.md` |
| 3 | 260000000387, Youth Employment Permit Portal (LEO) | `pair3-youth-portal/rfp.md`; `earnstride.md` (awarded, 89.5); `kla.md` (88.9); `concourse.md` (disqualified, free-form) | `pair3-youth-portal/expected.md` |
| 1 | 250000001460, MPSC Salesforce Maintenance and Support (LARA) | `pair1-salesforce/rfp.md`; `aimpoint.md` (awarded, 96); `intellibee.md` (77); `radcube.md` and `highcloud.md` (disqualified) | `pair1-salesforce/expected.md` |
| 7 | 260000000513, Accessible Passenger Vehicle, Modified Minivan (MDOT) | `pair7-minivan/rfp.md`; `bsi.md` (96; the winner's archive has no template response) | `pair7-minivan/expected.md` |

Sources for pair 2 (copy the whole line, the query string is part of the URL):

- Synopsis: https://www.michigan.gov/dtmb/-/media/Project/Websites/dtmb/Procurement/Bid-Proposal-Documents/250000000859-Laboratory-Information-Mgt-System/Award-Letter-and-Synopsis.pdf?rev=8036f08321044cd0b4b52ebcfb632ec9&hash=4473FC2260BC5FF0A6E5B4A717A73383
- OnQ Software: https://www.michigan.gov/dtmb/-/media/Project/Websites/dtmb/Procurement/Bid-Proposal-Documents/250000000859-Laboratory-Information-Mgt-System/4---OnQ-Software-Pty-Ltd---1-of-1.zip?rev=f23a7561e2324334ae654fcc2b99ab31&hash=B2E3F0D77FCB8C23A2C902BACF4BDBC9
- Clinisys (winner, scanned pages): https://www.michigan.gov/dtmb/-/media/Project/Websites/dtmb/Procurement/Bid-Proposal-Documents/250000000859-Laboratory-Information-Mgt-System/2--Clinisys-Inc--1-of-2.zip?rev=af026adee9774dc4903bd4c400e539ff&hash=4EEFCED08FB468BA197E4FFBC09E7D63

## How a pair is made

A Michigan bid is the State's own template filled in: Vendor Questions Worksheet, then Schedule A
(the Statement of Work) with the bidder's answers under "Bidder Response", exception boxes and
checkbox tables (Currently Capability / Requires Configuration / Requires Customization / Future
Enhancement / Not Available). The RFP text therefore lives inside every bid.

```bash
# 1. fetch the archive in a browser (the site returns 403 to curl), unzip into raw/<pair>/
# 2. PDF → Markdown (scanned pages: ocr_vision.py first, macOS only, free)
cd app && uv run --with pymupdf4llm python ../docs/realworld/tools/pdf_to_md.py "<bid>.pdf" ../docs/realworld/raw/<pair>/<vendor>.md
# 3. split the State's template from the bidder's words (a text-layer PDF: the Markdown markers;
#    a scanned one: the bidder's lines are whatever does not match the template split from another bid)
python3 ../docs/realworld/tools/split_michigan.py ../docs/realworld/raw/<pair>/<vendor>.md ../docs/realworld/raw/<pair>/split "<Vendor Name>" "<name>,<product>,<partner>"
#    → split/rfp.md (the template: headings, numbered requirements, questions) and split/<vendor>.md
#      (answers labelled by section, checkbox choices as "- 8.3.1: Requires Customization")
uv run python ../docs/realworld/tools/split_by_template.py ../docs/realworld/raw/<pair>/<vendor>-ocr.md ../docs/realworld/<pair>/rfp.md ../docs/realworld/<pair>/<vendor>.md "<Vendor Name>"
# 4. run the reviewer on the pair, recording the model's answers into the replay fixtures so the
#    same pair replays for free afterwards (in the UI too: `make warm` / `./run.sh warm` fill the cache from them)
LLM_RECORD_DIR=tests/fixtures/replay uv run --env-file .env python ../docs/realworld/tools/run_pair.py ../docs/realworld/<pair>/rfp.md ../docs/realworld/<pair>/<vendor>.md ../docs/realworld/<pair>/results/<vendor>.json
```

The split is heuristic. Where the PDF layout glued a comment column onto the requirement text
(section 7.2.1 in pair 2) a few bidder sentences stay on the RFP side; a leak count is printed.

## In the UI

Every bid is a sample button on the setup screen, one row per solicitation, when a backend is
configured (the mock build has no recording for them). The buttons carry the vendor's name only;
the State's score and outcome are in the tooltip, so a demo does not announce the verdict. The copies the UI ships live in
`frontend/src/api/fixtures/realworld/` and a test keeps them byte-identical to the pair files.

## Results (18 September 2026, Gemini 3.8 Flash; `tools/summarize.py` prints this table)

| Solicitation | Bid | State's verdict | Reviewer | Order kept? |
|---|---|---|---|---|
| Youth Employment Permit Portal | EarnStride | awarded, 89.5 | 4.0, Ready to send | yes |
| | KL&A | 88.9 | 3.7, Fix before sending | yes |
| | Concourse Tech | disqualified, wrong format | 2.4, Not ready; HIGH violation "failed to complete the required business worksheet" | yes |
| MPSC Salesforce support | Aimpoint | awarded, 96 | 3.1, Fix before sending | yes |
| | Intellibee | 77 | 3.0, Fix before sending | yes |
| | RADcube | disqualified, refused the terms | 2.4, Not ready; contradicted: "responded No to affirming agreement with the Contract Terms" | yes |
| | HighCloud | disqualified, no worksheet | 1.7, Not ready; 15 partial and 7 missing | yes |
| Laboratory Information System | Clinisys | awarded, 107.25 / 130 | 2.3, Not ready; UK security officer flagged | **no** |
| | OnQ Software | 48.5 / 130 | 2.4, Not ready; offshore access and staff, HIGH | |
| Accessible minivan | Bus Service Inc. | 96 | 1.7, Not ready; 19 attachment documents "missing" | n/a |

Two of three multi-bid solicitations come out in the State's order with the State's reasons.
The LIMS pair does not: the two bids differ on hundreds of functional requirements the single
extraction call does not reach, and the winner is read from a scan. Pricing scores 1 everywhere
because every Michigan bid keeps Schedule B in a separate file. Details and the misses are in
each pair's `expected.md`. Runs are USD 0.07–0.57 and 12–67 seconds each; the recordings in
`app/tests/fixtures/replay` replay them for free.
