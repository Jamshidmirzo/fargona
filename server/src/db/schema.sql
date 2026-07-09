CREATE TABLE IF NOT EXISTS museums (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  pos_x INTEGER,
  pos_y INTEGER,
  birth INTEGER,
  death INTEGER,
  established INTEGER,
  hero_image TEXT
);

CREATE TABLE IF NOT EXISTS museum_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_id TEXT NOT NULL,
  lang TEXT NOT NULL,
  name TEXT,
  owner TEXT,
  role TEXT,
  lifespan TEXT,
  tagline TEXT,
  bio TEXT,
  address TEXT,
  founded TEXT,
  hours TEXT,
  entry TEXT,
  phone TEXT,
  FOREIGN KEY(museum_id) REFERENCES museums(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_id TEXT NOT NULL,
  lang TEXT NOT NULL,
  year TEXT NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY(museum_id) REFERENCES museums(id)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_id TEXT NOT NULL,
  lang TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array
  answer INTEGER NOT NULL,
  FOREIGN KEY(museum_id) REFERENCES museums(id)
);

CREATE TABLE IF NOT EXISTS exhibits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_id TEXT NOT NULL,
  lang TEXT NOT NULL,
  hall_num INTEGER NOT NULL,
  title TEXT NOT NULL,
  desc TEXT,
  image_url TEXT,
  FOREIGN KEY(museum_id) REFERENCES museums(id)
);
