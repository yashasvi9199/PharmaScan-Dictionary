# PharmaScan-Dictionary

PharmaScan-Dictionary is a public, versioned collection of pharmaceutical terminology used for OCR correction, fuzzy matching, and medicine lookup. This repository serves as the canonical data source for the PharmaScan ecosystem and is designed to be consumed via CDN using versioned GitHub Releases.

## Purpose
Provide a clean, structured dataset for:
- Active pharmaceutical salts
- Dosage forms
- Strength units
- Common OCR variants and misspellings

Keeping data separate from code avoids redeploying backend/frontend for dictionary updates.

## Repository Structure
data/                   # Canonical CSV/JSON dictionary files (source of truth)
scripts/                # Ingestion, normalization, and dedupe scripts
dist/                   # Auto-generated versioned builds (created by CI on release)
.github/workflows/      # CI for validation + build

## Usage (CDN example)
Use versioned releases through jsDelivr (never pin production to main):
https://cdn.jsdelivr.net/gh/<username>/PharmaScan-Dictionary@v0.1.0/data/salts.csv

## Contribution Guidelines
- Make edits via pull requests only.
- Each entry must include a source reference.
- Do not modify files inside dist/ manually.
- Follow the schema defined for each CSV/JSON file.

## License
MIT License — free for commercial and non-commercial use with attribution.
