const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new Database(dbPath);

// Initialize schema
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

module.exports = db;
