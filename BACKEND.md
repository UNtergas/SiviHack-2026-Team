
# Proposal Scorer — v0 Setup (FastAPI + Docker + nginx + Ollama)

Internal tool. Track 1 (FPT Proposal Scorer). Backend = FastAPI. No n8n.
Everything Docker-based so it lifts into OVH cloud unchanged.

- **Test mode:** backend talks to a local `ollama` container (small model).
- **Prod mode:** flip `LLM_PROVIDER=remote`, fill the remote LLM env, no code change.
- Frontend is your teammate's; here it's a placeholder container + an nginx route.
- Contract for frontend = one loose `schema.d.ts` (no strict enums where they'd cause friction) + a sample result JSON.

You are the checker. Each code block below is a complete file at the path in its heading.
Sections marked **FARMABLE** are self-contained enough to paste into a fresh AI session.

---

## 1. Architecture

```
browser
  │
  ▼
nginx :80
  ├── /        →  frontend container  (teammate owns; placeholder here)
  └── /api/    →  backend  :8000      (FastAPI; nginx strips the /api prefix)
                    │
                    ▼
              ollama :11434  (test)   OR   remote LLM (prod, via env)
```

Flow inside the backend (2 LLM calls + deterministic glue):

```
POST /score {rfp, proposal, weights?}
  → split markdown by ## headers            (code, section labels)
  → LLM call 1: extract RFP requirements[]  (cacheable by hash(rfp))
  → LLM call 2: coverage + 7 scores + risks (one structured JSON)
  → grounding: every quote must be verbatim substring of its source
  → aggregate: weighted overall + prioritize findings
  → ScoringResult
```

---

## 2. Directory layout

```
proposal-scorer/
├── docker-compose.yml
├── .env.example
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── config.py
│       ├── schema.py          # Pydantic v2 — source of truth
│       ├── llm.py             # provider + call_json (retry)
│       ├── splitter.py        # markdown section split (regex)
│       ├── grounding.py       # verbatim-quote substring validation
│       ├── aggregate.py       # weighted overall + prioritize
│       ├── prompts.py         # the two self-contained prompts
│       ├── pipeline.py        # orchestrator (+ optional cache)
│       └── main.py            # FastAPI app + routes
│   ├── data/                  # the 6 provided .md files
│   └── data/cache/            # created at runtime
├── frontend/
│   ├── Dockerfile             # placeholder; teammate replaces
│   └── schema.d.ts            # loose TS contract for the frontend
└── README.md                  # short run notes (optional)
```

---

## 3. `.env.example`

```dotenv
# ---- LLM provider switch ----
# ollama = local test container; remote = provided LLM in prod
LLM_PROVIDER=ollama

# ---- Ollama (test mode) ----
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:7b

# ---- Remote LLM (prod mode) — fill when the key arrives ----
# Any OpenAI-compatible endpoint (OpenRouter / Groq / Gemini OpenAI-compat).
REMOTE_BASE_URL=
REMOTE_API_KEY=
REMOTE_MODEL=

# ---- Behaviour ----
LLM_TEMPERATURE=0.1
DROP_UNGROUNDED=false      # false = keep + flag; true = drop unverified findings
USE_CACHE=true             # cache RFP extraction (+ full result) on disk
```

Copy to `.env` before running: `cp .env.example .env`.

---

## 4. `docker-compose.yml`

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_models:/root/.ollama
    # expose only inside the compose network; no host port needed for prod
    # uncomment to pull/debug from host:
    # ports: ["11434:11434"]
    healthcheck:
      test: ["CMD", "ollama", "list"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    env_file: .env
    depends_on:
      ollama:
        condition: service_started
    # no host port — nginx reaches it on the network as backend:8000
    expose:
      - "8000"
    volumes:
      - ./backend/data:/app/data     # samples + cache persist across restarts

  frontend:
    build: ./frontend
    expose:
      - "3000"                       # teammate's app must listen on 3000
    depends_on:
      - backend

  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
      - frontend

volumes:
  ollama_models:
```

---

## 5. `nginx/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    # API — strip the /api prefix so FastAPI sees /score, /health
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;          # LLM calls can be slow on local 7B
        proxy_send_timeout 300s;
    }

    # Frontend — everything else
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Frontend calls `POST /api/score` → backend receives `POST /score`.

---

## 6. Backend container

### `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `backend/requirements.txt`

```text
fastapi==0.115.*
uvicorn[standard]==0.32.*
pydantic==2.*
httpx==0.27.*
# optional fuzzy fallback for grounding (see grounding.py); safe to omit:
rapidfuzz==3.*
```

---

## 7. `backend/app/config.py`

```python
import os

def env(key: str, default: str = "") -> str:
    return os.getenv(key, default)

LLM_PROVIDER   = env("LLM_PROVIDER", "ollama")
OLLAMA_URL     = env("OLLAMA_URL", "http://ollama:11434")
OLLAMA_MODEL   = env("OLLAMA_MODEL", "qwen2.5:7b")
REMOTE_BASE_URL= env("REMOTE_BASE_URL")
REMOTE_API_KEY = env("REMOTE_API_KEY")
REMOTE_MODEL   = env("REMOTE_MODEL")
TEMPERATURE    = float(env("LLM_TEMPERATURE", "0.1"))
DROP_UNGROUNDED= env("DROP_UNGROUNDED", "false").lower() == "true"
USE_CACHE      = env("USE_CACHE", "true").lower() == "true"
```

---

## 8. `backend/app/schema.py` — source of truth (Pydantic v2)

```python
from typing import Literal, Optional, List, Dict
from pydantic import BaseModel, Field

# 7 fixed criteria (ids MUST match what the prompt emits)
CRITERIA = [
    "problem_understanding",
    "scope_clarity",
    "pricing_clarity",
    "timeline_clarity",
    "completeness",
    "tone_persuasiveness",
    "risk_transparency",
]
CriterionId = Literal[
    "problem_understanding", "scope_clarity", "pricing_clarity",
    "timeline_clarity", "completeness", "tone_persuasiveness", "risk_transparency",
]
CoverageStatus = Literal["ADDRESSED", "PARTIAL", "MISSING", "CONTRADICTED"]
Severity       = Literal["HIGH", "MEDIUM", "LOW"]
RiskType       = Literal[
    "OVERCOMMIT", "SCOPE_CREEP", "UNREALISTIC_TIMELINE", "PRICING_MISMATCH", "CONTRADICTION",
]

class Requirement(BaseModel):
    id: str
    label: str
    rfpQuote: str                       # verbatim from RFP
    section: Optional[str] = None
    grounded: bool = False              # set by validator, not the LLM

class CoverageItem(BaseModel):
    requirementId: str
    status: CoverageStatus
    proposalQuote: Optional[str] = None # verbatim, null if MISSING
    explanation: str
    fix: str
    grounded: bool = False

class CriterionScore(BaseModel):
    id: CriterionId
    label: str
    score: int = Field(ge=1, le=5)
    rationale: str
    evidenceQuote: Optional[str] = None
    source: Optional[Literal["proposal", "rfp"]] = None
    grounded: bool = False

class RiskFinding(BaseModel):
    type: RiskType
    proposalQuote: str
    rfpQuote: Optional[str] = None
    explanation: str
    severity: Severity
    grounded: bool = False

# ---- LLM call 1 output ----
class RfpExtraction(BaseModel):
    requirements: List[Requirement]

# ---- LLM call 2 output (pre-grounding/aggregation) ----
class ScoreLlmOutput(BaseModel):
    coverage: List[CoverageItem]
    scores: List[CriterionScore]
    risks: List[RiskFinding]

# ---- API request / response ----
class ScoreRequest(BaseModel):
    rfp: str
    proposal: str
    weights: Optional[Dict[str, float]] = None

class ScoringMeta(BaseModel):
    model: str
    temperature: float
    durationMs: int
    ungroundedDropped: int
    cacheHit: bool = False

class ScoringResult(BaseModel):
    overall: float
    weights: Dict[str, float]
    scores: List[CriterionScore]
    coverage: List[CoverageItem]
    risks: List[RiskFinding]
    requirements: List[Requirement]
    meta: ScoringMeta
```

---

## 9. `frontend/schema.d.ts` — loose contract for the frontend

Deliberately relaxed: string unions for the useful enums, everything else optional so the
frontend never fights the backend over a missing field.

```ts
// Loose contract. Backend may add fields; frontend should ignore unknowns.
export type CriterionId = string;      // one of the 7 ids, but kept as string on purpose
export type CoverageStatus = "ADDRESSED" | "PARTIAL" | "MISSING" | "CONTRADICTED";
export type Severity = "HIGH" | "MEDIUM" | "LOW";
export type RiskType = string;         // OVERCOMMIT | SCOPE_CREEP | ... — kept loose

export interface Requirement {
  id: string;
  label: string;
  rfpQuote: string;
  section?: string | null;
  grounded?: boolean;
}

export interface CoverageItem {
  requirementId: string;
  status: CoverageStatus;
  proposalQuote?: string | null;
  explanation: string;
  fix: string;
  grounded?: boolean;
}

export interface CriterionScore {
  id: CriterionId;
  label: string;
  score: number;                 // 1..5
  rationale: string;
  evidenceQuote?: string | null;
  source?: "proposal" | "rfp" | null;
  grounded?: boolean;
}

export interface RiskFinding {
  type: RiskType;
  proposalQuote: string;
  rfpQuote?: string | null;
  explanation: string;
  severity: Severity;
  grounded?: boolean;
}

export interface ScoringResult {
  overall: number;
  weights: Record<string, number>;
  scores: CriterionScore[];
  coverage: CoverageItem[];
  risks: RiskFinding[];
  requirements: Requirement[];
  meta?: {
    model?: string;
    temperature?: number;
    durationMs?: number;
    ungroundedDropped?: number;
    cacheHit?: boolean;
  };
}

export interface ScoreRequest {
  rfp: string;
  proposal: string;
  weights?: Record<string, number>;   // e.g. { pricing_clarity: 2 }
}
```

Hand the teammate this file **plus one real `ScoringResult` JSON** (produce it from the
regression run in §16). They can mock the UI before your API is live.

---

## 10. `backend/app/llm.py` — provider + validated JSON caller

```python
import json, re
import httpx
from pydantic import BaseModel, ValidationError
from . import config

_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)

class LlmProvider:
    name = "base"
    async def complete(self, prompt: str, temperature: float, json_mode: bool) -> str:
        raise NotImplementedError

class OllamaProvider(LlmProvider):
    name = "ollama"
    async def complete(self, prompt: str, temperature: float, json_mode: bool) -> str:
        payload = {
            "model": config.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if json_mode:
            payload["format"] = "json"   # forces valid JSON output
        async with httpx.AsyncClient(timeout=300) as c:
            r = await c.post(f"{config.OLLAMA_URL}/api/generate", json=payload)
            r.raise_for_status()
            return r.json()["response"]

class RemoteProvider(LlmProvider):
    """OpenAI-compatible chat endpoint (OpenRouter / Groq / Gemini compat)."""
    name = "remote"
    async def complete(self, prompt: str, temperature: float, json_mode: bool) -> str:
        if not config.REMOTE_BASE_URL or not config.REMOTE_API_KEY:
            raise RuntimeError("REMOTE_* env not configured")
        body = {
            "model": config.REMOTE_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}
        headers = {"Authorization": f"Bearer {config.REMOTE_API_KEY}"}
        async with httpx.AsyncClient(timeout=120) as c:
            r = await c.post(f"{config.REMOTE_BASE_URL}/chat/completions",
                             json=body, headers=headers)
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]

def get_provider() -> LlmProvider:
    return RemoteProvider() if config.LLM_PROVIDER == "remote" else OllamaProvider()

def _strip(s: str) -> str:
    return _FENCE.sub("", s).strip()

async def call_json(provider: LlmProvider, prompt: str, model_cls: type[BaseModel],
                    temperature: float = None):
    """Call the LLM, force JSON, validate against model_cls. Retry once on failure."""
    temp = config.TEMPERATURE if temperature is None else temperature
    raw = await provider.complete(prompt, temp, json_mode=True)
    try:
        return model_cls.model_validate_json(_strip(raw))
    except (ValidationError, json.JSONDecodeError, ValueError) as e:
        retry = (prompt +
                 "\n\nYour previous output was invalid. Return ONLY valid JSON "
                 f"matching the schema. Do not add prose. Errors:\n{str(e)[:800]}")
        raw2 = await provider.complete(retry, temp, json_mode=True)
        return model_cls.model_validate_json(_strip(raw2))
```

---

## 11. `backend/app/splitter.py` — markdown section split (the only regex)

```python
import re
from typing import List, Dict

_HEADER = re.compile(r"^(#{1,6})\s+(.*)$", re.MULTILINE)

def split_sections(md: str) -> List[Dict]:
    """Return [{header, level, body}] in order. Text before the first header
    becomes header='preamble', level=0."""
    matches = list(_HEADER.finditer(md))
    out: List[Dict] = []
    if not matches or matches[0].start() > 0:
        pre = md[: matches[0].start()] if matches else md
        if pre.strip():
            out.append({"header": "preamble", "level": 0, "body": pre.strip()})
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(md)
        out.append({
            "header": m.group(2).strip(),
            "level": len(m.group(1)),
            "body": md[start:end].strip(),
        })
    return out
```

---

## 12. `backend/app/grounding.py` — verbatim-quote validation (anti-hallucination core)

```python
import re
from typing import Optional
from . import config

_WS = re.compile(r"\s+")

def normalize(s: str) -> str:
    return _WS.sub(" ", s).strip().lower()

def is_grounded(quote: Optional[str], source: str) -> bool:
    """True iff quote appears verbatim (whitespace/case-insensitive) in source."""
    if not quote:
        return False
    q, src = normalize(quote), normalize(source)
    if q in src:
        return True
    # Optional fuzzy fallback (LLM lightly paraphrased a real quote).
    # Comment out if rapidfuzz not installed.
    try:
        from rapidfuzz import fuzz
        return fuzz.partial_ratio(q, src) >= 90
    except ImportError:
        return False

def ground_result(llm: "ScoreLlmOutput", requirements, rfp: str, proposal: str):
    """Set .grounded on every object; optionally drop ungrounded findings.
    Returns (llm, requirements, dropped_count)."""
    dropped = 0
    for r in requirements:
        r.grounded = is_grounded(r.rfpQuote, rfp)

    kept_cov = []
    for c in llm.coverage:
        c.grounded = c.proposalQuote is not None and is_grounded(c.proposalQuote, proposal)
        # MISSING legitimately has no quote — keep it regardless.
        if c.status == "MISSING" or c.grounded or not config.DROP_UNGROUNDED:
            kept_cov.append(c)
        else:
            dropped += 1
    llm.coverage = kept_cov

    for s in llm.scores:
        src = proposal if s.source == "proposal" else rfp if s.source == "rfp" else proposal
        s.grounded = is_grounded(s.evidenceQuote, src) if s.evidenceQuote else False

    kept_risk = []
    for k in llm.risks:
        k.grounded = is_grounded(k.proposalQuote, proposal)
        if k.grounded or not config.DROP_UNGROUNDED:
            kept_risk.append(k)
        else:
            dropped += 1
    llm.risks = kept_risk
    return llm, requirements, dropped
```

`ScoreLlmOutput` is imported in `pipeline.py`; the annotation above is illustrative.

---

## 13. `backend/app/aggregate.py` — weighted overall + prioritize

```python
from typing import List, Dict
from .schema import CRITERIA, CriterionScore

_SEV = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}

def weighted_overall(scores: List[CriterionScore], weights: Dict[str, float]) -> float:
    num = den = 0.0
    for s in scores:
        w = float(weights.get(s.id, 1.0))
        num += w * s.score
        den += w
    return round(num / den, 2) if den else 0.0

def normalize_weights(weights: Dict[str, float] | None) -> Dict[str, float]:
    weights = weights or {}
    return {c: float(weights.get(c, 1.0)) for c in CRITERIA}

def prioritize_risks(risks, weights: Dict[str, float]):
    # risks have no criterion; sort by severity only
    return sorted(risks, key=lambda k: _SEV.get(k.severity, 1), reverse=True)

def prioritize_coverage(coverage, weights: Dict[str, float]):
    order = {"CONTRADICTED": 3, "MISSING": 2, "PARTIAL": 1, "ADDRESSED": 0}
    return sorted(coverage, key=lambda c: order.get(c.status, 0), reverse=True)
```

Weights change only the overall number and display order — never re-score. Frontend
can also recompute `overall` client-side from `scores` + slider weights (same formula),
so moving a slider needs **no** API call.

---

## 14. `backend/app/prompts.py` — the two self-contained prompts

```python
import json
from typing import List
from .schema import Requirement

CRITERIA_BLOCK = """- problem_understanding: reflects the client's actual stated problem, not a generic pitch.
- scope_clarity: deliverables specific and unambiguous; clear what's in/out.
- pricing_clarity: pricing stated, broken down, concrete (vs "on request"/deferred).
- timeline_clarity: concrete milestones/dates (vs "in a timely manner").
- completeness: addresses every requirement the RFP asked for.
- tone_persuasiveness: confident, client-focused, professional, not boilerplate.
- risk_transparency: assumptions/dependencies/risks flagged, not hidden."""

def build_extract_prompt(rfp: str) -> str:
    return f"""You extract client requirements from a Request for Proposal (RFP).

Return ONLY valid JSON, no prose, matching:
{{"requirements":[{{"id":"r1","label":"short name","rfpQuote":"verbatim text from the RFP","section":"section header or null"}}]}}

Rules:
- Extract EVERY explicit requirement: the numbered/bulleted asks, AND budget, AND timeline/deadline, AND any hard constraint or exclusion (e.g. "no migration to a new database").
- rfpQuote MUST be copied word-for-word from the RFP. Never paraphrase, summarize, or fix typos.
- Do NOT invent requirements that are not stated in the text.
- ids are sequential: r1, r2, r3...
- label is your own 2-6 word name for the requirement.

RFP:
<<<
{rfp}
>>>"""

def build_score_prompt(requirements: List[Requirement], proposal: str) -> str:
    reqs_json = json.dumps([r.model_dump(include={"id", "label", "rfpQuote"})
                            for r in requirements], ensure_ascii=False, indent=1)
    return f"""You are a senior proposal reviewer. You judge a PROPOSAL against a client's REQUIREMENTS. Be specific and grounded; never say "improve clarity" without naming the exact gap.

Return ONLY valid JSON, no prose, matching this shape:
{{
 "coverage":[{{"requirementId":"r1","status":"ADDRESSED|PARTIAL|MISSING|CONTRADICTED","proposalQuote":"verbatim from proposal or null","explanation":"why this status","fix":"one concrete action"}}],
 "scores":[{{"id":"<criterion id>","label":"<criterion name>","score":1-5,"rationale":"specific reason","evidenceQuote":"verbatim from proposal or null","source":"proposal|rfp|null"}}],
 "risks":[{{"type":"OVERCOMMIT|SCOPE_CREEP|UNREALISTIC_TIMELINE|PRICING_MISMATCH|CONTRADICTION","proposalQuote":"verbatim","rfpQuote":"verbatim or null","explanation":"why risky","severity":"HIGH|MEDIUM|LOW"}}]
}}

Coverage status meaning:
- ADDRESSED: proposal clearly satisfies the requirement.
- PARTIAL: mentioned but vague or incomplete.
- MISSING: requirement not addressed anywhere.
- CONTRADICTED: proposal states something that VIOLATES the requirement. Example: requirement says "no migration to a new database", proposal says it will migrate to another platform. This is the most important status — do not mark such a case ADDRESSED just because the topic is mentioned.

The 7 criteria (score each 1-5, id must match exactly):
{CRITERIA_BLOCK}

Rules:
- Every quote (proposalQuote, evidenceQuote, rfpQuote) MUST be copied VERBATIM from the source. Never paraphrase.
- Emit exactly one score object per criterion, all 7, ids spelled exactly as above.
- If a requirement is MISSING, proposalQuote = null.
- fix must be concrete and actionable (name the section and what to add/change).
- risks: flag overpromising, scope creep beyond the ask, timelines/prices implausible for the scope, or direct contradictions of a requirement. Empty list if none.

REQUIREMENTS:
{reqs_json}

PROPOSAL:
<<<
{proposal}
>>>"""
```

---

## 15. `backend/app/pipeline.py` — orchestrator (+ optional cache)

```python
import time, hashlib, json, os
from pathlib import Path
from .schema import (RfpExtraction, ScoreLlmOutput, ScoringResult, ScoringMeta,
                     Requirement)
from . import config
from .llm import get_provider, call_json
from .prompts import build_extract_prompt, build_score_prompt
from .grounding import ground_result
from .aggregate import (weighted_overall, normalize_weights,
                        prioritize_coverage, prioritize_risks)

CACHE = Path("data/cache")

def _h(*parts: str) -> str:
    return hashlib.sha256("||".join(parts).encode()).hexdigest()[:16]

def _cache_get(key: str):
    f = CACHE / f"{key}.json"
    if config.USE_CACHE and f.exists():
        return json.loads(f.read_text())
    return None

def _cache_put(key: str, obj: dict):
    if config.USE_CACHE:
        CACHE.mkdir(parents=True, exist_ok=True)
        (CACHE / f"{key}.json").write_text(json.dumps(obj, ensure_ascii=False))

async def score_proposal(rfp: str, proposal: str, weights=None) -> ScoringResult:
    t0 = time.time()
    provider = get_provider()
    weights = normalize_weights(weights)

    # Layer A cache: RFP extraction (RFP unchanged => requirements unchanged)
    ext_key = _h("extract", rfp)
    cached = _cache_get(ext_key)
    if cached:
        requirements = [Requirement(**r) for r in cached["requirements"]]
    else:
        ext: RfpExtraction = await call_json(provider, build_extract_prompt(rfp), RfpExtraction)
        requirements = ext.requirements
        _cache_put(ext_key, {"requirements": [r.model_dump() for r in requirements]})

    # LLM call 2: score + coverage + risk
    llm: ScoreLlmOutput = await call_json(
        provider, build_score_prompt(requirements, proposal), ScoreLlmOutput)

    # Grounding
    llm, requirements, dropped = ground_result(llm, requirements, rfp, proposal)

    # Aggregate + order
    overall = weighted_overall(llm.scores, weights)
    coverage = prioritize_coverage(llm.coverage, weights)
    risks = prioritize_risks(llm.risks, weights)

    return ScoringResult(
        overall=overall, weights=weights,
        scores=llm.scores, coverage=coverage, risks=risks, requirements=requirements,
        meta=ScoringMeta(
            model=(config.REMOTE_MODEL if provider.name == "remote" else config.OLLAMA_MODEL),
            temperature=config.TEMPERATURE,
            durationMs=int((time.time() - t0) * 1000),
            ungroundedDropped=dropped,
            cacheHit=cached is not None,
        ),
    )
```

---

## 16. `backend/app/main.py` — FastAPI routes

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schema import ScoreRequest, ScoringResult
from .pipeline import score_proposal

app = FastAPI(title="Proposal Scorer v0")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/score", response_model=ScoringResult)
async def score(req: ScoreRequest):
    if not req.rfp.strip() or not req.proposal.strip():
        raise HTTPException(400, "rfp and proposal are required")
    try:
        return await score_proposal(req.rfp, req.proposal, req.weights)
    except Exception as e:
        raise HTTPException(500, f"scoring failed: {e}")
```

---

## 17. Frontend placeholder

Teammate owns the real one; this keeps compose green until they drop theirs in.
Their app must listen on **:3000** and call `POST /api/score`.

### `frontend/Dockerfile` (placeholder — replace with teammate's build)

```dockerfile
# Placeholder that serves a static page on :3000.
# Replace entirely with the teammate's frontend build.
FROM python:3.12-slim
WORKDIR /app
RUN printf '<h1>frontend placeholder</h1><p>replace this container</p>' > index.html
EXPOSE 3000
CMD ["python", "-m", "http.server", "3000"]
```

---

## 18. Ollama test mode — first-run steps

The model isn't baked into the image; pull it once into the volume:

```bash
docker compose up -d ollama
docker compose exec ollama ollama pull qwen2.5:7b     # ~4.5GB; or llama3.1:8b
docker compose exec ollama ollama list                # verify it's there
```

Then bring up the rest:

```bash
docker compose up -d --build
curl http://localhost/api/health                      # -> {"ok":true}
```

Smoke-test a score (from repo root, samples in `backend/data/`):

```bash
curl -s http://localhost/api/score \
  -H 'Content-Type: application/json' \
  -d "$(python - <<'PY'
import json,pathlib
d=pathlib.Path("backend/data")
print(json.dumps({
  "rfp": (d/"rfp_nordframe.md").read_text(),
  "proposal": (d/"response_1_weak.md").read_text()
}))
PY
)" | python -m json.tool
```

**Model caveat:** a local 7–8B model is shakier at strict JSON + verbatim quotes than the
provided LLM. Expect more retries and weaker weak/medium/strong separation. Get the
*plumbing* green on Ollama; re-tune the scoring prompt (§14, `build_score_prompt`) once
the real key lands — flip `LLM_PROVIDER=remote`, nothing else changes.

---

## 19. Regression check + demo fallback  **[FARMABLE]**

> **CONTEXT:** FastAPI backend scores a proposal against an RFP; 6 markdown files exist in
> `backend/data/`: `rfp_nordframe.md` and `response_{1_weak,2_medium,3_strong,4_overpromise}.md`,
> plus `scoring_example.md` (reference output). A function
> `score_proposal(rfp: str, proposal: str, weights=None) -> ScoringResult` exists
> (returns fields: `overall: float`, `coverage[]` with `status ∈
> ADDRESSED|PARTIAL|MISSING|CONTRADICTED`, `risks[]`, `scores[]`).
> **TASK:** Write `backend/tests/regression.py` (plain asyncio script, no framework needed)
> that runs the 4 responses against the RFP and prints a table: filename, overall,
> count of coverage statuses, count of risks. Then ASSERT:
> `weak.overall < medium.overall < strong.overall`, and `overpromise` has ≥1 `CONTRADICTED`
> coverage item AND ≥1 risk. Save each `ScoringResult` to `backend/data/cache/<name>.json`.
> **ACCEPTANCE:** assertions pass on the provided samples; 4 JSON files written; one of them
> handed to the frontend teammate as the sample `ScoringResult`.

This is also your **do-first**: get `response_1_weak` vs `rfp_nordframe` producing output
that matches the shape of `scoring_example.md` (right low scores, reqs 3/5/6/7 flagged
MISSING with real quotes). Green there ⇒ the rest is UI + running the other 3 samples.

---

## 20. Run cheatsheet

```bash
cp .env.example .env

# test mode (local ollama)
docker compose up -d ollama
docker compose exec ollama ollama pull qwen2.5:7b
docker compose up -d --build
open http://localhost                      # frontend via nginx
curl http://localhost/api/health

# switch to prod LLM: edit .env
#   LLM_PROVIDER=remote
#   REMOTE_BASE_URL=... REMOTE_API_KEY=... REMOTE_MODEL=...
docker compose up -d --build backend       # backend only, no other change
```

## 21. Deploy to OVH (later)

Same compose, one box. Point a domain at the host, put a TLS cert on nginx (add a `443`
server block + certbot, or an OVH load balancer in front). For prod, either keep the
`ollama` service (needs a GPU/large instance) or set `LLM_PROVIDER=remote` and drop the
`ollama` service from compose entirely — the backend never calls it in remote mode.

---

## Build order (10h)

1. §3–§7 scaffold + `docker compose up ollama` + pull model — **~1.5h**
2. §8 schema, §10 llm, §14 prompts — **~1.5h**
3. §12 grounding, §15 pipeline wired on `response_1_weak` (the do-first) — **~2.5h**
4. §11 splitter, §13 aggregate — **~1h**
5. §16 routes + §5 nginx + §17 frontend slot; hand `schema.d.ts` + sample JSON to teammate — **~1.5h**
6. §19 regression + cache fallback; tune `build_score_prompt` until separation holds — **~2h**

Tuning the scoring prompt (step 6) eats the buffer — that's where weak/medium/strong
separation and the overpromise→CONTRADICTED catch are won or lost. Everything else is plumbing.

---

# Appendix — Farmable Regeneration Cards

Purpose: reproduce any file in a **blank AI session** with no memory of this project, so you
(the checker) can verify each piece independently and get near-identical output.

**How to use:** paste the **SHARED CONTEXT** block below, then paste **one card** under it.
That combination is a complete, self-contained prompt. Compare the result against the
matching section (§) above.

**Convergence note:**
- **[TIGHT]** cards = deterministic code with pinned signatures/field names → expect
  near-identical output every time.
- **[LOOSE]** cards = prompts / free-form → wording will vary between sessions; the
  card pins the *rules that must hold*, and the § above is the canonical copy. Verify the
  rules survived, not the exact words.

---

## SHARED CONTEXT (paste above every card)

```
PROJECT: Internal tool, "Proposal Scorer". A FastAPI (Python 3.12) backend scores a sales
PROPOSAL against a client RFP. Both inputs are markdown strings. Output is one structured
JSON result. Pipeline = 2 LLM calls (extract RFP requirements, then score+coverage+risk)
plus deterministic code (grounding, weighted aggregation). No database. No auth.

STACK: Python 3.12, FastAPI, Pydantic v2, httpx (async), uvicorn. Package root = app/.

ENV VAR NAMES (exact): LLM_PROVIDER (ollama|remote), OLLAMA_URL, OLLAMA_MODEL,
REMOTE_BASE_URL, REMOTE_API_KEY, REMOTE_MODEL, LLM_TEMPERATURE, DROP_UNGROUNDED, USE_CACHE.

THE 7 CRITERIA (ids, exact order): problem_understanding, scope_clarity, pricing_clarity,
timeline_clarity, completeness, tone_persuasiveness, risk_transparency.

ENUMS (exact string values):
- CoverageStatus: ADDRESSED | PARTIAL | MISSING | CONTRADICTED
- Severity: HIGH | MEDIUM | LOW
- RiskType: OVERCOMMIT | SCOPE_CREEP | UNREALISTIC_TIMELINE | PRICING_MISMATCH | CONTRADICTION

SHARED DATA SHAPES (field names are the contract; camelCase kept for the frontend):
- Requirement:    id:str, label:str, rfpQuote:str, section:str|None, grounded:bool=False
- CoverageItem:   requirementId:str, status:CoverageStatus, proposalQuote:str|None,
                  explanation:str, fix:str, grounded:bool=False
- CriterionScore: id:CriterionId, label:str, score:int(1..5), rationale:str,
                  evidenceQuote:str|None, source:("proposal"|"rfp")|None, grounded:bool=False
- RiskFinding:    type:RiskType, proposalQuote:str, rfpQuote:str|None, explanation:str,
                  severity:Severity, grounded:bool=False
- RfpExtraction:  requirements: list[Requirement]        (LLM call 1 output)
- ScoreLlmOutput: coverage:list[CoverageItem], scores:list[CriterionScore],
                  risks:list[RiskFinding]                (LLM call 2 output)
- ScoringResult:  overall:float, weights:dict[str,float], scores:list[CriterionScore],
                  coverage:list[CoverageItem], risks:list[RiskFinding],
                  requirements:list[Requirement], meta:ScoringMeta
- ScoringMeta:    model:str, temperature:float, durationMs:int, ungroundedDropped:int,
                  cacheHit:bool=False

RULE THAT RUNS THROUGH EVERYTHING: every quote field (rfpQuote, proposalQuote,
evidenceQuote) must be VERBATIM text copied from its source document — never paraphrased —
because a later deterministic step verifies each quote is a real substring of the source.
```

---

### CARD §4/§7 — project scaffold  **[TIGHT]**
```
PRODUCE: docker-compose.yml, .env.example, backend/Dockerfile, backend/requirements.txt.
REQUIREMENTS:
- Services: ollama (image ollama/ollama, named volume for /root/.ollama, healthcheck
  `ollama list`), backend (build ./backend, env_file .env, expose 8000, depends_on ollama,
  mount ./backend/data:/app/data), frontend (build ./frontend, expose 3000), nginx
  (image nginx:1.27-alpine, ports 80:80, mount ./nginx/nginx.conf read-only, depends_on
  backend+frontend). Backend and frontend get no host ports — only nginx does.
- .env.example uses exactly the ENV VAR NAMES from shared context, LLM_PROVIDER=ollama,
  OLLAMA_URL=http://ollama:11434, OLLAMA_MODEL=qwen2.5:7b, LLM_TEMPERATURE=0.1,
  DROP_UNGROUNDED=false, USE_CACHE=true, remote vars empty.
- Dockerfile: python:3.12-slim, pip install requirements, copy app/, CMD uvicorn
  app.main:app on 0.0.0.0:8000.
- requirements.txt: fastapi, uvicorn[standard], pydantic v2, httpx, rapidfuzz (optional).
ACCEPTANCE: `docker compose config` validates; backend image builds.
```

### CARD §5 — nginx reverse proxy  **[TIGHT]**
```
PRODUCE: nginx/nginx.conf (a single server block, listen 80).
REQUIREMENTS:
- location /api/  → proxy_pass http://backend:8000/  (TRAILING SLASH so the /api prefix is
  stripped; backend receives /score and /health, not /api/score).
- location /      → proxy_pass http://frontend:3000.
- proxy_read_timeout and proxy_send_timeout 300s (local LLM is slow).
- forward Host and X-Real-IP headers.
ACCEPTANCE: request to /api/health reaches backend as /health.
```

### CARD §7 — config loader  **[TIGHT]**
```
PRODUCE: backend/app/config.py.
REQUIREMENTS: read every ENV VAR NAME from shared context via os.getenv with sane defaults
(LLM_PROVIDER "ollama", OLLAMA_URL "http://ollama:11434", OLLAMA_MODEL "qwen2.5:7b",
TEMPERATURE float default 0.1). DROP_UNGROUNDED and USE_CACHE are booleans parsed from the
string "true"/"false". Expose them as module-level constants.
ACCEPTANCE: importing the module reads env once; booleans are real bools.
```

### CARD §8 — Pydantic schema (source of truth)  **[TIGHT]**
```
PRODUCE: backend/app/schema.py using Pydantic v2.
REQUIREMENTS: define CRITERIA (list of the 7 ids), CriterionId as a Literal of those 7,
and Literals CoverageStatus, Severity, RiskType with the exact enum values from shared
context. Then define BaseModel classes exactly matching the SHARED DATA SHAPES:
Requirement, CoverageItem, CriterionScore (score is int with ge=1, le=5), RiskFinding,
RfpExtraction, ScoreLlmOutput, ScoreRequest (rfp:str, proposal:str,
weights:dict[str,float]|None=None), ScoringMeta, ScoringResult. Optional fields default to
None; grounded/cacheHit default False.
ACCEPTANCE: ScoreLlmOutput.model_validate_json on a well-formed sample parses; a score of 6
raises validation error.
```

### CARD §9 — frontend TypeScript contract  **[TIGHT]**
```
PRODUCE: frontend/schema.d.ts — a LOOSE contract (do not over-constrain; the frontend must
never fight the backend over shape).
REQUIREMENTS: mirror the SHARED DATA SHAPES as TS interfaces, but: CriterionId = string and
RiskType = string (NOT strict unions); keep CoverageStatus and Severity as string unions;
make every nullable/optional field optional with `?`; make the whole `meta` object optional
and all its fields optional. Also export ScoreRequest { rfp:string; proposal:string;
weights?: Record<string,number> }. Add a comment: backend may add fields, frontend ignores
unknowns.
ACCEPTANCE: a backend ScoringResult JSON type-checks against ScoringResult with no errors.
```

### CARD §10 — LLM provider + validated JSON caller  **[TIGHT]**
```
PRODUCE: backend/app/llm.py. Depends on config.py (env constants).
CONTRACT:
- class LlmProvider with `async complete(prompt:str, temperature:float, json_mode:bool)->str`
- OllamaProvider: POST {OLLAMA_URL}/api/generate, body {model, prompt, stream:False,
  options:{temperature}}, and add "format":"json" when json_mode. Return response["response"].
  httpx timeout 300.
- RemoteProvider: OpenAI-compatible POST {REMOTE_BASE_URL}/chat/completions with messages=
  [{role:user,content:prompt}], temperature, and response_format {type:"json_object"} when
  json_mode; Authorization: Bearer {REMOTE_API_KEY}; return choices[0].message.content;
  raise if REMOTE_* unset.
- get_provider() picks Remote if LLM_PROVIDER=="remote" else Ollama.
- async call_json(provider, prompt, model_cls: type[BaseModel], temperature=None):
  call complete(json_mode=True), strip ```json fences, model_cls.model_validate_json(...).
  On JSONDecodeError/ValidationError: retry ONCE, appending to the prompt an instruction to
  return only valid JSON matching the schema plus the error text. Raise if second fails.
SEARCH IF UNSURE (APIs drift — verify current docs): "Ollama /api/generate format json",
"OpenAI compatible response_format json_object", "Gemini OpenAI compatibility endpoint".
ACCEPTANCE: with json_mode a prompt returns a string parseable into the given Pydantic model
after at most one retry.
```

### CARD §11 — markdown section splitter  **[TIGHT]**
```
PRODUCE: backend/app/splitter.py.
CONTRACT: split_sections(md:str) -> list[dict] where each dict = {header:str, level:int,
body:str}, in document order. Match ATX headers (# .. ######) at line start. Body = text
from after a header up to the next header. Any text before the first header becomes
{header:"preamble", level:0, body:...} (skip if empty). Pure function, stdlib re only.
ACCEPTANCE: a doc with 4 headers yields 4 sections (plus preamble if leading text); bodies
do not overlap and preserve order.
```

### CARD §12 — grounding validator (anti-hallucination)  **[TIGHT]**
```
PRODUCE: backend/app/grounding.py. Depends on config.DROP_UNGROUNDED and the schema shapes.
CONTRACT:
- normalize(s)->str: lowercase, collapse all whitespace runs to a single space, strip.
- is_grounded(quote:str|None, source:str)->bool: False if quote falsy; else True if
  normalize(quote) is a substring of normalize(source). Optional fuzzy fallback: if
  rapidfuzz is importable, also return True when fuzz.partial_ratio(nq, nsrc) >= 90.
- ground_result(llm:ScoreLlmOutput, requirements:list[Requirement], rfp:str, proposal:str)
  -> (llm, requirements, dropped:int): set .grounded on each requirement (vs rfp), each
  coverage item (proposalQuote vs proposal), each score (evidenceQuote vs proposal if
  source=="proposal" else rfp), each risk (proposalQuote vs proposal). A MISSING coverage
  item has no quote and is ALWAYS kept. If config.DROP_UNGROUNDED is True, drop ungrounded
  coverage (non-MISSING) and ungrounded risks and count them into `dropped`; otherwise keep
  all and only set the flag.
ACCEPTANCE: exact quote -> grounded True; invented text -> False; a real quote with different
whitespace/case -> still True; MISSING items are never dropped.
```

### CARD §13 — aggregation + prioritization  **[TIGHT]**
```
PRODUCE: backend/app/aggregate.py. Depends on schema.CRITERIA and CriterionScore.
CONTRACT:
- normalize_weights(weights:dict|None)->dict[str,float]: return one entry per criterion id,
  defaulting missing ones to 1.0.
- weighted_overall(scores:list[CriterionScore], weights:dict)->float: sum(w*score)/sum(w)
  over the 7 criteria, weight defaulting to 1.0, rounded to 2 decimals; 0.0 if no scores.
- prioritize_coverage(coverage, weights): sort by status rank desc
  (CONTRADICTED=3, MISSING=2, PARTIAL=1, ADDRESSED=0).
- prioritize_risks(risks, weights): sort by severity rank desc (HIGH=3, MEDIUM=2, LOW=1).
ACCEPTANCE: equal weights -> plain mean; doubling one criterion's weight moves overall toward
that criterion's score; CONTRADICTED items sort first.
```

### CARD §14a — Prompt 1: RFP requirement extractor  **[LOOSE]**
```
PRODUCE: a function build_extract_prompt(rfp:str)->str in backend/app/prompts.py.
The prompt must instruct an LLM to output ONLY JSON:
  {"requirements":[{"id":"r1","label":"...","rfpQuote":"verbatim","section":"...|null"}]}
RULES THE PROMPT MUST ENFORCE (these are what to verify, wording may vary):
- extract EVERY explicit requirement, INCLUDING budget, timeline/deadline, and any hard
  constraint or exclusion (e.g. "no migration to a new database");
- rfpQuote copied WORD-FOR-WORD from the RFP, never paraphrased;
- do NOT invent requirements not present in the text;
- ids sequential r1,r2,...; label is a short 2-6 word name.
The RFP text is interpolated into the prompt inside clear delimiters.
ACCEPTANCE (test with a warehouse-dashboard RFP that has 7 numbered requirements + a budget
range + a pilot/rollout timeline): the model recovers all 7 + budget + timeline, and every
rfpQuote is findable verbatim in the RFP.
```

### CARD §14b — Prompt 2: score + coverage + risk  **[LOOSE — highest value, tune here]**
```
PRODUCE: build_score_prompt(requirements:list[Requirement], proposal:str)->str.
It serializes the requirements (id,label,rfpQuote) to JSON and asks the LLM to output ONLY
JSON with three arrays: coverage[], scores[], risks[] (exact field names per SHARED DATA
SHAPES).
RULES THE PROMPT MUST ENFORCE:
- coverage status definitions, especially CONTRADICTED = the proposal states something that
  VIOLATES a requirement (example: requirement "no migration to a new database", proposal
  says it will migrate) — must NOT be marked ADDRESSED just because the topic appears;
- exactly one score object per criterion, all 7, ids spelled exactly as the 7 ids;
- every quote VERBATIM from its source; MISSING coverage -> proposalQuote null;
- fix must be concrete and name the section + what to add/change (never "improve clarity");
- risks flag overpromising, scope creep beyond the ask, implausible timeline/price for the
  scope, or contradictions; empty list if none.
ACCEPTANCE (test with 4 proposals against the same RFP — weak, medium, good functional but
vague pricing/timeline/risk, and an overpromising one that mandates a DB migration the RFP
forbids): weak scores lowest, strong highest; the vague one loses on pricing_clarity /
timeline_clarity / risk_transparency; the overpromising one produces a CONTRADICTED coverage
item for the no-migration requirement AND at least one risk. Canonical wording is in §14 —
regenerate to verify the rules hold, not to replace it.
```

### CARD §15 — pipeline orchestrator (+ cache)  **[TIGHT]**
```
PRODUCE: backend/app/pipeline.py. Depends on schema, config, llm (get_provider, call_json),
prompts (build_extract_prompt, build_score_prompt), grounding (ground_result), aggregate.
CONTRACT: async score_proposal(rfp:str, proposal:str, weights=None) -> ScoringResult.
STEPS:
1. normalize weights.
2. LAYER-A CACHE: key = sha256("extract||"+rfp)[:16]; if USE_CACHE and cache file exists,
   load requirements from it; else call_json(build_extract_prompt(rfp), RfpExtraction) and
   write the cache. (RFP unchanged => requirements unchanged, so this is always safe.)
3. call_json(build_score_prompt(requirements, proposal), ScoreLlmOutput).
4. ground_result(...) -> sets grounded flags, returns dropped count.
5. overall = weighted_overall; coverage = prioritize_coverage; risks = prioritize_risks.
6. build ScoringResult with meta (model name from provider, temperature, durationMs,
   ungroundedDropped=dropped, cacheHit). Cache files live under data/cache/.
ACCEPTANCE: returns a schema-valid ScoringResult; a second identical call reports cacheHit
True and skips LLM call 1.
```

### CARD §16 — FastAPI routes  **[TIGHT]**
```
PRODUCE: backend/app/main.py. Depends on schema (ScoreRequest, ScoringResult) and pipeline.
CONTRACT: FastAPI app with CORS allow-all. GET /health -> {"ok":true}. POST /score takes
ScoreRequest, 400 if rfp or proposal blank, else await score_proposal(...), 500 with the
error message on exception, response_model=ScoringResult.
ACCEPTANCE: curl POST /score with an RFP + proposal returns a typed result; empty body -> 400.
```

### CARD §17 — frontend placeholder  **[TIGHT]**
```
PRODUCE: frontend/Dockerfile — a throwaway container that serves a static page on port 3000
(python:3.12-slim, write a tiny index.html, `python -m http.server 3000`). It exists only so
nginx has something to route "/" to until the real frontend replaces this container. The real
app must also listen on 3000 and call POST /api/score.
ACCEPTANCE: container serves a page on :3000; nginx "/" returns it.
```

### CARD §19 — regression harness + demo fallback  **[TIGHT]**
```
PRODUCE: backend/tests/regression.py (plain asyncio, no test framework). Depends on
pipeline.score_proposal and 6 markdown files in backend/data/: an RFP plus 4 proposals
(weak, medium, strong, overpromise) and a reference output file.
TASK: run each proposal against the RFP; print a table of filename, overall, counts by
coverage status, count of risks. ASSERT weak.overall < medium.overall < strong.overall, and
the overpromise proposal has >=1 CONTRADICTED coverage item and >=1 risk. Save each result to
backend/data/cache/<name>.json. Hand one saved JSON to the frontend teammate as the sample
ScoringResult.
ACCEPTANCE: assertions pass on the provided samples; 4 JSON files written.
```

---

## Verification loop (how you check a fresh session's output)

1. Paste SHARED CONTEXT + one card into a blank session.
2. Diff the returned file against the matching § in this document.
3. **[TIGHT]** cards: differences should be cosmetic (comments, import order). Any change to
   a field name, signature, env var, enum value, or the nginx `/api` prefix-strip is a real
   divergence — reject it.
4. **[LOOSE]** cards (§14a/§14b): the prose will differ; run the ACCEPTANCE test. If the 4
   samples still separate (weak<medium<strong, overpromise->CONTRADICTED+risk), the prompt is
   equivalent even if worded differently. If separation breaks, keep the §14 canonical copy.