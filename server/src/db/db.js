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

module.exports = db;
