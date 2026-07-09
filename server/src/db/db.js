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

module.exports = db;
