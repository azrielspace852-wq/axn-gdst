# Changelog

All notable changes made to the project are documented in this file.

## [Unreleased] - 2026-10-17

### Changed
- i18n: improved UI language switching and added more interface languages (EN, ES, FR, DE). Added basic I18N dictionary and wiring.
- UI: replaced single language toggle button with a UI language selector. Added duplicate-method selector and threshold inputs to the Quality panel.
- Duplicate detection: implemented MinHash sketch + banding and hybrid mode in addition to existing SimHash+LSH. The system now supports selecting SimHash (default), MinHash, or Hybrid.
- 404 fallback: make SPA fallback more robust — injects a <base> tag into the inlined index.html and tries multiple index locations so that relative assets (style.css, script.js) load correctly when visiting nested routes. This fixes missing CSS/JS when the index is inlined by 404.html.

### Added
- CHANGELOG.md (this file)

### Notes
- All changes committed directly to `main` as requested. Please test the UI in a modern browser (recommend serving via a static server: `python3 -m http.server`).
