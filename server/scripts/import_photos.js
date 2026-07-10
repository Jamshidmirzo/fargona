const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '../src/db/database.sqlite');
const uploadsDir = path.join(__dirname, '../public/uploads');
const PHOTO_ROOT = "/Users/user/Downloads/Музейлар буйича фото";

const LANGS = ['uz', 'ru', 'en'];
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const MAPPING = [
  // Marg'ilon
  { src: path.join(PHOTO_ROOT, "Marg'ilon muzeylari", 'E.Voxidov memorial muzeyi'), museum_id: 'vohidov_memorial', hall_num: 1 },
  { src: path.join(PHOTO_ROOT, "Marg'ilon muzeylari", 'E.Voxidov uy-muzeyi'), museum_id: 'vohidov_house', hall_num: 1 },
  { src: path.join(PHOTO_ROOT, "Marg'ilon muzeylari", 'Жаҳон Отин Увайсий уй музейи', '1 хона'), museum_id: 'uvaysi', hall_num: 1 },
  { src: path.join(PHOTO_ROOT, "Marg'ilon muzeylari", 'Жаҳон Отин Увайсий уй музейи', '2 хона'), museum_id: 'uvaysi', hall_num: 2 },
  // Qo'qon
  { src: path.join(PHOTO_ROOT, "Qo'qon muzeylari", 'X.Niyoziy uy-muzeyi'), museum_id: 'hamza', hall_num: 1 },
  { src: path.join(PHOTO_ROOT, "Qo'qon muzeylari", 'Xaziniy uy-muzeyi', '1-зал'), museum_id: 'haziniy', hall_num: 1 },
  { src: path.join(PHOTO_ROOT, "Qo'qon muzeylari", 'Xaziniy uy-muzeyi', '2-зал'), museum_id: 'haziniy', hall_num: 2 },
  { src: path.join(PHOTO_ROOT, "Qo'qon muzeylari", 'Мукимий хужра музейи', 'Muqimiy uy muzeyi'), museum_id: 'muqimiy', hall_num: 1 },
  { src: path.join(PHOTO_ROOT, "Qo'qon muzeylari", 'Мукимий хужра музейи', 'Zavqiy uy-muzeyi'), museum_id: 'zavqiy', hall_num: 1 },
  { src: path.join(PHOTO_ROOT, "Qo'qon muzeylari", 'Мукимий хужра музейи', 'Charxiy uy-muzeyi'), museum_id: 'muqimiy', hall_num: 2 },
];

const db = new Database(dbPath);

// Remove previously imported photos from exhibits
const deleted = db.prepare("DELETE FROM exhibits WHERE image_url LIKE '/uploads/%'").run();
console.log(`Cleared ${deleted.changes} old imported exhibit rows.`);

const insertStmt = db.prepare(
  'INSERT INTO exhibits (museum_id, lang, hall_num, title, desc, image_url) VALUES (?, ?, ?, ?, ?, ?)'
);

const insertAll = db.transaction(() => {
  let total = 0;
  for (const entry of MAPPING) {
    if (!fs.existsSync(entry.src)) {
      console.warn(`  MISSING folder: ${entry.src}`);
      continue;
    }
    const files = fs.readdirSync(entry.src)
      .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .sort();

    for (const filename of files) {
      const srcFile = path.join(entry.src, filename);
      // Sanitize filename: replace spaces with underscores
      const safeFilename = filename.replace(/\s+/g, '_');
      const destFile = path.join(uploadsDir, safeFilename);

      if (!fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
      }

      const imageUrl = `/uploads/${safeFilename}`;
      for (const lang of LANGS) {
        insertStmt.run(entry.museum_id, lang, entry.hall_num, '', '', imageUrl);
      }
      total++;
    }
    console.log(`  ${entry.museum_id} hall ${entry.hall_num}: ${files.length} photos from ${path.basename(entry.src)}`);
  }
  return total;
});

const count = insertAll();
console.log(`\nDone. Imported ${count} photos × ${LANGS.length} langs = ${count * LANGS.length} exhibit rows.`);
