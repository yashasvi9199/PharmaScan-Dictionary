#!/usr/bin/env sh
set -e

echo "=== Ingest sources ==="
node ingest/source_openfda.js
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
