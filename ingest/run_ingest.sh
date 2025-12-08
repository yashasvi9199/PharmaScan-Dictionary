#!/usr/bin/env sh
set -e
echo " === Ingest sources ==="

echo "  - openfda"
node ingest/source_openfda.js

echo "  - who_atc"
node ingest/source_who_atc.js

echo " === Merge ingested ==="
node ingest/merge_ingested.js

echo "OK"
