# AXION Dataset Generator v2.0

Generator dataset otomatis berbasis web — semua proses terjadi di browser, tanpa server, tanpa upload data ke pihak ketiga.

## Fitur

- **Mode Kolom Kustom** — bangun struktur JSON via field builder dengan presets (Instruction, Chat, Dokumen, Klasifikasi, Q&A, Code).
- **Mode Label JSON Kustom** — tulis sendiri template `{"text":""}` lalu isi quantity; sistem auto-fill field kosong.
- **Sumber Teks** — Sintetis (template), Hybrid (korpus + template), atau murni Korpus.
- **Anti-Duplikat** — SimHash64 + LSH bands + IndexedDB persistent memory. Fingerprint diambil dari isi record (metadata id/uuid/timestamp diabaikan).
- **Kontrol Kualitas** — Near-duplicate threshold (Hamming distance), min. unique-word ratio, max retry.
- **Multi-File Output** — hasil dipecah ke beberapa file; >1 file otomatis dikemas ZIP.
- **Corpus Library** — auto-fetch asset `corpus-<lang>-<id>` dari GitHub Releases, atau upload manual multi-file (.json/.jsonl/.zip/.txt).
- **Template Library** — auto-fetch asset `template-<lang>-<id>`, upload manual multi-file, atau quick-edit di textarea.
- **Bilingual** — Bahasa Indonesia / English.
- **Theme** — Dark / Light.
- **Splash Screen** — tampil 5 detik saat pertama dibuka.

## Cara Menjalankan

1. Extract ZIP.
2. Buka `index.html` di browser modern (Chrome / Edge / Firefox / Safari).
3. Ikuti panduan di tab **Panduan**.

> Tidak ada dependency eksternal untuk fitur inti. Font Inter & JetBrains Mono dimuat dari Google Fonts (opsional).

## Struktur File

- `index.html` — markup
- `style.css` — styling (tema, komponen)
- `script.js` — logika aplikasi
- `README.md` — dokumen ini

## Lisensi

MIT — bebas dipakai dan dimodifikasi.