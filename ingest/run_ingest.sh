#!/usr/bin/env sh
set -e

echo "=== Ingest sources ==="

echo "=== OpenFDA ==="
node ingest/source_openfda.js

echo "=== WHO ATC ==="
mkdir -p data
if [ ! -f "data/atc.csv" ]; then
  echo "Downloading WHO ATC CSV..."
  curl -sS -L -o data/atc.csv "https://raw.githubusercontent.com/fabkury/atcd/master/WHO%20ATC-DDD%202024-07-31.csv"
fi
node ingest/source_who_atc.js

echo "=== Merge ingested ==="
node ingest/merge_ingested.js

echo "=== Dedupe (fast) ==="
node scripts/dedupe_fast.js

echo "=== Clean pipeline (pass1-3) ==="
node scripts/clean_pipeline.js

echo "=== Build bundle ==="
node scripts/build_bundle.js

echo "=== Version ==="
node scripts/generate_version.js

echo "=== Checksum ==="
node scripts/checksum.js

echo "OK"
