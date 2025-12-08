#!/usr/bin/env sh
set -e
./scripts/run_normalization.sh
./scripts/build_bundle.js
./scripts/generate_checksums.js data/out
echo "OK"
