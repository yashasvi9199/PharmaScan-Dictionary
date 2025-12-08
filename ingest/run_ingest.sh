#!/usr/bin/env sh
set -e
node ingest/source_openfda.js
node ingest/source_who_atc.js
node ingest/merge_ingested.js
echo "OK"
