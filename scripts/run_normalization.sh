#!/usr/bin/env sh

set -e

echo "=== Step 1: Generate slugs ==="
node scripts/generate_all_slugs.sh

echo "=== Step 2: Validate slug outputs ==="
node scripts/validate_slugs.js \
  data/out/salts.with-slugs.json \
  data/out/forms.with-slugs.json \
  data/out/units.with-slugs.json \
  data/out/ocr_variants.with-slugs.json

echo "=== Step 3: Generate checksums ==="
node scripts/generate_checksums.js data/out

echo "=== DONE ==="
