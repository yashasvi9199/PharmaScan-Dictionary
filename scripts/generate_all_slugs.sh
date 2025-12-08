#!/usr/bin/env sh
node scripts/generate_slugs.js data/salts.csv data/out/salts.with-slugs.json --csv
node scripts/generate_slugs.js data/forms.csv data/out/forms.with-slugs.json --csv
node scripts/generate_slugs.js data/units.csv data/out/units.with-slugs.json --csv
node scripts/generate_slugs.js data/ocr_variants.csv data/out/ocr_variants.with-slugs.json --csv
