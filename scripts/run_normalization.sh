#!/usr/bin/env sh
set -e

echo "=== Generate slugs ==="
# Check if we have the base data for bundling; if not, run ingest pipeline
if [ ! -f "data/deduped_clean_final.json" ]; then
  echo "Base data missing. Running full ingest pipeline..."
  sh ingest/run_ingest.sh
fi

sh scripts/generate_all_slugs.sh

echo "=== Rename normalized ==="
node scripts/rename_normalized.js

echo "=== Validate slugs ==="
node scripts/validate_slugs.js \
  data/out/salts.normalized.json \
  data/out/forms.normalized.json \
  data/out/units.normalized.json \
  data/out/ocr_variants.normalized.json

echo "=== Schema validation ==="
node scripts/validate_schema.js \
  data/out/salts.normalized.json \
  data/out/forms.normalized.json \
  data/out/units.normalized.json \
  data/out/ocr_variants.normalized.json

echo "=== Build bundle ==="
node scripts/build_bundle.js

echo "=== Checksums ==="
node scripts/generate_checksums.js data/out

echo "=== Manifest ==="
node scripts/build_manifest.js

echo "=== Verify checksums ==="
node scripts/verify_checksums.js

echo "DONE"
