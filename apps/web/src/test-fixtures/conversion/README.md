# Conversion test fixtures

This directory contains only project-generated, non-sensitive files used to verify local conversion behavior. The files do not contain customer documents, machine identifiers, activation material, private keys, user paths, or downloaded third-party samples.

Generate the fixtures on Windows with the pinned project toolchain:

```powershell
npm run verify:toolchain
node apps/web/scripts/generate-conversion-fixtures.mjs
```

The generator uses:

- the bundled FFmpeg recorded in `apps/desktop/src-tauri/resources/ffmpeg/` for images and short media;
- `pdf-lib` for PDF fixtures;
- `docx` for DOCX fixtures;
- `exceljs` for XLSX fixtures.

Generated fixture content is owned by this project. SHA256 values are recorded in `verification/reliability-2026/sample-matrix.json`. Large-input tests expand the small oversized seed files inside a temporary test directory instead of committing large binaries.

The intentionally damaged and legacy-extension files are minimal synthetic inputs. They exist only to verify predictable rejection and must never be treated as real customer documents.
