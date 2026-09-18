#!/usr/bin/env bash
# Run every real-world bid through the reviewer, recording the model's answers. Sequential, so
# one key never trips the per-minute limit. usage: from app/: ../docs/realworld/tools/run_all.sh
set -u
cd "$(dirname "$0")/../../../app" || exit 1
run() {  # pair vendor
  echo "=============== $1 / $2"
  LLM_RECORD_DIR=tests/fixtures/replay uv run --env-file .env python ../docs/realworld/tools/run_pair.py \
    "../docs/realworld/$1/rfp.md" "../docs/realworld/$1/$2.md" "../docs/realworld/$1/results/$2.json" 2>&1 | grep -v 'automatic function calling'
}
run pair3-youth-portal earnstride
run pair3-youth-portal kla
run pair3-youth-portal concourse
run pair7-minivan bsi
run pair1-salesforce aimpoint
run pair1-salesforce intellibee
run pair1-salesforce radcube
run pair1-salesforce highcloud
echo "=============== all done"
