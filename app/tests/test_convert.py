"""PDF upload: a text PDF becomes Markdown with its headings; a scan is refused with a reason;
anything else is refused as not a PDF."""

import pymupdf
from fastapi.testclient import TestClient

from app.convert import NoTextLayer, pdf_to_markdown
from app.main import app


def _pdf(pages: list[str]) -> bytes:
    doc = pymupdf.open()
    for text in pages:
        page = doc.new_page()
        y = 72
        for line in text.split("\n"):
            size = 18 if line.startswith("# ") else 11
            page.insert_text((72, y), line.removeprefix("# "), fontsize=size, fontname="helv")
            y += size + 8
    return doc.tobytes()


def _blank_pdf(n: int) -> bytes:
    doc = pymupdf.open()
    for _ in range(n):
        doc.new_page()
    return doc.tobytes()


def test_text_pdf_becomes_markdown_with_headings():
    data = _pdf(
        ["# Request for Proposal\nThe client needs a dashboard.", "# Budget\n€80,000 total."]
    )
    out = pdf_to_markdown(data)
    assert out.pages == 2 and out.text_pages == 2
    assert "Request for Proposal" in out.text and "80,000 total" in out.text
    assert out.text.count("#") >= 1  # the larger lines came back as headings


def test_scan_is_refused_with_the_page_count():
    try:
        pdf_to_markdown(_blank_pdf(3))
    except NoTextLayer as e:
        assert "3 of 3 pages" in str(e)
    else:
        raise AssertionError("a PDF without a text layer must be refused")


def test_endpoint_status_codes():
    client = TestClient(app)
    ok = client.post(
        "/documents/convert",
        files={
            "file": (
                "rfp.pdf",
                _pdf(["# Scope\nOne dashboard, delivered in six months."]),
                "application/pdf",
            )
        },
    )
    assert ok.status_code == 200
    body = ok.json()
    assert body["name"] == "rfp.pdf" and body["pages"] == 1 and "One dashboard" in body["text"]
    scan = client.post(
        "/documents/convert", files={"file": ("scan.pdf", _blank_pdf(2), "application/pdf")}
    )
    assert scan.status_code == 422 and "no text layer" in scan.json()["detail"]
    other = client.post(
        "/documents/convert",
        files={"file": ("notes.docx", b"PK\x03\x04 not a pdf", "application/octet-stream")},
    )
    assert other.status_code == 415
