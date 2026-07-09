const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new Database(dbPath);

// Initialize schema
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// Migration: Add lat/lon if not exists
try {
  db.exec('ALTER TABLE museums ADD COLUMN lat REAL;');
  db.exec('ALTER TABLE museums ADD COLUMN lon REAL;');
} catch (e) {
  // Column already exists
}

// Migration: Create quiz_stats table
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      museum_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {
  // Already exists
}

// Migration: Create site_translations table
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_translations (
      key TEXT PRIMARY KEY,
      uz TEXT,
      ru TEXT,
      en TEXT
    );
  `);
  
  const count = db.prepare('SELECT COUNT(*) AS cnt FROM site_translations').get().cnt;
  if (count === 0) {
    const defaultTranslationsPath = path.join(__dirname, 'default_translations.json');
    if (fs.existsSync(defaultTranslationsPath)) {
      const list = JSON.parse(fs.readFileSync(defaultTranslationsPath, 'utf-8'));
      const stmt = db.prepare('INSERT INTO site_translations (key, uz, ru, en) VALUES (?, ?, ?, ?)');
      const insertMany = db.transaction((items) => {
        for (const item of items) {
          stmt.run(item.key, item.uz, item.ru, item.en);
        }
      });
      insertMany(list);
    }
  }
} catch (e) {
  console.error('Failed to migrate/seed site_translations:', e);
}

module.exports = db;
