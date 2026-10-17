'use strict';
/* ==========================================================================
   AXION Dataset Generator v2.0
   ========================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pick = a => a[Math.floor(Math.random() * a.length)];
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const yieldUI = () => new Promise(r => setTimeout(r, 0));
const fmt = n => n.toLocaleString('id-ID');
const dateStr = (d = new Date()) => d.toISOString().slice(0, 10);
const humanSize = b => {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1073741824) return (b / 1048576).toFixed(2) + ' MB';
  return (b / 1073741824).toFixed(2) + ' GB';
};

const SVG = {
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  spinner: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
};
const ic = (name, cls = '') => '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (SVG[name] || '') + '</svg>';

/* ===== Hashing ===== */
function hash32(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }
function popcount(x) { x = x - ((x >> 1) & 0x55555555); x = (x & 0x33333333) + ((x >> 2) & 0x33333333); x = (x + (x >> 4)) & 0x0f0f0f0f; return (Math.imul(x, 0x01010101) >>> 24) & 0xFF; }
function tokenize(text) { return String(text).toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, ' ').split(/\s+/).filter(w => w.length > 1); }
function simhash64(text) {
  const tokens = tokenize(text);
  if (!tokens.length) return [0, 0];
  let toks = tokens;
  if (toks.length > 300) { toks = []; for (let i = 0; i < 300; i++) toks.push(tokens[Math.floor(Math.random() * tokens.length)]); }
  const v = new Int32Array(64);
  for (const t of toks) {
    const h1 = hash32(t), h2 = hash32('\u0001' + t + '\u0002' + (t.length * 131));
    for (let i = 0; i < 32; i++) { v[i] += ((h1 >>> i) & 1) ? 1 : -1; v[i + 32] += ((h2 >>> i) & 1) ? 1 : -1; }
  }
  let r1 = 0, r2 = 0;
  for (let i = 0; i < 32; i++) { if (v[i] > 0) r1 |= (1 << i); if (v[i + 32] > 0) r2 |= (1 << i); }
  return [r1 >>> 0, r2 >>> 0];
}
const META_RE = /^(id|_id|uuid|guid|index|no|nomor|ts|timestamp|created_at|updated_at|date|tanggal|created|updated)$/i;
function recordText(rec) {
  const parts = [];
  const walk = v => {
    if (v == null) return;
    if (typeof v === 'string') parts.push(v);
    else if (typeof v === 'number' || typeof v === 'boolean') parts.push(String(v));
    else if (Array.isArray(v)) v.forEach(walk);
    else if (typeof v === 'object') Object.values(v).forEach(walk);
  };
  if (rec && typeof rec === 'object') { for (const [k, v] of Object.entries(rec)) { if (META_RE.test(k)) continue; walk(v); } } else walk(rec);
  return parts.join(' ');
}
function normalizeForHash(t) { return String(t).toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, ' ').replace(/\s+/g, ' ').trim(); }
function fingerprintRecord(rec) {
  const norm = normalizeForHash(recordText(rec));
  const [sh1, sh2] = simhash64(norm);
  return { exact: hash32(norm), sh1, sh2 };
}
function hamming(a1, a2, b1, b2) { return popcount((a1 ^ b1) >>> 0) + popcount((a2 ^ b2) >>> 0); }

/* ===== IndexedDB ===== */
const DB = (() => {
  const NAME = 'axion_dsgen_v2', VER = 1;
  const S_FP = 'fp', S_CORPUS = 'corpus', S_TEMPLATES = 'templates';
  let db = null, hasIDB = false, sessionOnly = false;
  async function open() {
    if (!('indexedDB' in window)) { sessionOnly = true; return; }
    try {
      await new Promise((res, rej) => {
        const req = indexedDB.open(NAME, VER);
        req.onupgradeneeded = e => {
          const d = e.target.result;
          ['fp', 'corpus', 'templates'].forEach(n => { if (d.objectStoreNames.contains(n)) d.deleteObjectStore(n); });
          d.createObjectStore('fp', { keyPath: 'exact' });
          d.createObjectStore('corpus', { keyPath: 'id' });
          d.createObjectStore('templates', { keyPath: 'id' });
        };
        req.onsuccess = e => { db = e.target.result; hasIDB = true; res(); };
        req.onerror = e => rej(e.target.error);
      });
    } catch { sessionOnly = true; }
  }
  const tx = (s, m = 'readonly') => db.transaction(s, m).objectStore(s);
  async function put(store, val) { if (!hasIDB) return; await new Promise((res, rej) => { const t = db.transaction(store, 'readwrite'); t.objectStore(store).put(val); t.oncomplete = res; t.onerror = e => rej(e.target.error); }); }
  async function getAll(store) { if (!hasIDB) return []; return new Promise((res, rej) => { const r = tx(store).getAll(); r.onsuccess = () => res(r.result || []); r.onerror = e => rej(e.target.error); }); }
  async function del(store, key) { if (!hasIDB) return; await new Promise((res, rej) => { const t = db.transaction(store, 'readwrite'); t.objectStore(store).delete(key); t.oncomplete = res; t.onerror = e => rej(e.target.error); }); }
  async function clearStore(store) { if (!hasIDB) return; await new Promise((res, rej) => { const t = db.transaction(store, 'readwrite'); t.objectStore(store).clear(); t.oncomplete = res; t.onerror = e => rej(e.target.error); }); }
  async function cursorAll(store, fn) { if (!hasIDB) return; await new Promise((res, rej) => { const r = tx(store).openCursor(); r.onsuccess = e => { const c = e.target.result; if (c) { fn(c.value); c.continue(); } else res(); }; r.onerror = e => rej(e.target.error); }); }
  async function estimateSize() { if (!hasIDB || !navigator.storage || !navigator.storage.estimate) return 0; try { return (await navigator.storage.estimate()).usage || 0; } catch { return 0; } }
  return { open, put, getAll, del, clearStore, cursorAll, estimateSize, get hasIDB() { return hasIDB; }, get sessionOnly() { return sessionOnly; }, S_FP, S_CORPUS, S_TEMPLATES };
})();

/* ===== Fingerprint store ===== */
const FP = (() => {
  const exactSet = new Set(), records = [], bands = [new Map(), new Map(), new Map(), new Map()], sources = new Map();
  function bandKeys(sh1, sh2) { return ['0:' + (sh1 & 0xFFFF), '1:' + ((sh1 >>> 16) & 0xFFFF), '2:' + (sh2 & 0xFFFF), '3:' + ((sh2 >>> 16) & 0xFFFF)]; }
  function addToMemory(fp) {
    if (exactSet.has(fp.exact)) return false;
    exactSet.add(fp.exact);
    const idx = records.length; records.push(fp);
    const keys = bandKeys(fp.sh1, fp.sh2);
    for (let i = 0; i < 4; i++) { let arr = bands[i].get(keys[i]); if (!arr) { arr = []; bands[i].set(keys[i], arr); } arr.push(idx); }
    if (fp.src) sources.set(fp.src, (sources.get(fp.src) || 0) + 1);
    return true;
  }
  function check(fp, maxDist = 4) {
    if (exactSet.has(fp.exact)) return { exact: true, dist: 0 };
    const keys = bandKeys(fp.sh1, fp.sh2), seen = new Set();
    let best = 64;
    for (let i = 0; i < 4; i++) {
      const arr = bands[i].get(keys[i]); if (!arr) continue;
      for (const idx of arr) { if (seen.has(idx)) continue; seen.add(idx);
        const o = records[idx]; const d = hamming(fp.sh1, fp.sh2, o.sh1, o.sh2);
        if (d < best) best = d; if (d <= maxDist) return { exact: false, dist: d };
      }
    }
    return { exact: false, dist: best };
  }
  async function loadAll(cb) { let n = 0; await DB.cursorAll(DB.S_FP, v => { addToMemory(v); n++; if (n % 5000 === 0 && cb) cb(n); }); }
  async function commitBatch(list) {
    if (!DB.hasIDB || !list.length) return;
    for (let i = 0; i < list.length; i++) { await DB.put(DB.S_FP, list[i]); if (i % 500 === 499) await yieldUI(); }
  }
  async function clear() { exactSet.clear(); records.length = 0; sources.clear(); bands.forEach(m => m.clear()); await DB.clearStore(DB.S_FP); }
  return { addToMemory, check, loadAll, commitBatch, clear, get size() { return records.length; }, get sourceCount() { return sources.size; }, get isSessionOnly() { return DB.sessionOnly; } };
})();

/* ===== Corpus store ===== */
const Corpus = (() => {
  const cache = new Map();
  async function load() { const all = await DB.getAll(DB.S_CORPUS); cache.clear(); for (const c of all) cache.set(c.id, c); }
  async function add(c) { cache.set(c.id, c); await DB.put(DB.S_CORPUS, c); }
  async function remove(id) { cache.delete(id); await DB.del(DB.S_CORPUS, id); }
  async function clearAll() { cache.clear(); await DB.clearStore(DB.S_CORPUS); }
  const all = () => [...cache.values()];
  const byLang = lang => [...cache.values()].filter(c => c.lang === lang);
  function pickText(lang) { const list = byLang(lang); if (!list.length) return null; const c = pick(list); return c.texts && c.texts.length ? pick(c.texts) : null; }
  function pickAnyText() { const list = [...cache.values()]; if (!list.length) return null; const c = pick(list); return c.texts && c.texts.length ? pick(c.texts) : null; }
  const totalTexts = () => [...cache.values()].reduce((a, c) => a + (c.texts?.length || 0), 0);
  const langs = () => new Set([...cache.values()].map(c => c.lang));
  return { load, add, remove, clearAll, all, byLang, pickText, pickAnyText, totalTexts, langs };
})();

/* ===== Template Library ===== */
const TplLib = (() => {
  const cache = new Map();
  let activePool = []; // merged template lines

  async function load() {
    const all = await DB.getAll(DB.S_TEMPLATES);
    cache.clear();
    for (const t of all) cache.set(t.id, t);
    rebuildPool();
  }
  function rebuildPool() {
    const pool = [];
    for (const c of cache.values()) {
      if (Array.isArray(c.lines)) pool.push(...c.lines);
    }
    activePool = [...new Set(pool.map(s => s.trim()).filter(Boolean))];
  }
  async function add(bundle) { cache.set(bundle.id, bundle); await DB.put(DB.S_TEMPLATES, bundle); rebuildPool(); }
  async function remove(id) { cache.delete(id); await DB.del(DB.S_TEMPLATES, id); rebuildPool(); }
  async function clearAll() { cache.clear(); activePool = []; await DB.clearStore(DB.S_TEMPLATES); }

  const all = () => [...cache.values()];
  const totalLines = () => all().reduce((a, c) => a + (c.lines?.length || 0), 0);
  const langs = () => new Set(all().map(c => c.lang));
  const getActive = () => activePool;

  async function addManualLines(lines, lang = 'all') {
    const bundle = {
      id: 'manual:' + Date.now() + ':' + Math.random().toString(36).slice(2, 7),
      name: 'manual-' + new Date().toISOString().slice(0, 10),
      lang, source: 'manual', addedAt: Date.now(),
      lines: lines.map(s => s.trim()).filter(Boolean)
    };
    await add(bundle);
    return bundle;
  }
  async function clearManual() {
    const ids = all().filter(c => c.source === 'manual').map(c => c.id);
    for (const id of ids) await remove(id);
  }
  return { load, add, remove, clearAll, all, totalLines, langs, getActive, addManualLines, clearManual };
})();

/* ===== Language bank data ===== */
const BANKS = {
  id: {
    nouns: ['sistem','data','pengguna','aplikasi','proses','hasil','metode','laporan','analisis','fitur','konten','informasi','model','layanan','platform','pengalaman','solusi','kebutuhan','tahapan','parameter','arsitektur','komponen','protokol','antarmuka','basis data','skenario','inisiatif','kapabilitas','indikator','prioritas','segmentasi','infrastruktur','otomatisasi','integrasi','evaluasi','korelasi','iterasi','portofolio'],
    verbs: ['mengelola','menganalisis','memproses','menyimpan','mengembangkan','memvalidasi','mengoptimalkan','menyusun','mengukur','meningkatkan','menjelaskan','membangun','mengevaluasi','menerapkan','mengintegrasikan','merancang','mengotomatiskan','menstandarkan','mendistribusikan','mengoordinasikan'],
    adjs: ['efisien','akurat','cepat','stabil','fleksibel','andal','modern','sederhana','kompleks','terukur','konsisten','adaptif','transparan','kolaboratif','berkelanjutan','responsif','terdistribusi','terpadu'],
    conns: ['Selain itu','Oleh karena itu','Dengan demikian','Namun','Selanjutnya','Sebagai contoh','Pada akhirnya','Di sisi lain','Lebih lanjut','Secara umum','Karena itu','Sebaliknya','Dalam konteks ini','Sebagai konsekuensinya','Pada saat yang sama','Untuk itu'],
    subjects: ['pengembangan produk','analisis data','transformasi digital','pengalaman pengguna','efisiensi kerja','tata kelola data','keamanan sistem','otomatisasi proses','kolaborasi tim','manajemen risiko','integrasi layanan','optimalisasi biaya']
  },
  en: {
    nouns: ['system','data','user','application','process','result','method','report','analysis','feature','content','information','model','service','platform','experience','solution','requirement','parameter','workflow','architecture','component','protocol','interface','database','scenario','initiative','capability','indicator','priority','segmentation','infrastructure','automation','integration','evaluation','correlation','iteration','portfolio'],
    verbs: ['manage','analyze','process','store','develop','validate','optimize','arrange','measure','improve','explain','build','evaluate','implement','integrate','design','automate','standardize','distribute','coordinate'],
    adjs: ['efficient','accurate','fast','stable','flexible','reliable','modern','simple','complex','measurable','consistent','adaptive','transparent','collaborative','sustainable','responsive','distributed','integrated'],
    conns: ['In addition','Therefore','Thus','However','Next','For example','Finally','On the other hand','Furthermore','Generally','Because of this','Conversely','In this context','As a consequence','At the same time','To that end'],
    subjects: ['product development','data analysis','digital transformation','user experience','work efficiency','data governance','system security','process automation','team collaboration','risk management','service integration','cost optimization']
  }
};

const TOPICS = {
  code: {
    id: { nouns:['fungsi','variabel','array','objek','kelas','modul','endpoint','query','cache','token','middleware','library','komponen','hook','database','routing','reducer','serializer','migrasi','exception'], verbs:['memanggil','mengembalikan','memvalidasi','menginisialisasi','merefaktor','mengompilasi','men-deploy','men-debug','mengindeks','meng-cache'], subjects:['penanganan error','unit test','struktur data','API REST','manajemen state','kompleksitas algoritma','dependency injection','optimasi query','keamanan aplikasi','versioning API','logging terstruktur','rate limiting'] },
    en: { nouns:['function','variable','array','object','class','module','endpoint','query','cache','token','middleware','library','component','hook','database','routing','reducer','serializer','migration','exception'], verbs:['call','return','validate','initialize','refactor','compile','deploy','debug','index','cache'], subjects:['error handling','unit testing','data structures','REST API','state management','algorithm complexity','dependency injection','query optimization','application security','API versioning','structured logging','rate limiting'] }
  },
  document: {
    id: { nouns:['dokumen','paragraf','bab','bagian','lampiran','ringkasan','kutipan','referensi','halaman','catatan','prosedur','kebijakan','panduan','klausul','notulen','laporan'], verbs:['menjelaskan','menguraikan','merangkum','mendokumentasikan','menyusun','meninjau','mencatat','mengklasifikasikan','merevisi','mengarsipkan'], subjects:['prosedur operasional','kebijakan perusahaan','laporan tahunan','dokumentasi teknis','ringkasan eksekutif','analisis risiko','audit internal','rencana strategis'] },
    en: { nouns:['document','paragraph','chapter','section','appendix','summary','quotation','reference','page','note','procedure','policy','guide','clause','minutes','report'], verbs:['explain','describe','summarize','document','compose','review','record','classify','revise','archive'], subjects:['standard operating procedure','company policy','annual report','technical documentation','executive summary','risk analysis','internal audit','strategic plan'] }
  },
  article: {
    id: { nouns:['artikel','tulisan','opini','fakta','sumber','narasumber','isu','topik','pembaca','redaksi','paragraf','judul','editorial','naskah','wawancara'], verbs:['membahas','mengulas','mengangkat','menyoroti','menjelaskan','melaporkan','mengutip','menganalisis','menelusuri'], subjects:['perkembangan teknologi','perubahan iklim','ekonomi digital','kesehatan mental','dunia pendidikan','budaya populer','gaya hidup','kebijakan publik'] },
    en: { nouns:['article','writing','opinion','fact','source','speaker','issue','topic','reader','editorial','paragraph','headline','column','manuscript','interview'], verbs:['discuss','review','raise','highlight','explain','report','quote','analyze','examine','explore'], subjects:['technology trends','climate change','digital economy','mental health','education','popular culture','lifestyle','public policy'] }
  },
  conversation: {
    id: { nouns:['percakapan','pesan','tanggapan','pertanyaan','jawaban','topik','nada','konteks','pengguna','asisten','balasan','instruksi','klarifikasi'], verbs:['menjawab','menanyakan','menanggapi','menjelaskan','menyarankan','mengonfirmasi','menyapa','mengklarifikasi','meminta','menawarkan'], subjects:['layanan pelanggan','konsultasi teknis','pemesanan produk','bantuan akun','panduan penggunaan','penanganan keluhan'] },
    en: { nouns:['conversation','message','reply','question','answer','topic','tone','context','user','assistant','response','instruction','clarification'], verbs:['answer','ask','respond','explain','suggest','confirm','greet','clarify','request','offer'], subjects:['customer service','technical consultation','product ordering','account support','usage guidance','complaint handling'] }
  },
  qa: {
    id: { nouns:['pertanyaan','jawaban','konteks','fakta','penjelasan','contoh','kesimpulan','referensi','langkah','definisi','alasan'], verbs:['menjawab','menjelaskan','menyebutkan','menyimpulkan','menguraikan','membuktikan','mendefinisikan','mengaitkan'], subjects:['pengetahuan umum','sains dasar','sejarah','matematika','teknologi','kesehatan','geografi','bahasa'] },
    en: { nouns:['question','answer','context','fact','explanation','example','conclusion','reference','step','definition','reason'], verbs:['answer','explain','mention','conclude','describe','prove','define','relate'], subjects:['general knowledge','basic science','history','mathematics','technology','health','geography','language'] }
  },
  product: {
    id: { nouns:['produk','harga','kualitas','kemasan','pengiriman','layanan','pelanggan','ulasan','fitur','garansi','spesifikasi','varian'], verbs:['membeli','mengulas','merekomendasikan','membandingkan','memilih','menggunakan','menilai','mempertimbangkan'], subjects:['kualitas produk','harga dan nilai','pengalaman pengiriman','layanan pelanggan','perbandingan produk','keandalan produk'] },
    en: { nouns:['product','price','quality','packaging','shipping','service','customer','review','feature','warranty','specification','variant'], verbs:['buy','review','recommend','compare','choose','use','rate','consider'], subjects:['product quality','price and value','shipping experience','customer service','product comparison','product reliability'] }
  },
  news: {
    id: { nouns:['berita','peristiwa','sumber','narasumber','kronologi','dampak','kebijakan','masyarakat','pemerintah','data','pernyataan','kronik'], verbs:['melaporkan','mengabarkan','mengonfirmasi','menyatakan','menjelaskan','menganalisis','memantau','menelusuri'], subjects:['ekonomi nasional','politik','teknologi','lingkungan','kesehatan','pendidikan','keamanan','energi'] },
    en: { nouns:['news','event','source','speaker','chronology','impact','policy','society','government','data','statement','chronicle'], verbs:['report','announce','confirm','state','explain','analyze','monitor','trace'], subjects:['national economy','politics','technology','environment','health','education','security','energy'] }
  },
  tutorial: {
    id: { nouns:['langkah','tahapan','alat','bahan','contoh','hasil','praktik','tips','kesalahan','panduan','prasyarat','verifikasi'], verbs:['menginstal','mengonfigurasi','menjalankan','menguji','membuat','menyiapkan','mengecek','menyelesaikan','memverifikasi','memodifikasi'], subjects:['instalasi perangkat lunak','konfigurasi server','pembuatan proyek','pengujian aplikasi','optimalisasi performa','debugging produksi'] },
    en: { nouns:['step','stage','tool','material','example','result','practice','tip','mistake','guide','prerequisite','verification'], verbs:['install','configure','run','test','create','prepare','check','complete','verify','modify'], subjects:['software installation','server configuration','project setup','application testing','performance tuning','production debugging'] }
  }
};

const TEMPLATES = {
  id: [
    '{Noun} ini {verb} {noun} dengan cara yang {adj}.',
    'Kita perlu {verb} {noun} agar {noun2} tetap {adj}.',
    'Dalam praktiknya, {subject} sering dipakai untuk {verb} {noun}.',
    '{conn}, {noun} yang {adj} akan membantu {verb} {noun2} lebih cepat.',
    'Contoh sederhana dari {subject}: {noun} digunakan untuk {verb} {noun2}.',
    'Jika {noun} tidak {adj}, maka proses {verb} {noun2} akan terhambat.',
    'Banyak tim memilih {noun} karena {adj} dan mudah untuk {verb} {noun2}.',
    '{Noun} yang {adj} membuat {subject} jauh lebih mudah dipahami.',
    'Pada tahap {subject}, {noun} berperan penting untuk {verb} {noun2}.',
    'Secara umum, {noun} dan {noun2} saling terkait dalam {subject}.',
    'Pendekatan {adj} terhadap {subject} menuntut kita untuk {verb} {noun} secara konsisten.',
    'Mengapa {subject} penting? Karena {noun} yang {adj} memengaruhi kualitas {noun2}.',
    'Tanpa {noun} yang {adj}, {subject} berisiko menghasilkan {noun2} yang tidak konsisten.',
    'Langkah awal dalam {subject} adalah {verb} {noun} sebelum menyentuh {noun2}.',
    '{conn}, kita bisa {verb} {noun} untuk mempercepat tercapainya {subject}.',
    'Studi kasus {subject} menunjukkan bahwa {noun} yang {adj} berkorelasi dengan {noun2} yang stabil.',
    'Ada tiga alasan mengapa {noun} perlu {verb} dalam konteks {subject}: {adj}, {adj2}, dan {adj3}.',
    'Setelah {verb} {noun}, tim biasanya melanjutkan dengan {verb2} {noun2} agar hasilnya {adj}.',
    'Meskipun {noun} tampak {adj}, ia tetap perlu {verb} ketika {subject} menjadi prioritas.',
    'Alih-alih {verb} {noun} secara manual, banyak organisasi memilih untuk mengotomatiskan {subject}.',
    'Rekomendasi kami: mulai dengan {verb} {noun} yang paling {adj}, lalu ukur dampaknya terhadap {subject}.',
    '{Subject} tidak bisa dilepaskan dari {noun}; keduanya menentukan seberapa {adj} {noun2} di lapangan.',
    'Pada level teknis, {noun} yang {adj} akan {verb} {noun2} tanpa mengorbankan stabilitas {subject}.',
    'Kesalahan umum dalam {subject} adalah lupa {verb} {noun} sebelum {verb2} {noun2}.',
    'Bila {noun2} dianggap kritikal, prioritaskan {verb} {noun} dengan pendekatan yang {adj}.'
  ],
  en: [
    'This {noun} will {verb} the {noun2} in an {adj} way.',
    'We need to {verb} the {noun} so that {noun2} stays {adj}.',
    'In practice, {subject} is often used to {verb} the {noun}.',
    '{conn}, an {adj} {noun} helps {verb} the {noun2} faster.',
    'A simple example of {subject}: the {noun} is used to {verb} {noun2}.',
    'If the {noun} is not {adj}, the process to {verb} {noun2} will be blocked.',
    'Many teams choose this {noun} because it is {adj} and easy to {verb} {noun2}.',
    'An {adj} {noun} makes {subject} much easier to understand.',
    'At the {subject} stage, the {noun} plays a key role in helping {verb} {noun2}.',
    'Generally, the {noun} and {noun2} are closely related within {subject}.',
    'An {adj} approach to {subject} requires us to {verb} the {noun} consistently.',
    'Why does {subject} matter? Because an {adj} {noun} shapes the quality of {noun2}.',
    'Without an {adj} {noun}, {subject} risks producing inconsistent {noun2}.',
    'The first step in {subject} is to {verb} the {noun} before touching {noun2}.',
    '{conn}, we can {verb} the {noun} to accelerate progress in {subject}.',
    'A case study of {subject} shows that an {adj} {noun} correlates with stable {noun2}.',
    'There are three reasons to {verb} the {noun} within {subject}: it is {adj}, {adj2}, and {adj3}.',
    'After we {verb} the {noun}, teams usually {verb2} the {noun2} so the outcome stays {adj}.',
    'Although the {noun} looks {adj}, it still needs to {verb} when {subject} becomes a priority.',
    'Instead of {verb} the {noun} manually, many organizations automate {subject} end to end.',
    'Our recommendation: start by {verb} the most {adj} {noun}, then measure the impact on {subject}.',
    '{Subject} cannot be separated from the {noun}; together they determine how {adj} the {noun2} is.',
    'On a technical level, an {adj} {noun} will {verb} the {noun2} without hurting {subject}.',
    'A common mistake in {subject} is forgetting to {verb} the {noun} before {verb2} the {noun2}.',
    'If the {noun2} is critical, prioritize {verb} the {noun} with an {adj} approach.'
  ]
};

const NAMES = {
  id: ['Budi Santoso','Siti Aminah','Agus Wijaya','Dewi Lestari','Rizky Pratama','Nur Aisyah','Fajar Nugroho','Putri Handayani','Eko Saputra','Maya Anggraini','Hendra Kusuma','Indah Permata','Bayu Setiawan','Ratna Sari','Dimas Aditya'],
  en: ['John Smith','Emily Johnson','Michael Brown','Sarah Davis','David Wilson','Jessica Miller','James Taylor','Linda Anderson','Robert Thomas','Karen White','Daniel Martinez','Laura Garcia','Christopher Lee','Nancy Walker','Matthew Hall']
};

const CODE_SNIPPETS = [
  "function processData(items) {\n  return items.filter(Boolean).map(item => ({\n    id: item.id,\n    value: item.value\n  }));\n}",
  "async function fetchData(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error('Request failed');\n  return res.json();\n}",
  "class DataStore {\n  constructor() {\n    this.items = new Map();\n  }\n  set(key, value) { this.items.set(key, value); }\n  get(key) { return this.items.get(key); }\n}",
  "const sum = (arr) => arr.reduce((acc, n) => acc + n, 0);",
  "def normalize(text):\n    return \" \".join(text.lower().split())",
  "for i, item in enumerate(items):\n    print(i, item)",
  "SELECT id, name\nFROM users\nWHERE active = 1\nORDER BY created_at DESC;",
  "app.get('/api/users', async (req, res) => {\n  const users = await db.user.findMany();\n  res.json(users);\n});",
  "const debounce = (fn, delay) => {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), delay);\n  };\n};",
  "export function useToggle(initial = false) {\n  const [on, setOn] = useState(initial);\n  return [on, () => setOn(v => !v)];\n}",
  "type Result<T, E = Error> =\n  | { ok: true; value: T }\n  | { ok: false; error: E };"
];

/* ===== Bank cache ===== */
const bankCache = new Map();
function getBank(topic, lang) {
  const key = topic + '|' + lang;
  if (bankCache.has(key)) return bankCache.get(key);
  const base = BANKS[lang];
  const t = (TOPICS[topic] && TOPICS[topic][lang]) || {};
  const merged = {
    nouns: [...new Set([...base.nouns, ...(t.nouns || [])])],
    verbs: [...new Set([...base.verbs, ...(t.verbs || [])])],
    adjs: base.adjs,
    conns: base.conns,
    subjects: t.subjects && t.subjects.length ? t.subjects : base.subjects
  };
  bankCache.set(key, merged);
  return merged;
}

/* ===== Text source ===== */
let SOURCE_MODE = 'synthetic';

function pickTemplate(lang) {
  const custom = TplLib.getActive();
  const pool = custom.length ? [...TEMPLATES[lang], ...custom] : TEMPLATES[lang];
  return pick(pool);
}

function makeSentence(topic, lang, hints) {
  if (SOURCE_MODE === 'corpus' || SOURCE_MODE === 'hybrid') {
    const c = Corpus.pickText(lang) || Corpus.pickAnyText();
    if (c) return c;
    if (SOURCE_MODE === 'corpus') return '';
  }
  const b = getBank(topic, lang);
  const tpl = pickTemplate(lang);
  const c = {
    noun: (hints && hints.mainNoun) || pick(b.nouns),
    noun2: pick(b.nouns),
    verb: pick(b.verbs), verb2: pick(b.verbs),
    adj: pick(b.adjs), adj2: pick(b.adjs), adj3: pick(b.adjs),
    conn: pick(b.conns),
    subject: (hints && hints.subject) || pick(b.subjects)
  };
  if (c.noun2 === c.noun) c.noun2 = pick(b.nouns);
  if (c.verb2 === c.verb) c.verb2 = pick(b.verbs);
  if (c.adj2 === c.adj) c.adj2 = pick(b.adjs);
  if (c.adj3 === c.adj) c.adj3 = pick(b.adjs);
  return tpl.replace(/\{(\w+)\}/g, (m, k) => {
    if (k === 'Noun') return cap(c.noun);
    if (k === 'Noun2') return cap(c.noun2);
    if (k === 'Verb') return cap(c.verb);
    if (k === 'Verb2') return cap(c.verb2);
    if (k === 'Adj') return cap(c.adj);
    if (k === 'Adj2') return cap(c.adj2);
    if (k === 'Adj3') return cap(c.adj3);
    if (k === 'Subject') return cap(c.subject);
    if (k === 'Conn') return c.conn;
    return (k in c) ? c[k] : m;
  });
}

function makeParagraph(topic, lang, min = 3, max = 6) {
  if (SOURCE_MODE === 'corpus' || SOURCE_MODE === 'hybrid') {
    const c = Corpus.pickText(lang) || Corpus.pickAnyText();
    if (c) {
      if (SOURCE_MODE === 'corpus') return c;
      if (Math.random() < 0.5) return c;
    }
  }
  const b = getBank(topic, lang);
  const n = randInt(min, max);
  const subject = pick(b.subjects), mainNoun = pick(b.nouns);
  const out = [];
  for (let i = 0; i < n; i++) {
    const hints = (i === 0 || Math.random() < 0.5) ? { subject, mainNoun: Math.random() < 0.6 ? mainNoun : undefined } : undefined;
    out.push(makeSentence(topic, lang, hints));
  }
  return out.filter(Boolean).join(' ');
}

function makeTitle(topic, lang) {
  if (SOURCE_MODE === 'corpus' || SOURCE_MODE === 'hybrid') {
    const c = Corpus.pickText(lang) || Corpus.pickAnyText();
    if (c && c.length < 120) return c;
  }
  const b = getBank(topic, lang);
  const s = cap(pick(b.subjects));
  const patterns = {
    id: [`Panduan Lengkap ${s}`, `Memahami ${s} untuk Pemula`, `${s}: Konsep dan Penerapan`, `Analisis ${s} di Era Digital`, `Strategi Efektif untuk ${s}`, `Menakar Dampak ${s}`, `Studi Kasus ${s}`, `Kerangka Kerja ${s}`],
    en: [`A Complete Guide to ${s}`, `Understanding ${s} for Beginners`, `${s}: Concepts and Practices`, `Analyzing ${s} in the Digital Era`, `Effective Strategies for ${s}`, `Measuring the Impact of ${s}`, `A Case Study of ${s}`, `A Framework for ${s}`]
  };
  return pick(patterns[lang]);
}

const makeCode = () => pick(CODE_SNIPPETS);
function makeEmail(lang) { const nm = pick(NAMES[lang]).toLowerCase().split(' '); const domains = ['example.com','mail.com','data.io','sample.org','corp.net']; return nm[0] + '.' + nm[1] + '@' + pick(domains); }
function makeUrl(topic, lang) { const b = getBank(topic, lang); const slug = [pick(b.nouns), pick(b.subjects).split(' ')[0], pick(b.nouns)].join('-').toLowerCase().replace(/[^a-z0-9-]/g, ''); return 'https://example.com/' + slug + '-' + randInt(100, 999); }
function makeChat(topic, lang) {
  const turns = randInt(2, 4); const arr = [];
  for (let i = 0; i < turns; i++) arr.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: makeParagraph(topic, lang, 1, 2) });
  return arr;
}

/* ===== Template engine ===== */
function render(tpl, cfg, index, lang) {
  return tpl.replace(/\{([a-zA-Z_]+)(?::([^}]+))?\}/g, (m, key, arg) => {
    switch (key) {
      case 'i': case 'index': return String(index);
      case 'n': case 'total': return String(cfg.total || 0);
      case 'uuid': return uuid();
      case 'ts': case 'timestamp': return new Date().toISOString();
      case 'date': return dateStr();
      case 'sentence': return makeSentence(cfg.topic, lang);
      case 'paragraph': case 'text': return makeParagraph(cfg.topic, lang);
      case 'corpus_sentence': { const c = Corpus.pickText(lang) || Corpus.pickAnyText(); if (!c) return makeSentence(cfg.topic, lang); const dot = c.search(/[.!?]/); return dot >= 0 && dot < 200 ? c.slice(0, dot + 1) : c; }
      case 'corpus_paragraph': { const c = Corpus.pickText(lang) || Corpus.pickAnyText(); return c || makeParagraph(cfg.topic, lang); }
      case 'word': return pick(getBank(cfg.topic, lang).nouns);
      case 'title': case 'judul': return makeTitle(cfg.topic, lang);
      case 'code': return makeCode();
      case 'name': case 'nama': return pick(NAMES[lang]);
      case 'email': return makeEmail(lang);
      case 'url': case 'link': return makeUrl(cfg.topic, lang);
      case 'topic': return cfg.topic;
      case 'lang': return lang;
      case 'bool': case 'boolean': return String(Math.random() < 0.5);
      case 'number': { if (arg) { const p = arg.split('-').map(x => parseFloat(x.trim())); if (p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])) return String(randInt(p[0], p[1])); } return String(randInt(1, 100)); }
      case 'pick': return arg ? pick(arg.split('|').map(s => s.trim())) : '';
      default: return m;
    }
  });
}

/* ===== Value maker ===== */
function makeValue(field, cfg, index, lang, seq) {
  if (field.template) return render(field.template, cfg, index, lang);
  const n = (field.name || '').toLowerCase();
  switch (field.type) {
    case 'text': return makeParagraph(cfg.topic, lang, 3, 6);
    case 'sentence': return makeSentence(cfg.topic, lang);
    case 'word': return pick(getBank(cfg.topic, lang).nouns);
    case 'title': return makeTitle(cfg.topic, lang);
    case 'code': return makeCode();
    case 'chat': return makeChat(cfg.topic, lang);
    case 'array': { const len = randInt(2, 5), a = []; for (let i = 0; i < len; i++) a.push(makeSentence(cfg.topic, lang)); return a; }
    case 'number': return randInt(1, 1000);
    case 'boolean': return Math.random() < 0.5;
    case 'uuid': return uuid();
    case 'id': return seq;
    case 'timestamp': return new Date(Date.now() - randInt(0, 30) * 86400000).toISOString();
    case 'date': return dateStr(new Date(Date.now() - randInt(0, 365) * 86400000));
    case 'email': return makeEmail(lang);
    case 'name': return pick(NAMES[lang]);
    case 'url': return makeUrl(cfg.topic, lang);
    case 'auto':
    default: {
      if (/^(id|_id|no|nomor|index)$/.test(n)) return seq;
      if (/uuid|guid/.test(n)) return uuid();
      if (/title|judul|headline/.test(n)) return makeTitle(cfg.topic, lang);
      if (/label|kategori|category|class|sentiment|kelas/.test(n)) return pick(['positif', 'negatif', 'netral']);
      if (/role|sender/.test(n)) return pick(['user', 'assistant']);
      if (/url|link|uri/.test(n)) return makeUrl(cfg.topic, lang);
      if (/email|mail/.test(n)) return makeEmail(lang);
      if (/date|tanggal/.test(n)) return dateStr(new Date(Date.now() - randInt(0, 365) * 86400000));
      if (/time|timestamp|created|updated/.test(n)) return new Date().toISOString();
      if (/question|pertanyaan|prompt|instruction|instruksi/.test(n)) return makeSentence(cfg.topic, lang) + '?';
      if (/answer|jawaban|response|output|completion/.test(n)) return makeParagraph(cfg.topic, lang, 2, 4);
      if (/code|snippet|source/.test(n)) return makeCode();
      if (/messages|chat|conversation|dialog/.test(n)) return makeChat(cfg.topic, lang);
      if (/tag|keyword|kata_kunci/.test(n)) return [pick(getBank(cfg.topic, lang).nouns), pick(getBank(cfg.topic, lang).nouns)];
      return makeParagraph(cfg.topic, lang, 2, 4);
    }
  }
}

function makeRecord(fields, cfg, index) {
  const lang = cfg.lang === 'mix' ? (Math.random() < 0.5 ? 'id' : 'en') : cfg.lang;
  const rec = {};
  for (const f of fields) rec[f.name] = makeValue(f, cfg, index, lang, index + 1);
  return rec;
}

/* ===== Quality ===== */
function uniqueWordRatio(text) {
  if (typeof text !== 'string') return 1;
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 3) return 0;
  return new Set(words).size / words.length;
}
function recordQuality(rec) {
  let total = 0, count = 0;
  const walk = v => {
    if (typeof v === 'string') { if (v.length < 3) return; total += uniqueWordRatio(v); count++; }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(rec);
  return count === 0 ? 0 : total / count;
}

/* ===== Custom label parse ===== */
function parseLabelTemplate(str) {
  str = String(str).trim();
  if (!str) return null;
  try { const p = JSON.parse(str); if (Array.isArray(p) && p.length) return p[0]; if (typeof p === 'object' && p !== null) return p; } catch {}
  const firstLine = str.split(/\r?\n/)[0].trim();
  if (firstLine) { try { const p = JSON.parse(firstLine); if (typeof p === 'object' && p !== null) return p; } catch {} }
  try { const p = JSON.parse('{' + str + '}'); if (typeof p === 'object' && p !== null) return p; } catch {}
  return null;
}

function fillLabelTemplate(tplObj, cfg, index, lang) {
  const walk = (val, key) => {
    if (typeof val === 'string') {
      if (val === '') return makeValue({ name: key || 'text', type: 'auto', template: '' }, cfg, index, lang, index + 1);
      if (val.includes('{')) return render(val, cfg, index, lang);
      return val;
    }
    if (Array.isArray(val)) return val.map(v => walk(v, key));
    if (val && typeof val === 'object') { const out = {}; for (const [k, v] of Object.entries(val)) out[k] = walk(v, k); return out; }
    return val;
  };
  return walk(tplObj, '');
}

/* ===== UI: Field builder ===== */
const TYPES = [
  ['auto','Auto (dari nama)'],['text','Teks / Paragraf'],['sentence','Kalimat'],['word','Kata'],['title','Judul'],
  ['code','Cuplikan Kode'],['chat','Chat (array)'],['array','Array of String'],['number','Angka'],['boolean','Boolean'],
  ['uuid','UUID'],['id','ID Urut'],['timestamp','Timestamp ISO'],['date','Tanggal'],['email','Email'],['name','Nama'],
  ['url','URL'],['template','Template Bebas']
];
const fieldsEl = $('#fields');
function addFieldRow(name = '', type = 'auto', tpl = '') {
  const row = document.createElement('div');
  row.className = 'field-row';
  row.innerHTML = '<input class="f-name" placeholder="nama_kolom" value="' + esc(name) + '" spellcheck="false">' +
    '<select class="f-type">' + TYPES.map(([v, l]) => '<option value="' + v + '">' + l + '</option>').join('') + '</select>' +
    '<input class="f-tpl" placeholder="template opsional, mis: {sentence}" value="' + esc(tpl) + '" spellcheck="false">' +
    '<button class="btn-icon f-del" title="Hapus kolom">' + ic('x') + '</button>';
  row.querySelector('.f-type').value = type;
  row.querySelector('.f-del').addEventListener('click', () => row.remove());
  fieldsEl.appendChild(row);
}

const PRESETS = {
  instruction: [['instruction','template','Jelaskan secara {pick:singkat|detail|ringkas} tentang {topic}.'],['input','template','{corpus_paragraph}'],['output','text',''],['language','template','{lang}']],
  chat: [['id','id',''],['messages','chat',''],['source','template','{topic}'],['created_at','timestamp','']],
  doc: [['id','id',''],['title','title',''],['content','text',''],['url','url',''],['date','date',''],['tags','array','']],
  classify: [['text','template','{corpus_paragraph}'],['label','template','{pick:positif|negatif|netral}'],['confidence','template','{number:70-99}']],
  qa: [['id','id',''],['question','template','{corpus_sentence}?'],['answer','text',''],['context','template','{corpus_paragraph}']],
  code: [['id','id',''],['instruction','template','Buat fungsi {pick:sederhana|kompleks} untuk {topic}.'],['code','code',''],['lang','template','{pick:javascript|python|sql}']]
};

/* ===== i18n ===== */
const I18N = {
  id: {
    'brand.sub': 'v2.0 · Generator Dataset Otomatis',
    'tab.generator': 'Generator', 'tab.corpus': 'Corpus', 'tab.templates': 'Templates', 'tab.help': 'Panduan',
    'splash.sub': 'Dataset Generator', 'splash.hint': 'Menyiapkan aplikasi…',
    'sec.config': 'Konfigurasi Dataset', 'sec.mode': 'Mode Output',
    'sec.quality': 'Kontrol Kualitas & Anti-Duplikat', 'sec.fields': 'Struktur Kolom (Kustom)',
    'sec.memory': 'Memori Duplikat', 'sec.generate': 'Generate', 'sec.preview': 'Preview & Unduh',
    'sec.corpusRelease': 'Corpus dari GitHub Releases', 'sec.corpusStored': 'Corpus Tersimpan',
    'sec.corpusUpload': 'Upload Corpus Manual (Multi-File)',
    'sec.tplRelease': 'Template dari GitHub Releases', 'sec.tplStored': 'Template Tersimpan',
    'sec.tplUpload': 'Upload Template Manual (Multi-File)', 'sec.tplCustom': 'Template Tambahan (Manual / Quick Edit)',
    'f.topic': 'Topik Dataset', 'f.lang': 'Bahasa Output', 'f.source': 'Sumber Teks',
    'f.tokens': 'Target Token (total)', 'f.files': 'Jumlah File', 'f.format': 'Format Output',
    'f.prefix': 'Prefix Nama File', 'f.labelTemplate': 'Template Label (JSON / JSONL)',
    'f.quantity': 'Jumlah Entri', 'f.onfail': 'Kalau gagal unik?', 'f.corpusLang': 'Bahasa (untuk .txt)',
    'f.tplLang': 'Bahasa (untuk file tanpa info)',
    'mode.fields': 'Kolom Kustom', 'mode.label': 'Label JSON Kustom',
    'btn.generate': 'Generate Dataset', 'btn.download': 'Unduh Dataset', 'btn.addField': 'Tambah Kolom',
    'btn.refresh': 'Refresh', 'btn.loadAll': 'Load Semua', 'btn.clearAllCorpus': 'Hapus Semua Corpus',
    'btn.clearAllTpl': 'Hapus Semua Template', 'btn.applyTpl': 'Simpan & Aktifkan', 'btn.importTxt': 'Impor dari .txt',
    'btn.clear': 'Kosongkan', 'btn.uploadMem': 'Upload JSON / JSONL / ZIP', 'btn.clearMem': 'Hapus Semua Memori',
    'btn.pickFiles': 'Pilih File (.json / .jsonl / .zip / .txt)', 'btn.pickTplFiles': 'Pilih File (.txt / .json / .jsonl / .zip)',
    'label.hint': 'Kosongkan nilai string untuk auto-fill. Bisa pakai placeholder: {sentence}, {paragraph}, {title}, {code}, {number:1-100}, {uuid}, dsb.',
    'help.title': 'Panduan Lengkap',
    'status.waiting': 'Menunggu perintah…', 'preview.empty': 'Belum ada dataset. Jalankan generate terlebih dahulu.'
  },
  en: {
    'brand.sub': 'v2.0 · Automated Dataset Generator',
    'tab.generator': 'Generator', 'tab.corpus': 'Corpus', 'tab.templates': 'Templates', 'tab.help': 'Help',
    'splash.sub': 'Dataset Generator', 'splash.hint': 'Preparing application…',
    'sec.config': 'Dataset Configuration', 'sec.mode': 'Output Mode',
    'sec.quality': 'Quality Control & Anti-Duplicate', 'sec.fields': 'Custom Field Structure',
    'sec.memory': 'Duplicate Memory', 'sec.generate': 'Generate', 'sec.preview': 'Preview & Download',
    'sec.corpusRelease': 'Corpus from GitHub Releases', 'sec.corpusStored': 'Stored Corpus',
    'sec.corpusUpload': 'Manual Corpus Upload (Multi-File)',
    'sec.tplRelease': 'Templates from GitHub Releases', 'sec.tplStored': 'Stored Templates',
    'sec.tplUpload': 'Manual Template Upload (Multi-File)', 'sec.tplCustom': 'Additional Templates (Manual / Quick Edit)',
    'f.topic': 'Dataset Topic', 'f.lang': 'Output Language', 'f.source': 'Text Source',
    'f.tokens': 'Target Tokens (total)', 'f.files': 'Number of Files', 'f.format': 'Output Format',
    'f.prefix': 'File Name Prefix', 'f.labelTemplate': 'Label Template (JSON / JSONL)',
    'f.quantity': 'Entry Quantity', 'f.onfail': 'If uniqueness fails?', 'f.corpusLang': 'Language (for .txt)',
    'f.tplLang': 'Language (for unknown files)',
    'mode.fields': 'Custom Fields', 'mode.label': 'Custom JSON Label',
    'btn.generate': 'Generate Dataset', 'btn.download': 'Download Dataset', 'btn.addField': 'Add Field',
    'btn.refresh': 'Refresh', 'btn.loadAll': 'Load All', 'btn.clearAllCorpus': 'Delete All Corpus',
    'btn.clearAllTpl': 'Delete All Templates', 'btn.applyTpl': 'Save & Activate', 'btn.importTxt': 'Import from .txt',
    'btn.clear': 'Clear', 'btn.uploadMem': 'Upload JSON / JSONL / ZIP', 'btn.clearMem': 'Clear All Memory',
    'btn.pickFiles': 'Choose Files (.json / .jsonl / .zip / .txt)', 'btn.pickTplFiles': 'Choose Files (.txt / .json / .jsonl / .zip)',
    'label.hint': 'Leave a string value empty for auto-fill. Placeholders available: {sentence}, {paragraph}, {title}, {code}, {number:1-100}, {uuid}, etc.',
    'help.title': 'Complete Guide',
    'status.waiting': 'Waiting for command…', 'preview.empty': 'No dataset yet. Run generate first.'
  }
};
let currentAppLang = localStorage.getItem('axion_lang') || 'id';

function applyLanguage(lang) {
  currentAppLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('axion_lang', lang);
  const dict = I18N[lang] || I18N.id;
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  $('#langBtn').textContent = lang === 'id' ? 'EN' : 'ID';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('axion_theme', theme);
  const btn = $('#themeBtn');
  if (theme === 'dark') btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  else btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

/* ===== Navigation ===== */
$$('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab').forEach(b => b.classList.toggle('active', b === btn));
    const v = btn.dataset.view;
    $$('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
    if (v === 'corpus' && !corpusFetched) fetchCorpusReleases();
    if (v === 'templates' && !tplFetched) fetchTemplateReleases();
  });
});

/* ===== File parsing ===== */
function parseJsonOrJsonl(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try { const arr = JSON.parse(trimmed); return Array.isArray(arr) ? arr : [arr]; }
    catch (e) { throw new Error('Invalid JSON array: ' + e.message); }
  }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const lines = trimmed.split(/\r?\n/);
    if (lines.length === 1) { try { return [JSON.parse(trimmed)]; } catch {} }
  }
  const out = [];
  for (const line of trimmed.split(/\r?\n/)) { const t = line.trim(); if (!t) continue; try { out.push(JSON.parse(t)); } catch {} }
  return out;
}

async function parseZipBuffer(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let eocd = -1;
  const minEocd = Math.max(0, u8.length - 22 - 65536);
  for (let i = u8.length - 22; i >= minEocd; i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Invalid ZIP file');
  const cdCount = dv.getUint16(eocd + 10, true);
  const cdOffset = dv.getUint32(eocd + 16, true);
  const results = [];
  let p = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const compSize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const cmtLen = dv.getUint16(p + 32, true);
    const lhOffset = dv.getUint32(p + 42, true);
    const fname = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + cmtLen;
    const low = fname.toLowerCase();
    const isJson = low.endsWith('.json') || low.endsWith('.jsonl');
    const isTxt = low.endsWith('.txt');
    if (!isJson && !isTxt) continue;
    if (dv.getUint32(lhOffset, true) !== 0x04034b50) continue;
    const lhNameLen = dv.getUint16(lhOffset + 26, true);
    const lhExtraLen = dv.getUint16(lhOffset + 28, true);
    const dataStart = lhOffset + 30 + lhNameLen + lhExtraLen;
    const data = u8.subarray(dataStart, dataStart + compSize);
    let text;
    if (method === 0) text = new TextDecoder().decode(data);
    else if (method === 8) {
      try { const ds = new DecompressionStream('deflate-raw'); const stream = new Blob([data]).stream().pipeThrough(ds); text = await new Response(stream).text(); }
      catch (e) { continue; }
    } else continue;
    if (isJson) { try { results.push({ name: fname, records: parseJsonOrJsonl(text) }); } catch {} }
    else { const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean); results.push({ name: fname, records: lines }); }
  }
  return results;
}

/* ===== Text extraction ===== */
const TEXT_FIELDS = ['text','content','sentence','output','completion','answer','input','prompt','instruction','body','paragraph','document','article','passage','description','code','source'];
function extractTexts(records) {
  const out = [];
  const pushIf = s => { if (typeof s !== 'string') return; s = s.trim(); if (s.length >= 20 && s.length <= 5000) out.push(s); };
  for (const r of records) {
    if (typeof r === 'string') { pushIf(r); continue; }
    if (!r || typeof r !== 'object') continue;
    let found = false;
    for (const k of TEXT_FIELDS) if (typeof r[k] === 'string') { pushIf(r[k]); found = true; }
    if (!found) {
      const parts = [];
      const walk = v => { if (typeof v === 'string') parts.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
      walk(r);
      pushIf(parts.join(' '));
    }
  }
  return out;
}
function splitTextToSentences(text) { return text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z\u00C0-\u024F])/).map(s => s.trim()).filter(s => s.length >= 30 && s.length <= 1500); }

/* ===== GitHub Releases ===== */
const RELEASE_REPO = 'azrielspace852-wq/corpus';
const ASSET_RE = /^(corpus|template)-([a-z]{2,5})-(.+)$/i;
let corpusFetched = false, tplFetched = false;
let corpusAssets = [], tplAssets = [];

function logBox(el, msg) {
  el.style.display = 'block';
  const ts = new Date().toLocaleTimeString('id-ID');
  el.textContent += '[' + ts + '] ' + msg + '\n';
  el.scrollTop = el.scrollHeight;
}

async function fetchReleasesAssets() {
  const res = await fetch('https://api.github.com/repos/' + RELEASE_REPO + '/releases', { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const releases = await res.json();
  const corpus = [], tpl = [];
  for (const r of releases) {
    if (!r.assets) continue;
    for (const a of r.assets) {
      const m = a.name.match(ASSET_RE);
      if (!m) continue;
      const item = { name: a.name, lang: m[2].toLowerCase(), size: a.size, url: a.browser_download_url, releaseTag: r.tag_name, type: m[1].toLowerCase() };
      if (item.type === 'corpus') corpus.push(item);
      else tpl.push(item);
    }
  }
  corpus.sort((a, b) => a.name.localeCompare(b.name));
  tpl.sort((a, b) => a.name.localeCompare(b.name));
  return { corpus, tpl };
}

async function fetchCorpusReleases() {
  corpusFetched = true;
  $('#releaseBadge').textContent = 'memuat…';
  $('#releaseBadge').className = 'badge';
  try {
    const { corpus } = await fetchReleasesAssets();
    corpusAssets = corpus;
    $('#releaseBadge').textContent = corpus.length + ' corpus';
    $('#releaseBadge').className = 'badge ok';
    logBox($('#corpusLog'), 'Ditemukan ' + corpus.length + ' asset corpus.');
    renderCorpusStoredGrid();
  } catch (e) {
    $('#releaseBadge').textContent = 'gagal';
    $('#releaseBadge').className = 'badge danger';
    logBox($('#corpusLog'), 'Gagal memuat: ' + e.message);
  }
}

async function fetchTemplateReleases() {
  tplFetched = true;
  $('#tplReleaseBadge').textContent = 'memuat…';
  $('#tplReleaseBadge').className = 'badge';
  try {
    const { tpl } = await fetchReleasesAssets();
    tplAssets = tpl;
    $('#tplReleaseBadge').textContent = tpl.length + ' template';
    $('#tplReleaseBadge').className = 'badge ok';
    logBox($('#tplLog'), 'Ditemukan ' + tpl.length + ' asset template.');
    renderTplStoredGrid();
  } catch (e) {
    $('#tplReleaseBadge').textContent = 'gagal';
    $('#tplReleaseBadge').className = 'badge danger';
    logBox($('#tplLog'), 'Gagal memuat: ' + e.message);
  }
}

function renderCorpusStoredGrid() {
  const grid = $('#corpusStoredGrid');
  const storedMap = new Map(Corpus.all().map(c => [c.id, c]));
  const cards = [];
  for (const a of corpusAssets) {
    const id = 'gh:' + a.name;
    const loaded = storedMap.get(id);
    cards.push(renderCorpusCard(a, id, loaded, 'gh'));
  }
  for (const c of Corpus.all()) {
    if (c.source === 'upload' && !cards.some(html => html.includes('data-id="' + c.id + '"'))) {
      cards.push(renderCorpusCard({ name: c.name, lang: c.lang, size: 0, url: null }, c.id, c, 'up'));
    }
  }
  grid.innerHTML = cards.length ? cards.join('') : '<div class="empty-state">' + ic('folder') + '<div>Belum ada corpus. Load dari releases atau upload manual.</div></div>';
  grid.querySelectorAll('button[data-act]').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.dataset.id;
      if (b.dataset.act === 'load') await loadCorpusAssetById(id, b);
      else if (b.dataset.act === 'remove') {
        if (!confirm('Hapus corpus ini?')) return;
        await Corpus.remove(id);
        await refreshCorpusStats();
        renderCorpusStoredGrid();
      }
    });
  });
}

function renderCorpusCard(a, id, loaded, prefix) {
  const isGh = prefix === 'gh';
  return '<div class="corpus-card ' + (loaded ? 'loaded' : '') + '">' +
    '<div class="corpus-head"><div class="cicon">' + ic('folder') + '</div>' +
    '<div style="flex:1;min-width:0"><div class="corpus-name">' + esc(a.name) + '</div>' +
    '<div class="corpus-meta"><span class="tag">' + esc(a.lang) + '</span>' +
    (isGh ? '<span class="tag">' + humanSize(a.size) + '</span>' : '<span class="tag">upload</span>') +
    (a.releaseTag ? '<span class="tag">' + esc(a.releaseTag) + '</span>' : '') + '</div></div></div>' +
    '<div class="corpus-body">' + (loaded ? 'Tersimpan: ' + fmt(loaded.texts.length) + ' teks' : 'Belum dimuat') + '</div>' +
    '<div class="corpus-actions">' +
    (loaded ? '<button class="btn-ghost" data-act="remove" data-id="' + esc(id) + '">' + ic('trash') + ' Hapus</button>'
            : (isGh ? '<button class="btn-primary" data-act="load" data-id="' + esc(id) + '">' + ic('download') + ' Load</button>'
                    : '')) +
    '</div></div>';
}

async function loadCorpusAssetById(id, btnEl) {
  const a = corpusAssets.find(x => 'gh:' + x.name === id);
  if (!a) return;
  if (btnEl) { btnEl.disabled = true; btnEl.innerHTML = ic('spinner', 'spin') + ' Memuat…'; }
  logBox($('#corpusLog'), 'Mengunduh ' + a.name + ' (' + humanSize(a.size) + ')…');
  try {
    const res = await fetch(a.url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = await res.arrayBuffer();
    const zipResults = await parseZipBuffer(new Uint8Array(buf));
    let allTexts = [];
    for (const z of zipResults) allTexts = allTexts.concat(extractTexts(z.records));
    allTexts = allTexts.flatMap(t => t.length > 1500 ? splitTextToSentences(t) : [t]);
    if (allTexts.length > 200000) { const s = []; for (let i = 0; i < 200000; i++) s.push(allTexts[Math.floor(Math.random() * allTexts.length)]); allTexts = s; }
    await Corpus.add({ id, name: a.name, lang: a.lang, source: 'github', addedAt: Date.now(), texts: allTexts });
    logBox($('#corpusLog'), '✓ ' + fmt(allTexts.length) + ' teks tersimpan dari ' + a.name);
    await refreshCorpusStats();
    renderCorpusStoredGrid();
  } catch (e) {
    logBox($('#corpusLog'), '✗ Gagal: ' + e.message);
    if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = ic('download') + ' Load'; }
  }
}

function renderTplStoredGrid() {
  const grid = $('#tplStoredGrid');
  const storedMap = new Map(TplLib.all().map(t => [t.id, t]));
  const cards = [];
  for (const a of tplAssets) {
    const id = 'gh:' + a.name;
    const loaded = storedMap.get(id);
    cards.push(renderTplCard(a, id, loaded, 'gh'));
  }
  for (const t of TplLib.all()) {
    if (t.source === 'upload' && !cards.some(html => html.includes('data-id="' + t.id + '"'))) {
      cards.push(renderTplCard({ name: t.name, lang: t.lang, size: 0 }, t.id, t, 'up'));
    }
  }
  grid.innerHTML = cards.length ? cards.join('') : '<div class="empty-state">' + ic('book') + '<div>Belum ada template. Load dari releases atau upload manual.</div></div>';
  grid.querySelectorAll('button[data-act]').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.dataset.id;
      if (b.dataset.act === 'load') await loadTplAssetById(id, b);
      else if (b.dataset.act === 'remove') {
        if (!confirm('Hapus template ini?')) return;
        await TplLib.remove(id);
        await refreshTplStats();
        renderTplStoredGrid();
      }
    });
  });
}

function renderTplCard(a, id, loaded, prefix) {
  const isGh = prefix === 'gh';
  return '<div class="corpus-card ' + (loaded ? 'loaded' : '') + '">' +
    '<div class="corpus-head"><div class="cicon">' + ic('book') + '</div>' +
    '<div style="flex:1;min-width:0"><div class="corpus-name">' + esc(a.name) + '</div>' +
    '<div class="corpus-meta"><span class="tag">' + esc(a.lang) + '</span>' +
    (isGh ? '<span class="tag">' + humanSize(a.size) + '</span>' : '<span class="tag">upload</span>') +
    '</div></div></div>' +
    '<div class="corpus-body">' + (loaded ? 'Tersimpan: ' + fmt(loaded.lines.length) + ' baris' : 'Belum dimuat') + '</div>' +
    '<div class="corpus-actions">' +
    (loaded ? '<button class="btn-ghost" data-act="remove" data-id="' + esc(id) + '">' + ic('trash') + ' Hapus</button>'
            : (isGh ? '<button class="btn-primary" data-act="load" data-id="' + esc(id) + '">' + ic('download') + ' Load</button>' : '')) +
    '</div></div>';
}

async function loadTplAssetById(id, btnEl) {
  const a = tplAssets.find(x => 'gh:' + x.name === id);
  if (!a) return;
  if (btnEl) { btnEl.disabled = true; btnEl.innerHTML = ic('spinner', 'spin') + ' Memuat…'; }
  logBox($('#tplLog'), 'Mengunduh ' + a.name + '…');
  try {
    const res = await fetch(a.url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = await res.arrayBuffer();
    const zipResults = await parseZipBuffer(new Uint8Array(buf));
    let lines = [];
    for (const z of zipResults) {
      for (const r of z.records) {
        if (typeof r === 'string') lines.push(r);
        else if (typeof r === 'object') {
          ['text','template','line','content'].forEach(k => { if (typeof r[k] === 'string') lines.push(r[k]); });
        }
      }
    }
    lines = [...new Set(lines.map(s => s.trim()).filter(Boolean))];
    await TplLib.add({ id, name: a.name, lang: a.lang, source: 'github', addedAt: Date.now(), lines });
    logBox($('#tplLog'), '✓ ' + fmt(lines.length) + ' baris tersimpan dari ' + a.name);
    await refreshTplStats();
    renderTplStoredGrid();
  } catch (e) {
    logBox($('#tplLog'), '✗ Gagal: ' + e.message);
    if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = ic('download') + ' Load'; }
  }
}

/* ===== Statistics UI ===== */
async function refreshMemStats() {
  $('#memTotal').textContent = fmt(FP.size);
  $('#memSources').textContent = fmt(FP.sourceCount);
  const size = await DB.estimateSize();
  $('#memSize').textContent = humanSize(size);
  const badge = $('#memBadge');
  if (FP.isSessionOnly) { badge.textContent = 'sesi saja'; badge.className = 'badge warn'; }
  else { badge.textContent = 'tersimpan'; badge.className = 'badge ok'; }
}
async function refreshCorpusStats() {
  $('#cTotal').textContent = fmt(Corpus.all().length);
  $('#cTexts').textContent = fmt(Corpus.totalTexts());
  $('#cLangs').textContent = fmt(Corpus.langs().size);
}
async function refreshTplStats() {
  $('#tTotal').textContent = fmt(TplLib.all().length);
  $('#tLines').textContent = fmt(TplLib.totalLines());
  $('#tLangs').textContent = fmt(TplLib.langs().size);
  $('#tplBadge').textContent = fmt(TplLib.getActive().length) + ' aktif';
  $('#tplBadge').className = 'badge' + (TplLib.getActive().length ? ' ok' : '');
}

/* ===== Upload handlers ===== */
let uploadCount = 0;
$('#uploadInput').addEventListener('change', async e => {
  const files = [...e.target.files];
  if (!files.length) return;
  e.target.value = '';
  let totalNew = 0, totalDup = 0;
  const pending = [];
  for (const f of files) {
    uploadCount++;
    $('#memUploads').textContent = fmt(uploadCount);
    logBox($('#uploadLog'), 'Input: ' + f.name + ' (' + humanSize(f.size) + ')');
    try {
      let records = [];
      const low = f.name.toLowerCase();
      if (low.endsWith('.zip')) {
        const buf = await f.arrayBuffer();
        const zr = await parseZipBuffer(new Uint8Array(buf));
        for (const z of zr) records = records.concat(z.records);
      } else records = parseJsonOrJsonl(await f.text());
      let newCount = 0, dupCount = 0;
      const src = f.name, now = Date.now();
      for (let i = 0; i < records.length; i++) {
        const fp = fingerprintRecord(records[i]);
        fp.src = src; fp.ts = now;
        if (FP.addToMemory(fp)) { newCount++; pending.push({ exact: fp.exact, sh1: fp.sh1, sh2: fp.sh2, src, ts: now }); }
        else dupCount++;
        if ((i + 1) % 5000 === 0) await yieldUI();
      }
      totalNew += newCount; totalDup += dupCount;
      logBox($('#uploadLog'), '→ ' + fmt(records.length) + ' record • ' + fmt(newCount) + ' baru • ' + fmt(dupCount) + ' dup');
      await refreshMemStats();
    } catch (err) { logBox($('#uploadLog'), '✗ Gagal: ' + err.message); }
  }
  if (pending.length) { try { await FP.commitBatch(pending); logBox($('#uploadLog'), 'Tersimpan.'); } catch {} }
  await refreshMemStats();
});

$('#clearMemBtn').addEventListener('click', async () => {
  if (!confirm('Hapus semua ' + fmt(FP.size) + ' fingerprint?')) return;
  await FP.clear();
  await refreshMemStats();
  logBox($('#uploadLog'), 'Memori dibersihkan.');
});

/* ===== Corpus manual upload (multi-file) ===== */
$('#corpusUpload').addEventListener('change', async e => {
  const files = [...e.target.files];
  if (!files.length) return;
  e.target.value = '';
  const defaultLang = $('#corpusUploadLang').value;
  for (const f of files) {
    const low = f.name.toLowerCase();
    logBox($('#corpusLog'), 'Upload: ' + f.name + ' (' + humanSize(f.size) + ')');
    try {
      let records = [], lang = defaultLang;
      if (low.endsWith('.zip')) {
        const buf = await f.arrayBuffer();
        const zr = await parseZipBuffer(new Uint8Array(buf));
        for (const z of zr) { const lm = z.name.match(/corpus-([a-z]{2,5})-/i); if (lm) lang = lm[1].toLowerCase(); records = records.concat(z.records); }
      } else if (low.endsWith('.json') || low.endsWith('.jsonl')) {
        records = parseJsonOrJsonl(await f.text());
        const lm = f.name.match(/corpus-([a-z]{2,5})-/i); if (lm) lang = lm[1].toLowerCase();
      } else {
        records = (await f.text()).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      }
      let texts = extractTexts(records);
      texts = texts.flatMap(t => t.length > 1500 ? splitTextToSentences(t) : [t]);
      const id = 'up:' + f.name + ':' + Date.now();
      await Corpus.add({ id, name: f.name, lang, source: 'upload', addedAt: Date.now(), texts });
      logBox($('#corpusLog'), '✓ ' + fmt(texts.length) + ' teks (lang=' + lang + ')');
    } catch (err) { logBox($('#corpusLog'), '✗ Gagal: ' + err.message); }
  }
  await refreshCorpusStats();
  renderCorpusStoredGrid();
});

$('#clearAllCorpusBtn').addEventListener('click', async () => {
  if (!confirm('Hapus semua corpus dari perangkat?')) return;
  await Corpus.clearAll();
  await refreshCorpusStats();
  renderCorpusStoredGrid();
});

/* ===== Template manual upload (multi-file) ===== */
$('#tplUpload').addEventListener('change', async e => {
  const files = [...e.target.files];
  if (!files.length) return;
  e.target.value = '';
  const defaultLang = $('#tplUploadLang').value;
  for (const f of files) {
    const low = f.name.toLowerCase();
    logBox($('#tplLog'), 'Upload: ' + f.name + ' (' + humanSize(f.size) + ')');
    try {
      let lines = [], lang = defaultLang;
      if (low.endsWith('.zip')) {
        const buf = await f.arrayBuffer();
        const zr = await parseZipBuffer(new Uint8Array(buf));
        for (const z of zr) {
          const lm = z.name.match(/template-([a-z]{2,5})-/i); if (lm) lang = lm[1].toLowerCase();
          for (const r of z.records) {
            if (typeof r === 'string') lines.push(r);
            else if (typeof r === 'object') ['text','template','line','content'].forEach(k => { if (typeof r[k] === 'string') lines.push(r[k]); });
          }
        }
      } else if (low.endsWith('.json') || low.endsWith('.jsonl')) {
        const recs = parseJsonOrJsonl(await f.text());
        for (const r of recs) {
          if (typeof r === 'string') lines.push(r);
          else if (typeof r === 'object') ['text','template','line','content'].forEach(k => { if (typeof r[k] === 'string') lines.push(r[k]); });
        }
        const lm = f.name.match(/template-([a-z]{2,5})-/i); if (lm) lang = lm[1].toLowerCase();
      } else {
        lines = (await f.text()).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      }
      lines = [...new Set(lines.map(s => s.trim()).filter(Boolean))];
      if (!lines.length) continue;
      const id = 'up:' + f.name + ':' + Date.now();
      await TplLib.add({ id, name: f.name, lang, source: 'upload', addedAt: Date.now(), lines });
      logBox($('#tplLog'), '✓ ' + fmt(lines.length) + ' baris (lang=' + lang + ')');
    } catch (err) { logBox($('#tplLog'), '✗ Gagal: ' + err.message); }
  }
  await refreshTplStats();
  renderTplStoredGrid();
});

$('#clearAllTplBtn').addEventListener('click', async () => {
  if (!confirm('Hapus semua template dari perangkat?')) return;
  await TplLib.clearAll();
  $('#customTemplates').value = '';
  await refreshTplStats();
  renderTplStoredGrid();
});

/* ===== Template custom textarea ===== */
$('#applyTemplatesBtn').addEventListener('click', async () => {
  const lines = $('#customTemplates').value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (!lines.length) { alert('Tidak ada baris template untuk disimpan.'); return; }
  await TplLib.addManualLines(lines, 'all');
  await refreshTplStats();
  renderTplStoredGrid();
  alert('Tersimpan. Total ' + TplLib.getActive().length + ' template aktif.');
});
$('#templateUpload').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  e.target.value = '';
  try {
    const text = await f.text();
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const cur = $('#customTemplates').value;
    $('#customTemplates').value = (cur ? cur + '\n' : '') + lines.join('\n');
    alert('Dimuat ' + lines.length + ' baris. Klik "Simpan & Aktifkan" untuk menerapkan.');
  } catch (err) { alert('Gagal membaca: ' + err.message); }
});
$('#clearTemplatesBtn').addEventListener('click', async () => {
  if (!confirm('Kosongkan template manual?')) return;
  $('#customTemplates').value = '';
  await TplLib.clearManual();
  await refreshTplStats();
  renderTplStoredGrid();
});

/* ===== Load All buttons ===== */
$('#refreshCorpusBtn').addEventListener('click', () => { corpusFetched = false; fetchCorpusReleases(); });
$('#loadAllCorpusBtn').addEventListener('click', async () => {
  if (!corpusAssets.length) { alert('Belum ada daftar release. Klik Refresh dulu.'); return; }
  const existing = new Set(Corpus.all().map(c => c.id));
  const toLoad = corpusAssets.filter(a => !existing.has('gh:' + a.name));
  if (!toLoad.length) { alert('Semua corpus sudah dimuat.'); return; }
  if (!confirm('Memuat ' + toLoad.length + ' corpus. Lanjutkan?')) return;
  const btn = $('#loadAllCorpusBtn');
  btn.disabled = true;
  for (let i = 0; i < toLoad.length; i++) {
    btn.innerHTML = ic('spinner', 'spin') + ' (' + (i + 1) + '/' + toLoad.length + ')';
    await loadCorpusAssetById('gh:' + toLoad[i].name, null);
    await yieldUI();
  }
  btn.disabled = false;
  btn.innerHTML = ic('download') + ' Load Semua';
});

$('#refreshTplBtn').addEventListener('click', () => { tplFetched = false; fetchTemplateReleases(); });
$('#loadAllTplBtn').addEventListener('click', async () => {
  if (!tplAssets.length) { alert('Belum ada daftar release. Klik Refresh dulu.'); return; }
  const existing = new Set(TplLib.all().map(t => t.id));
  const toLoad = tplAssets.filter(a => !existing.has('gh:' + a.name));
  if (!toLoad.length) { alert('Semua template sudah dimuat.'); return; }
  if (!confirm('Memuat ' + toLoad.length + ' template. Lanjutkan?')) return;
  const btn = $('#loadAllTplBtn');
  btn.disabled = true;
  for (let i = 0; i < toLoad.length; i++) {
    btn.innerHTML = ic('spinner', 'spin') + ' (' + (i + 1) + '/' + toLoad.length + ')';
    await loadTplAssetById('gh:' + toLoad[i].name, null);
    await yieldUI();
  }
  btn.disabled = false;
  btn.innerHTML = ic('download') + ' Load Semua';
});

/* ===== Mode switch ===== */
let outputMode = 'fields';
$$('.mode-switch button').forEach(btn => {
  btn.addEventListener('click', () => {
    outputMode = btn.dataset.mode;
    $$('.mode-switch button').forEach(b => b.classList.toggle('active', b === btn));
    $('#labelConfig').hidden = outputMode !== 'label';
    $('#fieldsCard').hidden = outputMode !== 'fields';
  });
});

/* ===== Preset buttons ===== */
$$('.presets button').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = btn.dataset.preset;
    fieldsEl.innerHTML = '';
    if (p === 'clear') { addFieldRow(); return; }
    (PRESETS[p] || []).forEach(([n, t, tp]) => addFieldRow(n, t, tp));
  });
});

/* ===== Read fields ===== */
function readFields() {
  return $$('.field-row').map(row => ({
    name: row.querySelector('.f-name').value.trim(),
    type: row.querySelector('.f-type').value,
    template: row.querySelector('.f-tpl').value.trim()
  })).filter(f => f.name);
}

/* ===== Generate ===== */
function setProgress(pct, text) { $('#bar').style.width = Math.min(100, pct) + '%'; if (text) $('#status').textContent = text; }
const estimateTokens = str => Math.ceil(str.length / 4);

let lastResult = null, generating = false;

async function tryGenerateUnique(fields, cfg, startIndex) {
  let best = null, bestDist = -1;
  for (let attempt = 0; attempt < cfg.maxRetry; attempt++) {
    const rec = makeRecord(fields, cfg, startIndex + attempt);
    const q = recordQuality(rec);
    if (q < cfg.minUniq) continue;
    const fp = fingerprintRecord(rec);
    const chk = FP.check(fp, cfg.nearDist);
    if (!chk.exact && chk.dist > cfg.nearDist) return { rec, fp, quality: q, dup: false };
    if (chk.dist > bestDist) { bestDist = chk.dist; best = { rec, fp, quality: q, dup: true }; }
  }
  if (cfg.onFail === 'accept' && best) return best;
  return null;
}

async function generateDataset() {
  if (generating) return;
  SOURCE_MODE = $('#sourceMode').value;

  const cfg = {
    topic: $('#topic').value, lang: $('#lang').value,
    tokens: Math.max(100, parseInt($('#tokens').value) || 10000),
    fileCount: Math.max(1, Math.min(200, parseInt($('#fileCount').value) || 1)),
    format: $('#format').value,
    prefix: ($('#prefix').value.trim() || 'dataset').replace(/[^a-zA-Z0-9_\-]/g, '_'),
    nearDist: Math.max(0, parseInt($('#nearDist').value) || 4),
    minUniq: Math.max(0.1, Math.min(1, parseFloat($('#minUniq').value) || 0.55)),
    maxRetry: Math.max(1, Math.min(100, parseInt($('#maxRetry').value) || 15)),
    onFail: $('#onFail').value,
    total: 0
  };

  if (SOURCE_MODE === 'corpus' && !Corpus.totalTexts()) {
    if (!confirm('Belum ada corpus. Lanjutkan?')) return;
  }

  generating = true;
  $('#generateBtn').disabled = true;
  $('#downloadBtn').disabled = true;
  $('#stats').style.display = 'none';
  $('#recBadge').textContent = 'memproses…';
  $('#preview').textContent = 'Sedang membuat dataset…';
  setProgress(0, 'Memulai…');
  await yieldUI();

  try {
    let allFiles = [];
    let totalRecords = 0, totalTokens = 0, totalDup = 0, totalQuality = 0, qualitySamples = 0;

    if (outputMode === 'label') {
      const labelText = $('#labelTemplate').value.trim();
      const tplObj = parseLabelTemplate(labelText);
      if (!tplObj) { alert('Template label tidak valid. Contoh: {"text":""}'); return; }
      const quantity = Math.max(1, Math.min(1000000, parseInt($('#labelQuantity').value) || 100));
      cfg.total = quantity;
      const perFile = Math.ceil(quantity / cfg.fileCount);
      let idx = 0;
      for (let fi = 0; fi < cfg.fileCount && idx < quantity; fi++) {
        const recs = [];
        let fileTokens = 0, guard = 0;
        const cap = Math.min(perFile, quantity - idx);
        while (recs.length < cap && guard < cap * 3) {
          const lang = cfg.lang === 'mix' ? (Math.random() < 0.5 ? 'id' : 'en') : cfg.lang;
          const rec = fillLabelTemplate(tplObj, cfg, idx, lang);
          const str = JSON.stringify(rec);
          const q = recordQuality(rec);
          const fp = fingerprintRecord(rec);
          const chk = FP.check(fp, cfg.nearDist);
          if (!chk.exact && chk.dist > cfg.nearDist) {
            if (q < cfg.minUniq) { guard++; continue; }
            fp.src = 'generated:' + cfg.prefix; fp.ts = Date.now();
            FP.addToMemory(fp);
            fileTokens += estimateTokens(str);
            recs.push(rec);
            totalQuality += q; qualitySamples++;
            idx++;
          } else {
            totalDup++;
            guard++;
            if (cfg.onFail === 'accept') {
              fileTokens += estimateTokens(str);
              recs.push(rec);
              totalQuality += q; qualitySamples++;
              idx++;
            }
          }
          if (guard % 50 === 0) { setProgress(((idx / quantity) * 100), 'Label mode • ' + fmt(idx) + '/' + fmt(quantity)); await yieldUI(); }
        }
        allFiles.push({ records: recs, tokens: fileTokens });
        totalRecords += recs.length; totalTokens += fileTokens;
        setProgress(((idx / quantity) * 100), 'File ' + (fi + 1) + '/' + cfg.fileCount + ' • ' + fmt(recs.length) + ' record');
        await yieldUI();
      }
    } else {
      const fields = readFields();
      if (!fields.length) { alert('Tambahkan minimal 1 kolom.'); generating = false; $('#generateBtn').disabled = false; return; }
      const names = fields.map(f => f.name);
      const dupes = names.filter((n, i) => names.indexOf(n) !== i);
      if (dupes.length && !confirm('Nama kolom duplikat: ' + [...new Set(dupes)].join(', ') + '. Lanjutkan?')) { generating = false; $('#generateBtn').disabled = false; return; }
      if (cfg.tokens > 2000000 && !confirm('Target token besar (>2jt). Lanjutkan?')) { generating = false; $('#generateBtn').disabled = false; return; }

      const perFile = cfg.tokens / cfg.fileCount;
      let globalIndex = 0;
      for (let fi = 0; fi < cfg.fileCount; fi++) {
        const records = [];
        let fileTokens = 0, guard = 0;
        while (fileTokens < perFile && guard < 300000) {
          const res = await tryGenerateUnique(fields, cfg, globalIndex);
          if (res) {
            if (res.dup) totalDup++;
            const str = JSON.stringify(res.rec);
            fileTokens += estimateTokens(str);
            records.push(res.rec);
            totalQuality += res.quality; qualitySamples++;
            res.fp.src = 'generated:' + cfg.prefix; res.fp.ts = Date.now();
            FP.addToMemory(res.fp);
          } else totalDup++;
          globalIndex += cfg.maxRetry;
          guard++;
          if (guard % 50 === 0) {
            setProgress(((fi * perFile + fileTokens) / cfg.tokens) * 100, 'File ' + (fi + 1) + '/' + cfg.fileCount + ' • ' + fmt(records.length) + ' unik • ~' + fmt(fileTokens) + ' token');
            await yieldUI();
          }
        }
        allFiles.push({ records, tokens: fileTokens });
        totalRecords += records.length; totalTokens += fileTokens;
        setProgress(((fi + 1) / cfg.fileCount) * 100, 'File ' + (fi + 1) + '/' + cfg.fileCount + ' selesai');
        await yieldUI();
      }
      // Commit FPs
      try { await FP.commitBatch([]); } catch {}
    }

    // Build output files
    const ext = cfg.format === 'jsonl' ? 'jsonl' : 'json';
    const outFiles = allFiles.map((f, i) => {
      const content = cfg.format === 'jsonl' ? f.records.map(r => JSON.stringify(r)).join('\n') : JSON.stringify(f.records, null, 2);
      const name = cfg.fileCount === 1 ? cfg.prefix + '.' + ext : cfg.prefix + '_' + String(i + 1).padStart(3, '0') + '.' + ext;
      return { name, content, records: f.records.length, tokens: f.tokens };
    });

    lastResult = { files: outFiles, format: cfg.format, prefix: cfg.prefix };
    const totalSize = outFiles.reduce((a, f) => a + new Blob([f.content]).size, 0);
    const avgQuality = qualitySamples ? (totalQuality / qualitySamples) : 0;

    $('#sFiles').textContent = fmt(outFiles.length);
    $('#sRecords').textContent = fmt(totalRecords);
    $('#sTokens').textContent = fmt(totalTokens);
    $('#sSize').textContent = humanSize(totalSize);
    $('#sDup').textContent = fmt(totalDup);
    $('#sQuality').textContent = (avgQuality * 100).toFixed(1) + '%';
    $('#stats').style.display = 'grid';

    // Preview
    const firstBlob = new Blob([outFiles[0].content]);
    if (firstBlob.size > 3 * 1024 * 1024) {
      $('#preview').textContent = 'Preview tidak ditampilkan (> 3 MB). Silakan unduh untuk melihat isinya.';
    } else {
      const pvRecords = allFiles[0].records.slice(0, 3);
      let pv = cfg.format === 'jsonl' ? pvRecords.map(r => JSON.stringify(r, null, 2)).join('\n\n') : JSON.stringify(pvRecords, null, 2);
      if (pv.length > 6000) pv = pv.slice(0, 6000) + '\n\n… (dipotong)';
      $('#preview').textContent = pv || '(Tidak ada record yang bisa dibuat.)';
    }

    $('#downloadBtn').disabled = outFiles.length === 0;
    $('#recBadge').textContent = fmt(outFiles.length) + ' file siap';
    setProgress(100, 'Selesai • ' + fmt(totalRecords) + ' unik • ~' + fmt(totalTokens) + ' token • kualitas ' + (avgQuality * 100).toFixed(1) + '%');
    await refreshMemStats();
  } catch (err) {
    console.error(err);
    setProgress(0, 'Gagal: ' + err.message);
    $('#preview').textContent = 'Terjadi kesalahan: ' + err.message;
  } finally {
    generating = false;
    $('#generateBtn').disabled = false;
  }
}
$('#generateBtn').addEventListener('click', generateDataset);

/* ===== ZIP writer ===== */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[i] = c >>> 0; }
  return t;
})();
function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function createZip(entries) {
  const enc = new TextEncoder();
  const parts = [], central = [];
  let offset = 0;
  const now = new Date();
  const time = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  const date = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
  for (const e of entries) {
    const nameBytes = enc.encode(e.name);
    const dataBytes = enc.encode(e.content);
    const crc = crc32(dataBytes);
    const size = dataBytes.length;
    const lh = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(lh.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0, true);
    dv.setUint16(8, 0, true); dv.setUint16(10, time, true); dv.setUint16(12, date, true);
    dv.setUint32(14, crc, true); dv.setUint32(18, size, true); dv.setUint32(22, size, true);
    dv.setUint16(26, nameBytes.length, true); dv.setUint16(28, 0, true);
    lh.set(nameBytes, 30);
    parts.push(lh, dataBytes);
    const ch = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true); cv.setUint16(10, 0, true); cv.setUint16(12, time, true);
    cv.setUint16(14, date, true); cv.setUint32(16, crc, true); cv.setUint32(20, size, true);
    cv.setUint32(24, size, true); cv.setUint16(28, nameBytes.length, true); cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true); cv.setUint16(34, 0, true); cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
    ch.set(nameBytes, 46);
    central.push(ch);
    offset += lh.length + size;
  }
  let cdSize = 0; for (const c of central) cdSize += c.length;
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(4, 0, true); ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true); ev.setUint16(20, 0, true);
  return new Blob([...parts, ...central, eocd], { type: 'application/zip' });
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

$('#downloadBtn').addEventListener('click', async () => {
  if (!lastResult) return;
  const { files, format, prefix } = lastResult;
  try {
    if (files.length === 1) {
      const f = files[0];
      const mime = format === 'jsonl' ? 'application/x-ndjson' : 'application/json';
      saveBlob(new Blob([f.content], { type: mime + ';charset=utf-8' }), f.name);
    } else {
      $('#status').textContent = 'Mengemas ZIP…';
      await yieldUI();
      const zipBlob = createZip(files.map(f => ({ name: f.name, content: f.content })));
      saveBlob(zipBlob, prefix + '_' + files.length + 'files.zip');
    }
  } catch (err) { alert('Gagal mengunduh: ' + err.message); }
});

/* ===== Theme & Lang ===== */
$('#themeBtn').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});
$('#langBtn').addEventListener('click', () => applyLanguage(currentAppLang === 'id' ? 'en' : 'id'));

/* ===== Splash ===== */
(function splash() {
  setTimeout(() => {
    const s = $('#splash');
    if (s) { s.classList.add('hide'); setTimeout(() => s.remove(), 600); }
  }, 5000);
})();

/* ===== Init ===== */
(async function init() {
  // Theme + Lang
  const savedTheme = localStorage.getItem('axion_theme') || 'dark';
  applyTheme(savedTheme);
  applyLanguage(currentAppLang);

  // Add field rows / default preset
  addFieldRow('id', 'id', '');
  addFieldRow('text', 'template', '{corpus_paragraph}');
  addFieldRow('label', 'template', '{pick:positif|negatif|netral}');

  // Event: add field
  $('#addField').addEventListener('click', () => addFieldRow());

  // DB open
  await DB.open();
  if (DB.sessionOnly) $('#dbWarning').style.display = 'block';
  $('#memBadge').textContent = 'memuat…';

  // Load stores
  try { await FP.loadAll(); if (FP.size > 0) logBox($('#uploadLog'), 'Memuat ' + fmt(FP.size) + ' fingerprint dari IndexedDB.'); } catch {}
  try {
    await Corpus.load();
    await TplLib.load();
    const manual = TplLib.all().filter(t => t.source === 'manual');
    if (manual.length) {
      const allLines = manual.flatMap(t => t.lines || []);
      $('#customTemplates').value = allLines.join('\n');
    }
  } catch (e) { console.warn('Load store error:', e); }

  await refreshMemStats();
  await refreshCorpusStats();
  await refreshTplStats();

  // Pre-fetch releases for current view if visible
  renderCorpusStoredGrid();
  renderTplStoredGrid();
})();