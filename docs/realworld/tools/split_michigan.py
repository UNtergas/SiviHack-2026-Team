"""Split a Michigan DTMB proposal (pymupdf4llm markdown) into the State's template (rfp.md) and the
bidder's own words (proposal.md). Everything the State wrote is template; everything after a
"Bidder Response" marker, after "List all exception(s)", inside a checkbox table's marked column, or
highlighted (<mark>) in a filled field is the bidder's."""
import re, sys
from pathlib import Path

src, out_dir, vendor = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
vendor_tokens = sys.argv[4].split(",") if len(sys.argv) > 4 else []
md = src.read_text()

# ---- the part of the file that is the questionnaire the State scores -------------------------
start = md.find("# **VENDOR QUESTIONS WORKSHEET**")
sa = md.find("# **SCHEDULE A – STATEMENT OF WORK**")
end = md.find("# **SCHEDULE B – PRICING")
assert 0 <= start < sa < end, (start, sa, end)
# skip the contract boilerplate between the worksheet and Schedule A
worksheet_end = md.find("# **ATTACHMENT 1, RESUME TEMPLATES**", start)
text = md[start:worksheet_end] + "\n\n" + md[sa:end]

# ---- normalise --------------------------------------------------------------------------------
text = re.sub(r"^Page \| \d+\s*$", "", text, flags=re.M)
text = re.sub(r"^Michigan\.gov/MiProcurement RFP \d+\s*$", "", text, flags=re.M)
text = text.replace("<!-- End of picture text -->", "")
text = re.sub(r"<sup>|</sup>", "", text)

text = re.sub(r"[ \t]+(?=- \*\*(?:<mark>)?\d+(?:\.\d+)+\b)", "\n", text)
text = re.sub(r"(?<=[.:;)])\s+(?=\*\*\d+(?:\.\d+)+\*\*)", "\n", text)

RESP = re.compile(r"\**\s*BIDDER RESPONSE\s*\**\s*:?\s*\**\s*:?", re.I)
HEAD = re.compile(r"^#{1,6} \*\*(.*?)\*\*\s*(.*)$")
REQ = re.compile(r"^(?:- )?\*\*(\d+(?:\.\d+)+)\*\*\s*(.*)$")            # **8.3.1** text
QUESTION = re.compile(r"^\*\*(\d+)\.\*\*\s*(.*)$")               # **2.** Bidder must ...
BOX = re.compile(r"^- (X|☐)\s*I have reviewed the above requirements and (.*)$")
OPTIONS = ["Currently Capability", "Requires Configuration", "Requires Customization", "Future Enhancement", "Not Available"]

def clean(s: str) -> str:
    s = re.sub(r"</?mark>", "", s)
    s = s.replace("<br>", " ")
    return re.sub(r"[ \t]+", " ", s).strip()

def table_answer(row: str) -> tuple[str, str] | None:
    """A checkbox row: which option the bidder marked."""
    cells = [c for c in row.strip().strip("|").split("|")]
    m = re.match(r"\s*\*\*(\d+(?:\.\d+)+)\*\*", cells[0]) if cells else None
    if not m:
        return None
    rid = m.group(1)
    flat = " ".join(clean(c) for c in cells[1:])
    # the X sits just before the label it marks (or alone in the cell before the label)
    marked = re.findall(r"(?:`X`|(?<![A-Za-z])X(?![A-Za-z]))[*`\s☐]*([A-Za-z ]{3,30})", flat)
    label = None
    for cand in marked:
        c = re.sub(r"[^a-z]", "", cand.lower())
        for opt in OPTIONS:
            o = re.sub(r"[^a-z]", "", opt.lower())
            if c.startswith(o) or (len(c) >= 10 and o.startswith(c)):
                label = opt
                break
        if label:
            break
    return rid, label or ("(no box marked)" if "X" not in flat else "(marked: " + flat[:60] + ")")

rfp: list[str] = []
prop: list[str] = []
mode = "state"          # state | bidder | exception
section = ""
pending_boxes: list[tuple[str, str]] = []

def flush_boxes():
    global pending_boxes
    if pending_boxes:
        prop.append("")
        for rid, ans in pending_boxes:
            prop.append(f"- {rid}: {ans}")
        rfp.append("")
        rfp.append("(For each requirement above the bidder marks one of: Currently Capability / Requires Configuration / Requires Customization / Future Enhancement / Not Available.)")
        pending_boxes = []

lines = text.split("\n")
worksheet_lines = md[start:worksheet_end].count("\n")
i = 0
last_cell_dest = None
seen_reqs: set[str] = set()
FIRST_PERSON = re.compile(r"\b(we|our|us|ours)\b", re.I)
VENDOR = re.compile("|".join(re.escape(v) for v in vendor_tokens), re.I) if vendor_tokens else None
while i < len(lines):
    raw = lines[i]
    line = raw.rstrip()
    highlighted = "<mark>" in line
    line = re.sub(r"</?mark>", "", line)
    i += 1
    worksheet_rows = i <= worksheet_lines
    if not line.strip():
        (prop if mode != "state" else rfp).append("")
        continue
    # page chrome inside a response
    if line.startswith("Michigan.gov/MiProcurement"):
        line = re.sub(r"^Michigan\.gov/MiProcurement(?:<br>|\s)+RFP \d+(?:<br>|\s)*", "", line).strip()
        if not line:
            continue
    # checkbox table rows
    if line.startswith("|**") and re.match(r"\|\*\*\d+(?:\.\d+)+\*\*\|", line) and re.search(r"Capabilit|Configuratio|Customizatio|Not.{0,12}Available", line):
        ans = table_answer(line)
        if ans:
            pending_boxes.append(ans)
        mode = "state"
        continue
    if line.startswith("|") :   # other table rows: header rows of checkbox tables, or state tables
        if "Bidder must che" in line or "|---" in line or "**No.**" in line:
            continue
        # a table row that carries a BIDDER RESPONSE inside a cell
        if RESP.search(line):
            cells = [clean(c) for c in line.strip("|").split("|")]
            joined = clean(" ".join(cells))
            parts = RESP.split(joined)
            lead = parts[0].strip()
            hm = re.match(r"^(\d+\.\d+)\s+([A-Z][^.]{2,60}?)\s+(?=\d+\.\s)", lead)
            if hm:  # "36.2 Current Customers 1. Bidder must ..." opens a sub-section in both
                section = f"{hm.group(1)} {hm.group(2)}"
                rfp.append(""); rfp.append(f"### {section}"); prop.append(""); prop.append(f"### {section}")
                lead = lead[hm.end():]
            question = lead
            for seg in parts[1:]:
                pieces = re.split(r"\s(?=\d{1,2}\.\s+Bidder\b)", seg.strip(), maxsplit=1)
                answer, next_q = pieces[0], (pieces[1] if len(pieces) > 1 else "")
                rfp.append(question.strip())
                prop.append(f"**{section}** {question.strip()[:80]} — Bidder Response: {answer.strip()}")
                question = next_q
            if question.strip():
                rfp.append(question.strip())
            continue
        inner = line.strip()
        inner = inner[1:] if inner.startswith("|") else inner
        inner = inner[:-1] if inner.endswith("|") else inner
        raw_cells = [clean(c) for c in inner.split("|")]
        cells = [c for c in raw_cells if c]
        if raw_cells and not raw_cells[0] and len(cells) == 1 and last_cell_dest:
            (prop if last_cell_dest == "prop" else rfp).append(cells[0])
            continue
        if worksheet_rows and i < len(lines) and lines[i].startswith("|---"):
            spill = RESP.split(clean(raw_cells[-1]), 1)[-1].strip(" :*") if RESP.search(raw_cells[-1]) else ""
            if spill:
                prop.append(spill)
                last_cell_dest = "prop"
            continue
        rq = re.match(r"^\*\*(\d+(?:\.\d+)+)\*\*\s*(.+)$", raw_cells[0]) if raw_cells else None
        if rq and len(cells) >= 2:
            flush_boxes()
            rfp.append(f"- **{rq.group(1)}** {rq.group(2).strip()}")
            rest = " ".join(cells[1:])
            ans = table_answer("|**" + rq.group(1) + "**|" + "|".join(cells[1:]) + "|") if re.search(r"Capabilit|Configuratio|Customizatio|Available", rest) else None
            comment = [c for c in cells[1:] if len(c) > 60 and not re.search(r"Capabilit|Configuratio|Customizatio", c)]
            if ans and ans[1] and not ans[1].startswith("("):
                prop.append(f"- {rq.group(1)}: {ans[1]}")
            for c in comment:
                prop.append(f"**{section}** {rq.group(1)} — Bidder Response: {c}")
            last_cell_dest = "prop" if comment else "rfp"
            continue
        if not worksheet_rows and len(cells) >= 2 and len(cells[-1]) > 60 and len(cells[0]) < 60:
            rfp.append(cells[0] + ("" if len(cells) == 2 else " | " + " | ".join(cells[1:-1])))
            prop.append(f"**{section}** {cells[0]} — Bidder Response: {cells[-1]}")
            last_cell_dest = "prop"
            continue
        if worksheet_rows and len(cells) >= 2:
            question, answer = cells[-2], cells[-1]
            rfp.append(question)
            prop.append(f"**Vendor Questions Worksheet** {question[:90]} — Bidder Response: {answer}")
            last_cell_dest = "prop"
            continue
        last_cell_dest = "rfp"
        (prop if mode != "state" else rfp).append(clean(line))
        continue
    h = HEAD.match(line)
    if h:
        flush_boxes()
        title = clean(h.group(1)); rest = clean(h.group(2))
        if RESP.match(title) or RESP.match(clean(line)):
            mode = "bidder"
            if not next((x for x in reversed(prop) if x.strip()), "").endswith("— Bidder Response:"):
                prop.append("")
                prop.append(f"**{section}** — Bidder Response:")
            tail = RESP.split(clean(line), 1)[-1].strip(" *:")
            if tail:
                prop.append(tail)
            continue
        if title.lower().startswith("list all exception"):
            mode = "exception"
            rfp.append("List all exception(s).")
            continue
        state_heading = re.match(r"^\d+\.\d+(?:\.\d+)*\b", title) or re.match(r"^\d+\.\s+[A-Z][A-Z0-9 ,&/()'\-]+$", title)
        if not state_heading:
            (prop if mode != "state" else rfp).append(f"**{title}** {rest}".strip())
            continue
        mode = "state"
        section = title
        level = "##" if re.match(r"^\d+\.\s", title) else "###"
        rfp.append("")
        rfp.append(f"{level} {title}" + (f" {rest}" if rest else ""))
        prop.append("")
        prop.append(f"{level} {title}")
        continue
    if mode == "exception" and re.match(r"^\*\*\d+(?:\.\d+)+\s*-\*\*", line):
        prop.append(clean(line))
        continue
    titled = re.match(r"^(?:- )?\*\*(\d+\.\d+(?:\.\d+)*)\s+([A-Z][^*]{2,80}?)\*\*\s*(.*)$", line)
    if titled:
        flush_boxes()
        mode = "state"
        section = f"{titled.group(1)} {titled.group(2).strip().rstrip('.')}"
        rfp.append(f"- **{titled.group(1)} {titled.group(2).strip()}** {clean(titled.group(3))}")
        continue
    r = REQ.match(line)
    if r and r.group(1) in seen_reqs:
        prop.append(f"**{r.group(1)}** {clean(r.group(2))}")
        continue
    if r:
        flush_boxes()
        seen_reqs.add(r.group(1))
        mode = "state"
        rfp.append(f"- **{r.group(1)}** {clean(r.group(2))}")
        continue
    q = QUESTION.match(line)
    if q and mode != "bidder" or (q and "Bidder must" in line):
        flush_boxes()
        mode = "bidder"
        rfp.append(f"{q.group(1)}. {clean(q.group(2))}")
        prop.append("")
        prop.append(f"**{section}** {q.group(1)}. {clean(q.group(2))[:80]} — Bidder Response:")
        continue
    if "I have reviewed the above requirements" in line and not BOX.match(line):
        flush_boxes()
        agree = re.search(r"(`X`|(?<![A-Za-z])X(?![A-Za-z]))\s*I have reviewed the above requirements and agree", line)
        noted = re.search(r"(`X`|(?<![A-Za-z])X(?![A-Za-z]))\s*I have reviewed the above requirements and have noted", line)
        if agree:
            prop.append(f"**{section}** — Bidder agrees with no exception.")
        if noted:
            prop.append(f"**{section}** — Bidder notes exceptions.")
        mode = "state"
        continue
    b = BOX.match(line)
    if b:
        flush_boxes()
        checked = b.group(1) == "X"
        what = "agrees with no exception" if "no exception" in b.group(2) else "notes exceptions"
        if checked:
            prop.append(f"**{section}** — Bidder {what}.")
        mode = "state"
        continue
    if line.startswith("**List all exception"):
        mode = "exception"
        rfp.append("List all exception(s).")
        continue
    if len(RESP.findall(line)) >= 2:
        flush_boxes()
        joined = clean(line)
        parts = RESP.split(joined)
        lead = parts[0].strip()
        hm = re.match(r"^(\d+\.\d+)\s+([A-Z][^.]{2,60}?)\s+(?=\d+\.\s)", lead)
        if hm:
            section = f"{hm.group(1)} {hm.group(2)}"
            rfp.append(""); rfp.append(f"### {section}"); prop.append(""); prop.append(f"### {section}")
            lead = lead[hm.end():]
        question = lead
        for seg in parts[1:]:
            seg = seg.strip()
            sub = re.search(r"\s(\d+\.\d+)\s+([A-Z][A-Za-z /&-]{2,50}?)\s+(?=\d{1,2}\.\s+Bidder\b)", seg)
            new_section = None
            if sub:
                new_section = f"{sub.group(1)} {sub.group(2).strip()}"
                seg, tail = seg[:sub.start()].strip(), seg[sub.end():]
            else:
                tail = ""
            pieces = re.split(r"\s(?=\d{1,2}\.\s+Bidder\b)", seg, maxsplit=1)
            answer, next_q = pieces[0], (pieces[1] if len(pieces) > 1 else "")
            rfp.append(question.strip())
            prop.append(f"**{section}** {question.strip()[:80]} — Bidder Response: {answer.strip()}")
            question = next_q
            if new_section:
                if question.strip():
                    rfp.append(question.strip())
                section = new_section
                rfp.append(""); rfp.append(f"### {section}"); prop.append(""); prop.append(f"### {section}")
                question = tail
        if question.strip():
            rfp.append(question.strip())
        mode = "state"
        continue
    if RESP.search(line):
        flush_boxes()
        before, after = RESP.split(line, 1)[0], RESP.split(line, 1)[-1]
        if clean(before).strip("* "):
            (prop if mode != "state" else rfp).append(clean(before))
        mode = "bidder"
        if not next((x for x in reversed(prop) if x.strip()), "").endswith("— Bidder Response:"):
            prop.append("")
            prop.append(f"**{section}** — Bidder Response:")
        if clean(after).strip("* :"):
            prop.append(clean(after).strip("* :"))
        continue
    # filled fields are highlighted in the PDF
    if highlighted and mode == "state" and section.startswith("30"):
        prop.append(clean(line))
        rfp.append(re.sub(r"(?<=: )[^*]+(?=\*\*|$)", "____ ", line).strip())
        continue
    if mode == "state" and len(line) >= 100 and (FIRST_PERSON.search(line) or (VENDOR and VENDOR.search(line))):
        prop.append(f"**{section}** — {clean(line)}")
        continue
    (prop if mode != "state" else rfp).append(clean(line))

flush_boxes()

def tidy(parts: list[str]) -> str:
    s = "\n".join(parts)
    return re.sub(r"\n{3,}", "\n\n", s).strip() + "\n"

out_dir.mkdir(parents=True, exist_ok=True)
rfp_text = "# RFP 250000000859 — Laboratory Information Management System, Maintenance and Support (State of Michigan, MDHHS)\n\n" + tidy(rfp)
prop_text = f"# {vendor} — Proposal for RFP 250000000859 (bidder responses)\n\n" + tidy(prop)
(out_dir / "rfp.md").write_text(rfp_text)
(out_dir / f"{vendor.lower().split()[0]}.md").write_text(prop_text)
for name, t in (("rfp", rfp_text), ("proposal", prop_text)):
    print(f"{name}: {len(t)} chars, ~{len(t)//4} tokens, {t.count(chr(10))} lines")
