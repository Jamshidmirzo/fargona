import db from './db.js';
import { museums } from '../../../src/data/museums.js';
import fs from 'fs';
import path from 'path';

// Clean DB
db.exec('DELETE FROM exhibits;');
db.exec('DELETE FROM quizzes;');
db.exec('DELETE FROM events;');
db.exec('DELETE FROM museum_translations;');
db.exec('DELETE FROM museums;');

const insertMuseum = db.prepare('INSERT INTO museums (id, city, pos_x, pos_y, birth, death, established, hero_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const insertTranslation = db.prepare('INSERT INTO museum_translations (museum_id, lang, name, owner, role, lifespan, tagline, bio, address, founded, hours, entry, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const insertEvent = db.prepare('INSERT INTO events (museum_id, lang, year, text) VALUES (?, ?, ?, ?)');
const insertQuiz = db.prepare('INSERT INTO quizzes (museum_id, lang, question, options, answer) VALUES (?, ?, ?, ?, ?)');

for (const m of museums) {
  // Try to use a real image if it's Muqimiy
  let heroImage = null;
  if (m.id === 'muqimiy') heroImage = '/uploads/image12.png'; // Some nice image from the docx

  insertMuseum.run(m.id, m.city, m.pos.x, m.pos.y, m.birth, m.death, m.established, heroImage);

  for (const lang of ['uz', 'ru', 'en']) {
    const l = m[lang];
    if (!l) continue;

    insertTranslation.run(
      m.id, lang, l.name, l.owner, l.role, l.lifespan, l.tagline, l.bio,
      l.info?.address, l.info?.founded, l.info?.hours, l.info?.entry, l.info?.phone
    );

    for (const e of (l.events || [])) {
      insertEvent.run(m.id, lang, e.year, e.text);
    }

    for (const q of (l.quiz || [])) {
      insertQuiz.run(m.id, lang, q.q, JSON.stringify(q.options), q.a);
    }
  }
}

console.log('Database seeded successfully!');
