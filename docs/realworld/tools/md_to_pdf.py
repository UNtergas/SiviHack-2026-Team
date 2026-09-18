"""Markdown → a real text PDF (headings in larger type, lists, bold), so the upload path can be
demonstrated on the sponsor's samples and the converter restores the same sections.
usage: uv run --project app --with markdown python md_to_pdf.py <in.md> <out.pdf> [title]"""
import re
import sys

import markdown
import pymupdf

src, out = sys.argv[1], sys.argv[2]
text = open(src, encoding="utf-8").read()
text = re.sub(r"^\s*\*\*Variant:.*$", "", text, flags=re.M)  # the fixture banner is not part of a document
html = markdown.markdown(text, extensions=["tables", "sane_lists"])
css = """
body { font-family: sans-serif; font-size: 10.5pt; line-height: 1.45; color: #141210; }
h1 { font-size: 22pt; margin: 0 0 10pt 0; }
h2 { font-size: 16pt; margin: 16pt 0 6pt 0; }
h3 { font-size: 13pt; margin: 12pt 0 4pt 0; }
p { margin: 0 0 7pt 0; }
li { margin: 0 0 3pt 0; }
table { border-collapse: collapse; margin: 6pt 0; }
td, th { border: 0.5pt solid #999; padding: 3pt 6pt; font-size: 9.5pt; }
code { font-family: monospace; font-size: 9.5pt; }
"""
story = pymupdf.Story(html=html, user_css=css)
writer = pymupdf.DocumentWriter(out)
mediabox = pymupdf.paper_rect("a4")
where = mediabox + (48, 48, -48, -56)
more = True
pages = 0
while more:
    dev = writer.begin_page(mediabox)
    more, _ = story.place(where)
    story.draw(dev)
    writer.end_page()
    pages += 1
writer.close()
print(f"{out}: {pages} pages from {len(text)} chars")
