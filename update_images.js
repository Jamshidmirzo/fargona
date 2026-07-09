const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server/src/db/database.sqlite');
const db = new Database(dbPath);

const updates = [
  { id: 'uvaysi', img: '/uploads/museum_uvaysi.jpg' },
  { id: 'hamza', img: '/uploads/museum_hamza.jpg' },
  { id: 'haziniy', img: '/uploads/museum_haziniy.jpg' },
  { id: 'vohidov', img: '/uploads/museum_vohidov.jpg' },
  { id: 'zavqiy', img: '/uploads/museum_zavqiy.jpg' }
];

const stmt = db.prepare('UPDATE museums SET hero_image = ? WHERE id = ?');

for (const u of updates) {
  stmt.run(u.img, u.id);
  console.log(`Updated ${u.id}`);
}

console.log('Database updated successfully!');
