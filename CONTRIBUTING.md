# Contributing to PharmaScan-Dictionary

Thank you for helping improve the dictionary. This repository is used by multiple services, so consistency and data quality are critical.

## Contribution Rules

1. **All changes must go through pull requests.**
2. **Every entry must include a `source` field** pointing to where the term originated (official database, PDF, manual curation, etc.).
3. **Do not manually edit files inside `dist/`** — these are build outputs generated during releases.
4. Follow the schema used in the CSV files:
   - `id` (stable, never changes)
   - `canonical` (normalized form)
   - `aliases` (comma-separated list)
   - `source`
   - `notes`
5. Keep all terms lowercase except proper names.
6. Avoid duplicate canonical names; use `aliases` instead.
7. For OCR variants, record the variant exactly as seen and map it to a canonical term.
8. Use semantic versioning (via GitHub Releases) when updating dictionary data.

## Workflow

1. Submit PR with changes in `data/`.
2. CI will verify file existence and basic structure.
3. After approval, changes are merged into `main`.
4. A release is created to generate new versioned CDN paths under `/dist/`.

## Licensing

By contributing, you agree your additions are licensed under MIT and that any external data sources are allowed to be redistributed under this license.