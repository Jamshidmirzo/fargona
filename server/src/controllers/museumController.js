const db = require('../db/db');

exports.getAllMuseums = (req, res) => {
  try {
    const { lang = 'uz' } = req.query;
    const stmt = db.prepare(`
      SELECT m.id, m.city, m.pos_x, m.pos_y, m.birth, m.death, m.established, m.hero_image, m.lat, m.lon,
             t.name, t.owner, t.role, t.lifespan, t.tagline, t.bio,
             t.address, t.founded, t.hours, t.entry, t.phone
      FROM museums m
      LEFT JOIN museum_translations t ON m.id = t.museum_id AND t.lang = ?
    `);
    const museums = stmt.all(lang);
    
    // Fetch all events for the language and group by museum_id
    const eventsStmt = db.prepare('SELECT museum_id, year, text FROM events WHERE lang = ?');
    const allEvents = eventsStmt.all(lang);
    
    const eventsByMuseum = {};
    allEvents.forEach(e => {
      if (!eventsByMuseum[e.museum_id]) eventsByMuseum[e.museum_id] = [];
      eventsByMuseum[e.museum_id].push({ year: e.year, text: e.text });
    });
    
    // Fetch all quizzes for the language and group by museum_id
    const quizzesStmt = db.prepare('SELECT id, museum_id, question AS q, options, answer AS a FROM quizzes WHERE lang = ?');
    const allQuizzes = quizzesStmt.all(lang);
    
    const quizzesByMuseum = {};
    allQuizzes.forEach(q => {
      if (!quizzesByMuseum[q.museum_id]) quizzesByMuseum[q.museum_id] = [];
      quizzesByMuseum[q.museum_id].push({ id: q.id, q: q.q, options: JSON.parse(q.options), a: q.a });
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
        info: {
          address: m.address,
          founded: m.founded,
          hours: m.hours,
          entry: m.entry,
          phone: m.phone
        },
        events: eventsByMuseum[m.id] || [],
        quiz: quizzesByMuseum[m.id] || []
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
             t.name, t.owner, t.role, t.lifespan, t.tagline, t.bio,
             t.address, t.founded, t.hours, t.entry, t.phone
      FROM museums m
      LEFT JOIN museum_translations t ON m.id = t.museum_id AND t.lang = ?
      WHERE m.id = ?
    `);
    const m = stmt.get(lang, id);
    if (!m) return res.status(404).json({ error: 'Museum not found' });
    
    const eventsStmt = db.prepare('SELECT year, text FROM events WHERE museum_id = ? AND lang = ?');
    const events = eventsStmt.all(id, lang);
    
    const quizzesStmt = db.prepare('SELECT id, question AS q, options, answer AS a FROM quizzes WHERE museum_id = ? AND lang = ?');
    const allQuizzes = quizzesStmt.all(id, lang);
    const quiz = allQuizzes.map(q => ({ id: q.id, q: q.q, options: JSON.parse(q.options), a: q.a }));
    
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
        info: {
          address: m.address,
          founded: m.founded,
          hours: m.hours,
          entry: m.entry,
          phone: m.phone
        },
        events: events,
        quiz: quiz
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
    const { lang = 'uz' } = req.query;
    const { 
      city, birth, death, established, pos_x, pos_y, lat, lon,
      name, owner, role, lifespan, tagline, bio, address, founded, hours, entry, phone 
    } = req.body;
    
    // Update main museums table
    const stmtMuseum = db.prepare(`
      UPDATE museums 
      SET city = ?, birth = ?, death = ?, established = ?, pos_x = ?, pos_y = ?, lat = ?, lon = ?
      WHERE id = ?
    `);
    stmtMuseum.run(
      city || 'kokand', 
      birth || '', 
      death || '', 
      established || '', 
      pos_x !== undefined && pos_x !== '' ? parseFloat(pos_x) : null,
      pos_y !== undefined && pos_y !== '' ? parseFloat(pos_y) : null,
      lat !== undefined && lat !== '' ? parseFloat(lat) : null,
      lon !== undefined && lon !== '' ? parseFloat(lon) : null,
      id
    );
    
    // Check if translation exists first
    const checkStmt = db.prepare('SELECT 1 FROM museum_translations WHERE museum_id = ? AND lang = ?');
    const exists = checkStmt.get(id, lang);
    
    if (exists) {
      const stmt = db.prepare(`
        UPDATE museum_translations 
        SET name = ?, owner = ?, role = ?, lifespan = ?, tagline = ?, bio = ?, address = ?, founded = ?, hours = ?, entry = ?, phone = ?
        WHERE museum_id = ? AND lang = ?
      `);
      stmt.run(name || '', owner || '', role || '', lifespan || '', tagline || '', bio || '', address || '', founded || '', hours || '', entry || '', phone || '', id, lang);
    } else {
      const stmt = db.prepare(`
        INSERT INTO museum_translations 
        (museum_id, lang, name, owner, role, lifespan, tagline, bio, address, founded, hours, entry, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, lang, name || '', owner || '', role || '', lifespan || '', tagline || '', bio || '', address || '', founded || '', hours || '', entry || '', phone || '');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update museum data' });
  }
};

exports.createMuseum = (req, res) => {
  try {
    const { 
      id, city, birth, death, established, pos_x, pos_y, lat, lon,
      name, owner, role, lifespan, tagline, bio, address, founded, hours, entry, phone 
    } = req.body;
    
    const finalId = id || 'museum_' + Date.now();
    const finalCity = city || 'kokand';
    
    const stmt1 = db.prepare('INSERT INTO museums (id, city, pos_x, pos_y, birth, death, established, lat, lon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt1.run(
      finalId, 
      finalCity, 
      pos_x !== undefined && pos_x !== '' ? parseFloat(pos_x) : null,
      pos_y !== undefined && pos_y !== '' ? parseFloat(pos_y) : null,
      birth || '', 
      death || '', 
      established || '',
      lat !== undefined && lat !== '' ? parseFloat(lat) : null,
      lon !== undefined && lon !== '' ? parseFloat(lon) : null
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
