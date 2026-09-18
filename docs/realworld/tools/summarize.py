"""One table over every recorded result: python summarize.py [docs/realworld]"""
import glob
import json
import os
import sys

root = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..")
rows = []
for f in sorted(glob.glob(os.path.join(root, "pair*", "results", "*.json"))):
    r = json.load(open(f))
    pair = os.path.basename(os.path.dirname(os.path.dirname(f)))
    cov = {s: sum(1 for c in r["coverage"] if c["status"] == s) for s in ("ADDRESSED", "PARTIAL", "MISSING", "CONTRADICTED")}
    sc = {s["id"]: s["score"] for s in r["scores"]}
    rows.append((pair, os.path.basename(f)[:-5], r["overall"], len(r["constraintViolations"]), len(r["requirements"]), cov, sc, len(r["findings"]), r["meta"]["durationMs"] // 1000))
print(f"{'pair':20s} {'bid':11s} {'overall':>7s} {'viol':>4s} {'reqs':>4s} {'addr/part/miss/contr':>20s}  {'PU SC PR TL CO TO RT':20s} {'find':>4s} {'s':>4s}")
for pair, bid, ov, nv, nr, cov, sc, nf, secs in rows:
    scores = " ".join(f"{sc.get(k) if sc.get(k) is not None else '-':>2}" for k in ("problem_understanding", "scope_clarity", "pricing_clarity", "timeline_clarity", "completeness", "tone_persuasiveness", "risk_transparency"))
    print(f"{pair:20s} {bid:11s} {ov if ov is not None else '-':>7} {nv:4d} {nr:4d} {cov['ADDRESSED']:>5}/{cov['PARTIAL']}/{cov['MISSING']}/{cov['CONTRADICTED']:<6}  {scores:20s} {nf:4d} {secs:4d}")
