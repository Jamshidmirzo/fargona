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

// Migration: Create auth and role-based tables
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('super_admin', 'museum_admin'))
    );
    CREATE TABLE IF NOT EXISTS admin_museums (
      admin_id INTEGER NOT NULL,
      museum_id TEXT NOT NULL,
      PRIMARY KEY (admin_id, museum_id),
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
      FOREIGN KEY (museum_id) REFERENCES museums(id) ON DELETE CASCADE
    );
  `);
  
  // Seed default super admin if no admins exist
  const count = db.prepare('SELECT COUNT(*) AS cnt FROM admins').get().cnt;
  if (count === 0) {
    const bcrypt = require('bcryptjs');
    const defaultHash = bcrypt.hashSync('superpassword', 10);
    db.prepare('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)')
      .run('superadmin', defaultHash, 'super_admin');
    console.log('Seeded default superadmin user.');
  }
} catch (e) {
  console.error('Failed to migrate/seed auth tables:', e);
}

// Migration: Create news & events tables
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      museum_id TEXT NOT NULL,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (museum_id) REFERENCES museums(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS news_translations (
      news_id INTEGER NOT NULL,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      PRIMARY KEY (news_id, lang),
      FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS museum_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      museum_id TEXT NOT NULL,
      image_url TEXT,
      event_date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (museum_id) REFERENCES museums(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS museum_events_translations (
      event_id INTEGER NOT NULL,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      PRIMARY KEY (event_id, lang),
      FOREIGN KEY (event_id) REFERENCES museum_events(id) ON DELETE CASCADE
    );
  `);
} catch (e) {
  console.error('Failed to migrate news & events tables:', e);
}

module.exports = db;
