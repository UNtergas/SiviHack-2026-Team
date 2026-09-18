"""PDF → Markdown with pymupdf4llm (headings, tables, highlights kept as <mark>).
usage: uv run --with pymupdf4llm python pdf_to_md.py <in.pdf> <out.md>"""
import sys
import pymupdf4llm
md = pymupdf4llm.to_markdown(sys.argv[1])
open(sys.argv[2], "w").write(md)
print(f"{sys.argv[2]}: {len(md)} chars, ~{len(md) // 4} tokens")
