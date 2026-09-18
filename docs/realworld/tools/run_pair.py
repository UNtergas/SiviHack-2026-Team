"""Run the pipeline on a real-world pair, print a digest and optionally write the full result.
usage: [LLM_RECORD_DIR=tests/fixtures/replay] uv run --env-file .env python run_pair.py <rfp.md> <proposal.md> [out.json]
With LLM_PROVIDER=replay USE_CACHE=true it fills the disk cache from the recordings at no cost."""
import asyncio, json, sys, time
from pathlib import Path
from app import pipeline, usage
rfp, prop = Path(sys.argv[1]).read_text(), Path(sys.argv[2]).read_text()
out = Path(sys.argv[3]) if len(sys.argv) > 3 else None
print(f"rfp ~{len(rfp)//4} tokens, proposal ~{len(prop)//4} tokens; spent so far ${usage.total_usd():.3f}")
t0 = time.time()
events = []
async def go():
    async for e, p in pipeline.run(rfp, prop):
        if e == "progress":
            print(f"  [{p.elapsedMs/1000:6.1f}s] {p.stage}: {p.message}", flush=True)
        else:
            print(f"  [{time.time()-t0:6.1f}s] == {e}", flush=True)
        events.append((e, p))
asyncio.run(go())
done = events[-1][1]
if out:
    out.write_text(done.model_dump_json(indent=2))
r = done
print(f"\ndone in {time.time()-t0:.0f}s, spent now ${usage.total_usd():.3f}")
print("overall", r.overall, "| partial", r.partial, "| error", r.error, "| warnings", r.warnings)
print("meta", {k: v for k, v in r.meta.model_dump().items() if k in ('llmCalls','truncated','repaired','ungroundedDropped','fuzzyMatched','durationMs')})
print("requirements", len(r.requirements), "| constraints", len(r.constraints), "| coverage", {s: sum(1 for c in r.coverage if c.status == s) for s in ('ADDRESSED','PARTIAL','MISSING','CONTRADICTED')})
print("violations", [(v.constraintId, v.severity, v.violation[:100]) for v in r.constraintViolations])
print("scores", [(s.id, s.score) for s in r.scores])
print("findings", [(f.type, f.severity, f.location, f.proposalQuote[:70]) for f in r.findings])
print("constraints", [(c.id, c.kind, c.label) for c in r.constraints])
