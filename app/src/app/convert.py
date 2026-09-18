"""PDF → Markdown for the upload path, with the same converter the real-world pairs were
prepared with (pymupdf4llm: headings from font sizes, tables as pipes), so an uploaded bid
splits into the same sections the pipeline cites.

A scanned PDF has no text layer; the browser cannot OCR it and neither can this container, so
it is refused with the page count, and the UI says what to do instead.
"""

import re
from dataclasses import dataclass

import pymupdf
import pymupdf4llm

MAX_BYTES = 40 * 1024 * 1024
_NOISE = re.compile(r"<!--.*?-->|</?mark>", re.S)


class NoTextLayer(ValueError):
    """The PDF is images only (a scan or a print-to-image export)."""


class NotAPdf(ValueError):
    pass


@dataclass(frozen=True)
class Converted:
    text: str
    pages: int
    text_pages: int  # pages that carry a text layer


def pdf_to_markdown(data: bytes) -> Converted:
    if not data.startswith(b"%PDF"):
        raise NotAPdf("not a PDF file")
    doc = pymupdf.open(stream=data, filetype="pdf")
    pages = len(doc)
    text_pages = sum(1 for page in doc if len(str(page.get_text("text")).strip()) >= 20)
    if pages and text_pages < max(
        1, pages // 5
    ):  # a scan with a text-bearing cover still counts as a scan
        raise NoTextLayer(f"{pages - text_pages} of {pages} pages have no text layer")
    md = str(pymupdf4llm.to_markdown(doc))
    md = _NOISE.sub("", md)
    md = re.sub(r"\n{3,}", "\n\n", md).strip() + "\n"
    return Converted(md, pages, text_pages)
