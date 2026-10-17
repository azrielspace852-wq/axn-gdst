# AXION Dataset Generator v2.0

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

A web-based automatic dataset generator — all processing happens in the browser, no server required, and no data is uploaded to third parties.

## Features

- **Custom Column Mode** — build a JSON structure using a field builder with presets (Instruction, Chat, Document, Classification, Q&A, Code).
- **Custom JSON Label Mode** — write your own template like `{"text":""}` then set quantity; the system auto-fills empty fields.
- **Text Sources** — Synthetic (templates), Hybrid (corpus + templates), or pure Corpus.
- **Anti-Duplicate** — SimHash64 + LSH bands + IndexedDB persistent memory. Fingerprint is computed from the record content (ignores metadata like id/uuid/timestamp).
- **Quality Controls** — Near-duplicate threshold (Hamming distance), minimum unique-word ratio, maximum retries.
- **Multi-File Output** — large outputs are split into multiple files; outputs greater than one file are automatically packaged into a ZIP.
- **Corpus Library** — auto-fetch `corpus-<lang>-<id>` assets from GitHub Releases, or manually upload multi-file (.json/.jsonl/.zip/.txt).
- **Template Library** — auto-fetch `template-<lang>-<id>` assets, manual multi-file upload, or quick-edit in a textarea.
- **Bilingual** — Indonesian / English.
- **Theme** — Dark / Light.
- **Splash Screen** — displayed for 5 seconds on first open.

## How to run

1. Extract the ZIP archive.
2. Open `index.html` in a modern browser (Chrome / Edge / Firefox / Safari).
3. Follow the guide in the **Guide** tab.

> No external dependencies for core features. Inter and JetBrains Mono fonts are loaded from Google Fonts (optional).

## File structure

- `index.html` — markup
- `style.css` — styling (themes, components)
- `script.js` — application logic
- `README.md` — this document

## License

This repository is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) license.

See the LICENSE file for full terms: https://github.com/azrielspace852-wq/axion-dataset-generator/blob/main/LICENSE

---

If you want, I can also:
- Add a short license notice to the site footer (index.html).
- Add language selector default text in English.
- Provide a short CHANGELOG entry describing the license and README update.
