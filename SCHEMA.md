# SCHEMA.md

This document defines the canonical schema for CSV/JSON files in `/data`. Keep schemas stable; if you must change a field, bump the repo version and create a new release.

## General rules
- Files use UTF-8 (no BOM).  
- CSV delimiter: comma. Fields containing the delimiter must be quoted.  
- For `aliases`, use pipe `|` as the separator (avoids comma collisions). Example: `acetaminophen|paracetarmol`.  
- `id` values must be stable and immutable (example format: `salt_0001`).  
- Canonical values must be lowercase and normalized (ASCII where possible).  
- Provide a `source` field with a URL or a clear citation for traceability.

---

## data/salts.csv
Header:
id,canonical,aliases,source,notes

Fields:
- `id` — stable identifier, e.g., `salt_0001`
- `canonical` — normalized canonical name, e.g., `paracetamol`
- `aliases` — pipe-separated alternatives and common misspellings, e.g., `acetaminophen|paracetarmol`
- `source` — origin (URL or dataset name)
- `notes` — free text (optional)

Example row (CSV line):
salt_0001,paracetamol,acetaminophen|paracetarmol,https://en.wikipedia.org/wiki/Paracetamol,common analgesic

---

## data/forms.csv
Header:
id,canonical,aliases,source,notes

Fields:
- `id` — e.g., `form_0001`
- `canonical` — e.g., `tablet`
- `aliases` — pipe-separated shorthands, e.g., `tab|tab.`
- `source`, `notes` — same as salts

Example:
form_0001,tablet,tab|tab.,manual,"solid oral dosage form"

---

## data/units.csv
Header:
id,canonical,aliases,source,notes

Fields:
- `id` — e.g., `unit_0001`
- `canonical` — e.g., `mg`
- `aliases` — e.g., `milligram|mgs`
- `source`, `notes` — as above

Example:
unit_0001,mg,milligram|mgs,manual,"mass unit"

---

## data/ocr_variants.csv
Header:
variant,canonical,pattern,notes

Fields:
- `variant` — exact noisy OCR output, e.g., `paracetarmol`
- `canonical` — mapped canonical term, e.g., `paracetamol`
- `pattern` — optional regex or normalization rule matching multiple variants
- `notes` — context or rationale

Example:
paracetarmol,paracetamol,paracetar?mol,"common OCR r↔t substitution"

---

## JSON alternatives
If consumers prefer JSON, emit `data/*.json` files with arrays of objects matching the CSV fields. Example object for salts:
{
  "id": "salt_0001",
  "canonical": "paracetamol",
  "aliases": ["acetaminophen","paracetarmol"],
  "source": "https://en.wikipedia.org/wiki/Paracetamol",
  "notes": "common analgesic"
}

(Keep JSON field names identical to CSV headers.)

---

## Parsing and normalization recommendations
- Trim whitespace, collapse multiple spaces, normalize Unicode to NFKC, replace common homoglyphs, remove diacritics where appropriate.  
- Normalize unit symbols (e.g., "milligram" -> "mg") during ingest but keep original alias in `aliases` if present.  
- Generate and persist stable `id` values in the ingestion pipeline; do not reassign existing IDs.  
- Use the `pattern` column in `ocr_variants.csv` to capture regex-based normalizations used by your fuzzy matcher.

---

## Versioning & stability
- Never change field names in-place for released versions.  
- For breaking schema changes, create a new major release (e.g., v2.0.0) and document migration steps.  
- Consumers should pin to release URLs (jsDelivr or raw GitHub release assets) to guarantee immutability.

---

## Change log guidance
- Document schema changes in the release notes.  
- For data-only updates (no schema change), bump the patch version (vX.Y.Z).  
- For any change that renames or retypes a field, bump major and provide a compatibility layer for at least one release cycle.

--- 

## Examples of common mistakes to avoid
- Storing comma-separated aliases inside a CSV without quoting (breaks parsers).  
- Changing `id` generation rules midstream (causes duplicate/mismatched records).  
- Using the `main` branch raw URL in production (use release-tagged CDN paths instead).

---
