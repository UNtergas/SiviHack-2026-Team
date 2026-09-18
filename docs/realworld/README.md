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
| 2 | 250000000859, Laboratory Information Management System (MDHHS) | `pair2-lims/rfp.md`, `pair2-lims/onq.md` (the losing bid, 48.5 / 130) | `pair2-lims/expected.md` |

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
# 3. split the State's template from the bidder's words
python3 ../docs/realworld/tools/split_michigan.py ../docs/realworld/raw/<pair>/<vendor>.md ../docs/realworld/raw/<pair>/split "<Vendor Name>" "<name>,<product>,<partner>"
#    → split/rfp.md (the template: headings, numbered requirements, questions) and split/<vendor>.md
#      (answers labelled by section, checkbox choices as "- 8.3.1: Requires Customization")
# 4. run the reviewer on the pair, recording the model's answers into the replay fixtures so the
#    same pair replays for free afterwards (in the UI too: `make warm` / `./run.sh warm` fill the cache from them)
LLM_RECORD_DIR=tests/fixtures/replay uv run --env-file .env python ../docs/realworld/tools/run_pair.py ../docs/realworld/<pair>/rfp.md ../docs/realworld/<pair>/<vendor>.md ../docs/realworld/<pair>/results/<vendor>.json
```

The split is heuristic. Where the PDF layout glued a comment column onto the requirement text
(section 7.2.1 in pair 2) a few bidder sentences stay on the RFP side; a leak count is printed.

## In the UI

The pair is a sample button on the setup screen, under "Real RFP · Michigan LIMS", when a backend is
configured (the mock build has no recording for it). The copies the UI ships live in
`frontend/src/api/fixtures/realworld/` and a test keeps them byte-identical to the pair files.

## Results

See "What the reviewer found" at the end of each pair's `expected.md`.
