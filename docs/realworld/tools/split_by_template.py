"""Bidder's words out of an OCR'd (or plain-text) Michigan bid, given the State's template.

The template is the `rfp.md` already split from another bidder's file for the same solicitation.
Every OCR line that fuzzily matches a template line is the State's; every other line of some length
is the bidder's. State headings and the question a block answers are kept as context.
usage: uv run python split_by_template.py <bid.txt> <rfp.md> <out.md> "<Vendor>"
"""
import re
import sys
from pathlib import Path

from rapidfuzz import fuzz, process

src, rfp, out, vendor = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4]

def norm(s: str) -> str:
    s = re.sub(r"[*#>|`_]", " ", s)
    s = re.sub(r"[^a-z0-9 ]+", " ", s.lower())
    return re.sub(r"\s+", " ", s).strip()

template = [norm(l) for l in rfp.read_text().split("\n")]
template = [l for l in template if len(l) >= 12]
CHROME = re.compile(r"^(<!-- page \d+ .*-->|Michigan\.gov/MiProcurement.*|RFP \d{9,}|Page \| \d+|Page \d+ of \d+|\d{1,3})$")
HEADING = re.compile(r"^(\d{1,2}(?:\.\d{1,2})?)\.?\s+([A-Z][A-Za-z ,&/()'\-]{3,70})$")
NUMBERED = re.compile(r"^\d{1,2}(?:\.\d{1,2}){1,3}\b")

lines = [l.strip() for l in src.read_text().split("\n")]

# Only the questionnaire the State scores: the Vendor Questions Worksheet and Schedule A. The
# proposal instructions, the contract terms between them and everything after Schedule B are
# neither the template nor the bidder's answers.
def first(pattern: str, start: int = 0) -> int | None:
    rx = re.compile(pattern, re.I)
    return next((i for i in range(start, len(lines)) if rx.match(lines[i])), None)

def first_upper(pattern: str) -> int | None:  # the heading is set in capitals; a table mention is not
    rx = re.compile(pattern)
    return next((i for i, l in enumerate(lines) if rx.match(l)), None)

ws = first_upper(r"^VENDOR QUESTIONS WORKSHEET\s*$") or first(r"^VENDOR QUESTIONS WORKSHEET\s*$")
sa = first(r"^SCHEDULE A\s*[-–]\s*STATEMENT OF WORK", ws or 0)
sb = first(r"^SCHEDULE B\s*[-–]\s*PRICING", sa or 0)
terms = first(r"^(ATTACHMENT 1\b.*RESUME|SOFTWARE CONTRACT TERMS|CONTRACT TERMS AND CONDITIONS|FEDERAL PROVISIONS ADDENDUM)", ws or 0)
if ws is not None and sb is not None:
    cut = lines[ws:sb]
    if terms is not None and sa is not None and ws < terms < sa:
        cut = lines[ws:terms] + lines[sa:sb]
    lines = cut
    print(f"kept lines {ws}..{sb} (terms {terms}, schedule A {sa}) → {len(lines)} lines")
outp: list[str] = [f"# {vendor} — Proposal for the same solicitation (bidder responses, from OCR)", ""]
context: str | None = None      # the last State line, offered as a label when an answer starts
in_bidder = False
kept = state = short = 0
for raw in lines:
    if not raw or CHROME.match(raw):
        continue
    n = norm(raw)
    if len(n) < 12:
        short += 1
        if in_bidder and len(n) >= 2 and not NUMBERED.match(raw):
            outp.append(raw)  # a short line inside an answer ("16", "N/A", "Yes")
        continue
    hit = process.extractOne(n, template, scorer=fuzz.partial_ratio, score_cutoff=90)
    if hit:
        state += 1
        h = HEADING.match(raw)
        if h:
            outp.append("")
            outp.append(("## " if "." not in h.group(1) else "### ") + raw)
            context = None
        else:
            context = raw
        in_bidder = False
        continue
    # the bidder's
    if not in_bidder:
        outp.append("")
        if context:
            outp.append(f"> {context[:110]}")
        in_bidder = True
    outp.append(raw)
    kept += 1

text = re.sub(r"\n{3,}", "\n\n", "\n".join(outp)).strip() + "\n"
out.write_text(text)
print(f"{out}: {len(text)} chars, ~{len(text)//4} tokens | bidder lines {kept}, state lines {state}, short {short}")
