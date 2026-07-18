const db = require('../db/db');

exports.getAllMuseums = (req, res) => {
  try {
    const { lang = 'uz' } = req.query;
    const stmt = db.prepare(`
      SELECT m.id, m.city, m.pos_x, m.pos_y, m.birth, m.death, m.established, m.hero_image, m.lat, m.lon,
             t.name, t.owner, t.role, t.lifespan, t.tagline, t.bio, t.museum_bio,
             t.address, t.founded, t.hours, t.entry, t.phone
      FROM museums m
      LEFT JOIN museum_translations t ON m.id = t.museum_id AND t.lang = ?
      ORDER BY m.sort_order
    `);
    const museums = stmt.all(lang);
    
    // Fetch all events for the language and group by museum_id
    const eventsStmt = db.prepare('SELECT id, museum_id, year, text FROM events WHERE lang = ? ORDER BY CAST(year AS INTEGER), id');
    const allEvents = eventsStmt.all(lang);

    const eventsByMuseum = {};
    allEvents.forEach(e => {
      if (!eventsByMuseum[e.museum_id]) eventsByMuseum[e.museum_id] = [];
      eventsByMuseum[e.museum_id].push({ id: e.id, year: e.year, text: e.text });
    });
    
    // Fetch all quizzes for the language and group by museum_id
    const quizzesStmt = db.prepare('SELECT id, museum_id, question AS q, options, answer AS a FROM quizzes WHERE lang = ?');
    const allQuizzes = quizzesStmt.all(lang);
    
    const quizzesByMuseum = {};
    allQuizzes.forEach(q => {
      if (!quizzesByMuseum[q.museum_id]) quizzesByMuseum[q.museum_id] = [];
      quizzesByMuseum[q.museum_id].push({ id: q.id, q: q.q, options: JSON.parse(q.options), a: q.a });
    });

    // Fetch all exhibits for the language and group by museum_id
    const exhibitsStmt = db.prepare('SELECT id, museum_id, hall_num, title, desc AS description, image_url AS image FROM exhibits WHERE lang = ?');
    const allExhibits = exhibitsStmt.all(lang);

    const exhibitsByMuseum = {};
    allExhibits.forEach(ex => {
      if (!exhibitsByMuseum[ex.museum_id]) exhibitsByMuseum[ex.museum_id] = [];
      exhibitsByMuseum[ex.museum_id].push({
        id: ex.id,
        hall_num: ex.hall_num,
        title: ex.title,
        description: ex.description,
        image: ex.image
      });
    });
    
    // Group back into objects similar to frontend expectations
    const result = museums.map(m => ({
      id: m.id,
      city: m.city,
      pos: { x: m.pos_x, y: m.pos_y },
      coords: (m.lat !== null && m.lon !== null) ? [m.lat, m.lon] : null,
      birth: m.birth,
      death: m.death,
      established: m.established,
      heroImage: m.hero_image,
      [lang]: {
        name: m.name,
        owner: m.owner,
        role: m.role,
        lifespan: m.lifespan,
        tagline: m.tagline,
        bio: m.bio,
        museum_bio: m.museum_bio,
        info: {
          address: m.address,
          founded: m.founded,
          hours: m.hours,
          entry: m.entry,
          phone: m.phone
        },
        events: eventsByMuseum[m.id] || [],
        quiz: quizzesByMuseum[m.id] || [],
        exhibits: exhibitsByMuseum[m.id] || []
      }
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch museums' });
  }
};

exports.getMuseumById = (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'uz' } = req.query;
    
    const stmt = db.prepare(`
      SELECT m.id, m.city, m.pos_x, m.pos_y, m.birth, m.death, m.established, m.hero_image, m.lat, m.lon,
             t.name, t.owner, t.role, t.lifespan, t.tagline, t.bio, t.museum_bio,
             t.address, t.founded, t.hours, t.entry, t.phone
      FROM museums m
      LEFT JOIN museum_translations t ON m.id = t.museum_id AND t.lang = ?
      WHERE m.id = ?
    `);
    const m = stmt.get(lang, id);
    if (!m) return res.status(404).json({ error: 'Museum not found' });
    
    const eventsStmt = db.prepare('SELECT id, year, text FROM events WHERE museum_id = ? AND lang = ? ORDER BY CAST(year AS INTEGER), id');
    const events = eventsStmt.all(id, lang);
    
    const quizzesStmt = db.prepare('SELECT id, question AS q, options, answer AS a FROM quizzes WHERE museum_id = ? AND lang = ?');
    const allQuizzes = quizzesStmt.all(id, lang);
    const quiz = allQuizzes.map(q => ({ id: q.id, q: q.q, options: JSON.parse(q.options), a: q.a }));

    const exhibitsStmt = db.prepare('SELECT id, hall_num, title, desc AS description, image_url AS image FROM exhibits WHERE museum_id = ? AND lang = ? ORDER BY hall_num, id');
    const exhibits = exhibitsStmt.all(id, lang);
    
    const result = {
      id: m.id,
      city: m.city,
      pos: { x: m.pos_x, y: m.pos_y },
      coords: (m.lat !== null && m.lon !== null) ? [m.lat, m.lon] : null,
      birth: m.birth,
      death: m.death,
      established: m.established,
      heroImage: m.hero_image,
      [lang]: {
        name: m.name,
        owner: m.owner,
        role: m.role,
        lifespan: m.lifespan,
        tagline: m.tagline,
        bio: m.bio,
        museum_bio: m.museum_bio,
        info: {
          address: m.address,
          founded: m.founded,
          hours: m.hours,
          entry: m.entry,
          phone: m.phone
        },
        events: events,
        quiz: quiz,
        exhibits: exhibits
      }
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch museum details' });
  }
};

exports.getMuseumQuiz = (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'uz' } = req.query;
    
    const stmt = db.prepare('SELECT id, question AS q, options, answer AS a FROM quizzes WHERE museum_id = ? AND lang = ?');
    const rows = stmt.all(id, lang);
    
    const quiz = rows.map(r => ({
      id: r.id,
      q: r.q,
      options: JSON.parse(r.options),
      a: r.a
    }));
    
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch museum quiz' });
  }
};

exports.updateMuseum = (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const lat = body.lat !== undefined && body.lat !== '' ? parseFloat(body.lat) : null;
    const lon = body.lon !== undefined && body.lon !== '' ? parseFloat(body.lon) : null;
    const finalHeroImage = body.heroImage !== undefined ? body.heroImage : body.hero_image;

    db.prepare(`UPDATE museums SET city=?, birth=?, death=?, established=?, lat=?, lon=?, hero_image=? WHERE id=?`)
      .run(body.city || 'kokand', body.birth || '', body.death || '', body.established || '', lat, lon, finalHeroImage || null, id);

    // Multi-lang mode when name_uz is present in body; single-lang fallback otherwise
    const multiLang = body.name_uz !== undefined;
    const langs = multiLang ? ['uz', 'ru', 'en'] : [req.query.lang || 'uz'];

    const checkStmt = db.prepare('SELECT 1 FROM museum_translations WHERE museum_id=? AND lang=?');
    const updateStmt = db.prepare(`UPDATE museum_translations SET name=?,owner=?,role=?,lifespan=?,tagline=?,bio=?,museum_bio=?,address=?,founded=?,hours=?,entry=?,phone=? WHERE museum_id=? AND lang=?`);
    const insertStmt = db.prepare(`INSERT INTO museum_translations (museum_id,lang,name,owner,role,lifespan,tagline,bio,museum_bio,address,founded,hours,entry,phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

    db.transaction(() => {
      for (const l of langs) {
        const sfx = multiLang ? `_${l}` : '';
        const vals = [
          body[`name${sfx}`] || '', body[`owner${sfx}`] || '', body[`role${sfx}`] || '',
          body[`lifespan${sfx}`] || '', body[`tagline${sfx}`] || '', body[`bio${sfx}`] || '',
          body[`museum_bio${sfx}`] || '',
          body[`address${sfx}`] || '', body[`founded${sfx}`] || '', body[`hours${sfx}`] || '',
          body[`entry${sfx}`] || '',
          // phone is shared (not language-specific), fall back to body.phone
          body[`phone${sfx}`] || body.phone || ''
        ];
        if (checkStmt.get(id, l)) {
          updateStmt.run(...vals, id, l);
        } else {
          insertStmt.run(id, l, ...vals);
        }
      }
    })();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update museum data' });
  }
};

exports.createMuseum = (req, res) => {
  try {
    const { 
      id, city, birth, death, established, pos_x, pos_y, lat, lon, heroImage, hero_image,
      name, owner, role, lifespan, tagline, bio, address, founded, hours, entry, phone 
    } = req.body;
    
    const finalId = id || 'museum_' + Date.now();
    const finalCity = city || 'kokand';
    const finalHeroImage = heroImage !== undefined ? heroImage : hero_image;
    
    const stmt1 = db.prepare('INSERT INTO museums (id, city, pos_x, pos_y, birth, death, established, lat, lon, hero_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt1.run(
      finalId, 
      finalCity, 
      pos_x !== undefined && pos_x !== '' ? parseFloat(pos_x) : null,
      pos_y !== undefined && pos_y !== '' ? parseFloat(pos_y) : null,
      birth || '', 
      death || '', 
      established || '',
      lat !== undefined && lat !== '' ? parseFloat(lat) : null,
      lon !== undefined && lon !== '' ? parseFloat(lon) : null,
      finalHeroImage || null
    );

    const stmt2 = db.prepare(`
      INSERT INTO museum_translations 
      (museum_id, lang, name, owner, role, lifespan, tagline, bio, address, founded, hours, entry, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Create translations for all supported languages
    const currentLang = req.query.lang || 'uz';
    ['uz', 'ru', 'en'].forEach(l => {
      if (l === currentLang) {
        stmt2.run(finalId, l, name || 'New Museum', owner || '', role || '', lifespan || '', tagline || '', bio || '', address || '', founded || '', hours || '', entry || '', phone || '');
      } else {
        stmt2.run(finalId, l, name || 'New Museum', '', '', '', '', '', '', '', '', '', '');
      }
    });

    res.json({ success: true, id: finalId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create museum' });
  }
};

exports.deleteMuseum = (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete dependent tables
    const deleteExhibits = db.prepare('DELETE FROM exhibits WHERE museum_id = ?');
    const deleteQuizzes = db.prepare('DELETE FROM quizzes WHERE museum_id = ?');
    const deleteEvents = db.prepare('DELETE FROM events WHERE museum_id = ?');
    const deleteTranslations = db.prepare('DELETE FROM museum_translations WHERE museum_id = ?');
    const deleteMuseumRecord = db.prepare('DELETE FROM museums WHERE id = ?');
    
    const transaction = db.transaction(() => {
      deleteExhibits.run(id);
      deleteQuizzes.run(id);
      deleteEvents.run(id);
      deleteTranslations.run(id);
      deleteMuseumRecord.run(id);
    });
    
    transaction();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete museum' });
  }
};

exports.createQuizQuestion = (req, res) => {
  try {
    const { id } = req.params; // museum_id
    const { lang = 'uz' } = req.query;
    const { question, options, answer } = req.body;
    
    const stmt = db.prepare('INSERT INTO quizzes (museum_id, lang, question, options, answer) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(id, lang, question, JSON.stringify(options), parseInt(answer, 10) || 0);
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create quiz question' });
  }
};

exports.deleteQuizQuestion = (req, res) => {
  try {
    const { quizId } = req.params;
    
    const stmt = db.prepare('DELETE FROM quizzes WHERE id = ?');
    stmt.run(quizId);
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete quiz question' });
  }
};

exports.createExhibit = (req, res) => {
  try {
    const { id } = req.params; // museum_id
    const { lang = 'uz' } = req.query;
    const { title, description, image } = req.body;

    // Fan out to all supported languages so the exhibit (and its photo) is
    // visible regardless of the viewer's UI language. Only the language the
    // admin actually filled in gets the title/description; other languages
    // start empty and can be translated later via the edit form.
    const insertStmt = db.prepare(
      'INSERT INTO exhibits (museum_id, lang, hall_num, title, desc, image_url) VALUES (?, ?, 1, ?, ?, ?)'
    );

    const langs = ['uz', 'ru', 'en'];
    const insertedIds = {};

    db.transaction(() => {
      for (const l of langs) {
        const isCurrent = l === lang;
        const result = insertStmt.run(
          id,
          l,
          title || '',
          isCurrent ? (description || '') : '',
          image || ''
        );
        insertedIds[l] = result.lastInsertRowid;
      }
    })();

    // Return the id for the language the admin is currently editing so the
    // frontend can immediately reference the new row for update/delete.
    res.json({ success: true, id: insertedIds[lang] || insertedIds.uz, ids: insertedIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create exhibit' });
  }
};

exports.deleteExhibit = (req, res) => {
  try {
    const { exhibitId } = req.params;
    
    const stmt = db.prepare('DELETE FROM exhibits WHERE id = ?');
    stmt.run(exhibitId);
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete exhibit' });
  }
};

exports.updateExhibit = (req, res) => {
  try {
    const { exhibitId } = req.params;
    const { title, description, image } = req.body;
    
    const stmt = db.prepare('UPDATE exhibits SET title = ?, desc = ?, image_url = ? WHERE id = ?');
    stmt.run(title || '', description || '', image || '', exhibitId);
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update exhibit' });
  }
};

// ── Life chronology (biography events) ──────────────────────────────────────
// Stored in the `events` table (museum_id, lang, year, text). Each admin
// action creates/updates/deletes a single row for a single language, so an
// entry may exist in one language and not another. Create does a fan-out to
// all languages by default to mirror the exhibit behavior.
exports.createChronologyEvent = (req, res) => {
  try {
    const { id } = req.params; // museum_id
    const { lang = 'uz' } = req.query;
    const { year, text } = req.body;

    if (!year && !text) {
      return res.status(400).json({ error: 'year or text is required' });
    }

    const insertStmt = db.prepare(
      'INSERT INTO events (museum_id, lang, year, text) VALUES (?, ?, ?, ?)'
    );

    const langs = ['uz', 'ru', 'en'];
    const insertedIds = {};

    db.transaction(() => {
      for (const l of langs) {
        const isCurrent = l === lang;
        const result = insertStmt.run(
          id,
          l,
          year || '',
          isCurrent ? (text || '') : ''
        );
        insertedIds[l] = result.lastInsertRowid;
      }
    })();

    res.json({ success: true, id: insertedIds[lang] || insertedIds.uz, ids: insertedIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create chronology event' });
  }
};

exports.updateChronologyEvent = (req, res) => {
  try {
    const { id, eventId } = req.params;
    const { year, text } = req.body;
    const stmt = db.prepare('UPDATE events SET year = ?, text = ? WHERE id = ? AND museum_id = ?');
    const result = stmt.run(year || '', text || '', eventId, id);
    if (result.changes === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update chronology event' });
  }
};

exports.deleteChronologyEvent = (req, res) => {
  try {
    const { id, eventId } = req.params;
    const stmt = db.prepare('DELETE FROM events WHERE id = ? AND museum_id = ?');
    const result = stmt.run(eventId, id);
    if (result.changes === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete chronology event' });
  }
};

exports.createQuizStat = (req, res) => {
  try {
    const { username, museum_id, score, total } = req.body;
    const stmt = db.prepare('INSERT INTO quiz_stats (username, museum_id, score, total) VALUES (?, ?, ?, ?)');
    stmt.run(username || 'Guest', museum_id, parseInt(score, 10) || 0, parseInt(total, 10) || 0);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save quiz stat' });
  }
};

exports.getQuizStats = (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, username, museum_id, score, total, completed_at FROM quiz_stats ORDER BY completed_at DESC LIMIT 50');
    const stats = stmt.all();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quiz stats' });
  }
};

exports.getSiteTranslations = (req, res) => {
  try {
    const rows = db.prepare('SELECT key, uz, ru, en FROM site_translations').all();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch site translations' });
  }
};

exports.updateSiteTranslations = (req, res) => {
  try {
    const updates = req.body;
    const stmt = db.prepare('UPDATE site_translations SET uz = ?, ru = ?, en = ? WHERE key = ?');
    const transaction = db.transaction((items) => {
      for (const item of items) {
        stmt.run(item.uz, item.ru, item.en, item.key);
      }
    });
    transaction(updates);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update site translations' });
  }
};

// News Handlers
exports.getMuseumNews = (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'uz' } = req.query;

    const stmt = db.prepare(`
      SELECT n.id, n.museum_id, n.image_url AS image, n.created_at,
             t.title, t.content
      FROM news n
      LEFT JOIN news_translations t ON n.id = t.news_id AND t.lang = ?
      WHERE n.museum_id = ?
      ORDER BY n.created_at DESC
    `);
    const news = stmt.all(lang, id);
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch museum news' });
  }
};

exports.createMuseumNews = (req, res) => {
  try {
    const { id } = req.params; // museum_id
    const { lang = 'uz' } = req.query;
    const { title, content, image } = req.body;

    const insertNews = db.prepare('INSERT INTO news (museum_id, image_url) VALUES (?, ?)');
    const insertTrans = db.prepare('INSERT INTO news_translations (news_id, lang, title, content) VALUES (?, ?, ?, ?)');

    const transaction = db.transaction(() => {
      const result = insertNews.run(id, image || null);
      const newsId = result.lastInsertRowid;
      
      // Seed translations for all supported languages
      ['uz', 'ru', 'en'].forEach(l => {
        if (l === lang) {
          insertTrans.run(newsId, l, title || 'New News', content || '');
        } else {
          insertTrans.run(newsId, l, title || 'New News', '');
        }
      });
      return newsId;
    });

    const newsId = transaction();
    res.json({ success: true, id: newsId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
};

exports.deleteMuseumNews = (req, res) => {
  try {
    const { newsId } = req.params;
    db.prepare('DELETE FROM news WHERE id = ?').run(newsId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete news article' });
  }
};

// Events Handlers
exports.getMuseumEvents = (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'uz' } = req.query;

    const stmt = db.prepare(`
      SELECT e.id, e.museum_id, e.image_url AS image, e.event_date AS date, e.event_time AS time, e.created_at,
             t.title, t.description
      FROM museum_events e
      LEFT JOIN museum_events_translations t ON e.id = t.event_id AND t.lang = ?
      WHERE e.museum_id = ?
      ORDER BY e.event_date ASC
    `);
    const events = stmt.all(lang, id);
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch museum events' });
  }
};

exports.createMuseumEvent = (req, res) => {
  try {
    const { id } = req.params; // museum_id
    const { lang = 'uz' } = req.query;
    const { title, description, date, time, image } = req.body;

    const insertEvent = db.prepare('INSERT INTO museum_events (museum_id, image_url, event_date, event_time) VALUES (?, ?, ?, ?)');
    const insertTrans = db.prepare('INSERT INTO museum_events_translations (event_id, lang, title, description) VALUES (?, ?, ?, ?)');

    const transaction = db.transaction(() => {
      const result = insertEvent.run(id, image || null, date || '', time || '');
      const eventId = result.lastInsertRowid;
      
      // Seed translations for all supported languages
      ['uz', 'ru', 'en'].forEach(l => {
        if (l === lang) {
          insertTrans.run(eventId, l, title || 'New Event', description || '');
        } else {
          insertTrans.run(eventId, l, title || 'New Event', '');
        }
      });
      return eventId;
    });

    const eventId = transaction();
    res.json({ success: true, id: eventId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

exports.deleteMuseumEvent = (req, res) => {
  try {
    const { eventId } = req.params;
    db.prepare('DELETE FROM museum_events WHERE id = ?').run(eventId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Global news across all museums
exports.getNewsById = (req, res) => {
  try {
    const { newsId } = req.params;
    const { lang = 'ru' } = req.query;
    const row = db.prepare(`
      SELECT n.id, n.museum_id, n.image_url AS image, n.created_at,
             nt.title, nt.content,
             mt.name AS museum_name
      FROM news n
      LEFT JOIN news_translations nt ON n.id = nt.news_id AND nt.lang = ?
      LEFT JOIN museum_translations mt ON n.museum_id = mt.museum_id AND mt.lang = ?
      WHERE n.id = ?
    `).get(lang, lang, newsId);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch news item' });
  }
};

exports.getEventById = (req, res) => {
  try {
    const { eventId } = req.params;
    const { lang = 'ru' } = req.query;
    const row = db.prepare(`
      SELECT e.id, e.museum_id, e.image_url AS image, e.event_date AS date, e.event_time AS time, e.created_at,
             et.title, et.description,
             mt.name AS museum_name
      FROM museum_events e
      LEFT JOIN museum_events_translations et ON e.id = et.event_id AND et.lang = ?
      LEFT JOIN museum_translations mt ON e.museum_id = mt.museum_id AND mt.lang = ?
      WHERE e.id = ?
    `).get(lang, lang, eventId);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

exports.getAllNews = (req, res) => {
  try {
    const { lang = 'uz' } = req.query;
    const stmt = db.prepare(`
      SELECT n.id, n.museum_id, n.image_url AS image, n.created_at,
             nt.title, nt.content,
             mt.name AS museum_name
      FROM news n
      LEFT JOIN news_translations nt ON n.id = nt.news_id AND nt.lang = ?
      LEFT JOIN museum_translations mt ON n.museum_id = mt.museum_id AND mt.lang = ?
      ORDER BY n.created_at DESC
    `);
    res.json(stmt.all(lang, lang));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

// Global events across all museums
exports.getAllEvents = (req, res) => {
  try {
    const { lang = 'uz' } = req.query;
    const stmt = db.prepare(`
      SELECT e.id, e.museum_id, e.image_url AS image, e.event_date AS date, e.event_time AS time, e.created_at,
             et.title, et.description,
             mt.name AS museum_name
      FROM museum_events e
      LEFT JOIN museum_events_translations et ON e.id = et.event_id AND et.lang = ?
      LEFT JOIN museum_translations mt ON e.museum_id = mt.museum_id AND mt.lang = ?
      ORDER BY e.event_date ASC
    `);
    res.json(stmt.all(lang, lang));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

exports.recordVisit = (req, res) => {
  try {
    db.prepare('INSERT INTO site_visits (visited_at) VALUES (CURRENT_TIMESTAMP)').run();
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to record visit' });
  }
};

exports.getVisitStats = (req, res) => {
  try {
    const days7 = db.prepare(`
      SELECT DATE(visited_at) AS date, COUNT(*) AS visits
      FROM site_visits
      WHERE DATE(visited_at) >= DATE('now', '-6 days')
      GROUP BY DATE(visited_at)
      ORDER BY date ASC
    `).all();
    const total = db.prepare('SELECT COUNT(*) AS cnt FROM site_visits').get().cnt;
    const today = db.prepare("SELECT COUNT(*) AS cnt FROM site_visits WHERE DATE(visited_at) = DATE('now')").get().cnt;
    res.json({ days7, total, today });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch visit stats' });
  }
};
