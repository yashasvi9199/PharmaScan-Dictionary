# Contributing to PharmaScan-Dictionary

## Basics
- Edit source CSVs in `data/` (e.g. `data/salts.csv`, `data/forms.csv`).
- Every new row must include a `name` column or the first column must contain the display name.

## Local validation
1. Generate normalized outputs:

   `./scripts/run_normalization.sh`

2. Validate schema:

   `node scripts/validate_schema.js data/out/salts.normalized.json`  

3. Validate slugs:

   `node scripts/validate_slugs.js data/out/salts.normalized.json`

4. Validate checksums:

   `node scripts/verify_checksums.js`


## PR requirements
- Include the CSV change only (do not commit `data/out/`).
- Provide a summary of additions/edits and any sources used.
- For large imports, include a staging JSON under `data/` (e.g. `data/ingest_openfda.json`) and a short dedupe plan.
- CI will run normalization and validation; fix any CI errors before requesting review.

## Style rules
- Use lowercase slugs; the pipeline will generate them but keep names clean.
- Prefer canonical generic names over brand names where possible.
- Do not change slug generation logic in this repository; breaking slug changes must be a MAJOR release and require maintainer approval.

## Contact / Maintainers
See MAINTAINERS.md for the maintainer list and review policy.

## CI
See `.github/workflows/ci.yml`