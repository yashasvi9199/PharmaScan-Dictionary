# Data Schema (canonical)

Each normalized record must include:
- `name` (string, non-empty)
- `slug` (string, non-empty, deterministic)

Allowed extra fields:
- `strength`, `unit`, `manufacturer`, `notes`, `source`, `id`

Canonical files:
- `data/out/salts.normalized.json` — array of records
- `data/out/forms.normalized.json`
- `data/out/units.normalized.json`
- `data/out/ocr_variants.normalized.json`
- `data/out/dictionary.bundle.json` — object with above arrays

Validation:
- `scripts/validate_schema.js <file>` — validates required fields.
- CI enforces schema on normalized outputs.

Checksums:
- `data/out/*.normalized.json.sha256`
- `data/out/dictionary.bundle.json.sha256`

Manifest:
- `data/out/manifest.json`

See `.github/workflows/ci.yml`
