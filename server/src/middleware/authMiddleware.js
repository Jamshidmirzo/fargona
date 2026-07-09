const jwt = require('jsonwebtoken');
const db = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fargona-secret-key-12345';

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized format' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

exports.checkMuseumAccess = (req, res, next) => {
  // Super admin can access any museum
  if (req.user.role === 'super_admin') return next();
  
  const museumId = req.params.id || req.body.museum_id || req.query.museum_id;
  if (!museumId) return res.status(400).json({ error: 'Museum identifier is missing' });
  
  // For museum admin, check if assigned
  const stmt = db.prepare('SELECT 1 FROM admin_museums WHERE admin_id = ? AND museum_id = ?');
  const hasAccess = stmt.get(req.user.id, museumId);
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Forbidden: You do not have access to this museum' });
  }
  next();
};
