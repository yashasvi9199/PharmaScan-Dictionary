# Versioning Policy (Semver: vX.Y.Z)

PharmaScan-Dictionary uses semantic versioning for all published releases.  
Each version is immutable and must not be modified after publication.

## Semver Structure

X (major)
- Increment when breaking changes occur.
- Examples:
  - Changing CSV column names.
  - Removing or renaming fields.
  - Changing file structure or folder layout.
  - Modifying data formats in a way that breaks consumers.

Y (minor)
- Increment when new data or new files are added without breaking existing consumers.
- Examples:
  - Adding new salts, forms, units, or OCR variants.
  - Adding new optional columns that do not break current readers.
  - Adding new dictionary files (non-breaking additions).

Z (patch)
- Increment for small, safe fixes.
- Examples:
  - Fixing typos or misspellings.
  - Updating aliases or notes.
  - Correcting small OCR patterns.
  - Fixing incorrect sources.

## Rules
- Never modify an existing published tag.
- Always publish a new version for any change.
- Clients must pin to a specific release tag (vX.Y.Z).
- Breaking schema changes require incrementing X.
- Expanding data requires incrementing Y.
- Small corrections require incrementing Z.

## Initial Version
Start with v0.1.0.  
This indicates the dataset exists but may be incomplete or evolve.

## Examples
- Fix 5 alias mistakes → v0.1.1  
- Add 300 new salts → v0.2.0  
- Rename a CSV column (schema change) → v1.0.0  
