"""FastAPI routes. nginx strips /api, so these are /health, /score, /score/stream, /rfp/extract.

POST /score          blocking: the full ScoringResult (200 even when `partial`); 400 blank
                     proposal; 502 when the LLM call failed after its retry. `customCriteria`
                     (up to five) are scored in one extra model call.
POST /score/stream   Server-Sent Events, one frame per stage (schema.StreamEvent):
                     sections → requirements → coverage → scores → findings → done, or `error`
                     (terminal). FastAPI's native SSE adds `: ping` every 15 s while a call is
                     in flight.
POST /rfp/extract    call 1 only; same cache as a full run, so a run right after costs nothing.
POST /documents/convert   a PDF (multipart `file`) → Markdown for the textarea; 415 when it is not a
                     PDF, 422 when it has no text layer (a scan), 413 above 40 MB.
"""

import logging
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from fastapi.sse import EventSourceResponse, ServerSentEvent

from app.convert import MAX_BYTES, NotAPdf, NoTextLayer, pdf_to_markdown
from app.logs import configure
from app.pipeline import extract_requirements, run, score_proposal
from app.schema import (
    ConvertedDocument,
    ErrorDetail,
    ErrorEvent,
    ExtractRequest,
    RequirementsEvent,
    ScoreRequest,
    ScoringResult,
    StreamEvent,
)

log = logging.getLogger(__name__)
configure()


def unique_id(route: APIRoute) -> str:
    """Stable operationIds (`score_score`, `score_stream`, `rfp_extract`, `meta_health`)."""
    return f"{route.tags[0]}_{route.name}" if route.tags else route.name


app = FastAPI(title="Proposal Scorer", generate_unique_id_function=unique_id)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

BLANK_PROPOSAL = {
    "model": ErrorDetail,
    "description": "The proposal is blank (the RFP is optional).",
}
BLANK_RFP = {"model": ErrorDetail, "description": "The RFP is blank."}
UPSTREAM = {"model": ErrorDetail, "description": "The LLM call failed after its retry."}


def valid_score_request(req: ScoreRequest) -> ScoreRequest:
    """A dependency, so the stream route answers a plain-JSON 400 before any byte streams."""
    if not req.proposal.strip():
        raise HTTPException(400, "proposal is required (rfp is optional)")
    return req


@app.get("/health", tags=["meta"])
async def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/score", tags=["score"], responses={400: BLANK_PROPOSAL, 502: UPSTREAM})
async def score(req: Annotated[ScoreRequest, Depends(valid_score_request)]) -> ScoringResult:
    try:
        return await score_proposal(req.rfp, req.proposal, req.weights, custom=req.customCriteria)
    except Exception as e:
        log.exception("scoring failed")
        raise HTTPException(502, f"scoring failed: {type(e).__name__}: {e}") from e


@app.post(
    "/score/stream",
    tags=["score"],
    response_class=EventSourceResponse,
    responses={
        # `model` here puts StreamEvent into components and into the text/event-stream schema.
        200: {
            "model": StreamEvent,
            "description": "One frame per pipeline stage; `done` and `error` are terminal.",
        },
        # The 400 body is plain JSON, not a frame, so its media type is spelled out.
        400: {
            "description": BLANK_PROPOSAL["description"],
            "content": {
                "application/json": {"schema": {"$ref": "#/components/schemas/ErrorDetail"}}
            },
        },
    },
)
async def stream(
    req: Annotated[ScoreRequest, Depends(valid_score_request)],
) -> AsyncIterator[ServerSentEvent]:
    """FastAPI frames each ServerSentEvent, sets Cache-Control / X-Accel-Buffering and pings
    while the generator is silent. A failure mid-stream is an `error` frame, never a dropped
    socket."""
    stage = "sections"
    try:
        async for event, payload in run(
            req.rfp, req.proposal, req.weights, custom=req.customCriteria
        ):
            stage = event
            yield ServerSentEvent(event=event, data=payload)
    except Exception as e:
        log.exception("pipeline failed during stream")
        yield ServerSentEvent(
            event="error", data=ErrorEvent(stage=stage, error=f"{type(e).__name__}: {e}")
        )


@app.post("/rfp/extract", tags=["rfp"], responses={400: BLANK_RFP, 502: UPSTREAM})
async def extract(req: ExtractRequest) -> RequirementsEvent:
    if not req.rfp.strip():
        raise HTTPException(400, "rfp is required")
    try:
        return await extract_requirements(req.rfp)
    except Exception as e:
        log.exception("extraction failed")
        raise HTTPException(502, f"extraction failed: {type(e).__name__}: {e}") from e


NOT_A_PDF = {"model": ErrorDetail, "description": "The upload is not a PDF."}
NO_TEXT_LAYER = {"model": ErrorDetail, "description": "The PDF is a scan: no text layer to read."}
TOO_LARGE = {"model": ErrorDetail, "description": "The upload is over 40 MB."}


@app.post(
    "/documents/convert",
    tags=["documents"],
    responses={413: TOO_LARGE, 415: NOT_A_PDF, 422: NO_TEXT_LAYER},
)
async def convert(file: UploadFile) -> ConvertedDocument:
    """A PDF as Markdown: headings become sections the review can cite, tables keep their rows."""
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "the file is over 40 MB")
    try:
        out = pdf_to_markdown(data)
    except NotAPdf:
        raise HTTPException(
            415, "only PDF files can be converted; paste or upload the text instead"
        ) from None
    except NoTextLayer as e:
        raise HTTPException(
            422,
            f"this PDF has no text layer ({e}): it is a scan. Export it from the source "
            "application, or paste the text.",
        ) from None
    log.info(
        "convert: %s → %d chars from %d pages (%d with text)",
        file.filename,
        len(out.text),
        out.pages,
        out.text_pages,
    )
    return ConvertedDocument(
        name=file.filename or "document.pdf",
        text=out.text,
        pages=out.pages,
        textPages=out.text_pages,
    )
