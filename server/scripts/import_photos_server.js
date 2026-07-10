// Server-side import: photos already in /uploads, insert DB rows from manifest
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '../src/db/database.sqlite');
const uploadsDir = path.join(__dirname, '../public/uploads');
const LANGS = ['uz', 'ru', 'en'];

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'import_manifest.json'), 'utf-8'));
const db = new Database(dbPath);

const deleted = db.prepare("DELETE FROM exhibits WHERE image_url LIKE '/uploads/%'").run();
console.log(`Cleared ${deleted.changes} old exhibit rows.`);

const insertStmt = db.prepare(
  'INSERT INTO exhibits (museum_id, lang, hall_num, title, desc, image_url) VALUES (?, ?, ?, ?, ?, ?)'
);

const insertAll = db.transaction(() => {
  let total = 0, missing = 0;
  for (const entry of manifest) {
    if (!fs.existsSync(path.join(uploadsDir, entry.filename))) {
      console.warn(`  MISSING: ${entry.filename}`);
      missing++;
      continue;
    }
    const imageUrl = `/uploads/${entry.filename}`;
    for (const lang of LANGS) {
      insertStmt.run(entry.museum_id, lang, entry.hall_num, '', '', imageUrl);
    }
    total++;
  }
  if (missing) console.warn(`${missing} files missing from uploads!`);
  return total;
});

const count = insertAll();
console.log(`Done. ${count} photos × ${LANGS.length} langs = ${count * LANGS.length} rows inserted.`);
