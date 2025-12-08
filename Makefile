.PHONY: all normalize generate validate checksum

all: normalize

generate:
	node scripts/generate_all_slugs.sh

validate:
	node scripts/validate_slugs.js data/out/salts.with-slugs.json data/out/forms.with-slugs.json data/out/units.with-slugs.json data/out/ocr_variants.with-slugs.json

checksum:
	node scripts/generate_checksums.js data/out

normalize: generate validate checksum
	@echo "Normalization complete"
