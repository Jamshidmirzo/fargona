const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fargona-secret-key-12345';

exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!passMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Fetch assigned museums
    const museumsRows = db.prepare('SELECT museum_id FROM admin_museums WHERE admin_id = ?').all(admin.id);
    const assignedMuseums = museumsRows.map(r => r.museum_id);

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      username: admin.username,
      role: admin.role,
      assignedMuseums
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.listAdmins = (req, res) => {
  try {
    const admins = db.prepare("SELECT id, username, role FROM admins WHERE role != 'super_admin'").all();
    const result = admins.map(a => {
      const museumsRows = db.prepare('SELECT museum_id FROM admin_museums WHERE admin_id = ?').all(a.id);
      return {
        ...a,
        museums: museumsRows.map(r => r.museum_id)
      };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list admins' });
  }
};

exports.createAdmin = (req, res) => {
  try {
    const { username, password, role = 'museum_admin', museums = [] } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existing = db.prepare('SELECT 1 FROM admins WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const insertAdmin = db.prepare('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)');
    const insertMuseum = db.prepare('INSERT INTO admin_museums (admin_id, museum_id) VALUES (?, ?)');

    const transaction = db.transaction(() => {
      const result = insertAdmin.run(username, hash, role);
      const adminId = result.lastInsertRowid;
      for (const mId of museums) {
        insertMuseum.run(adminId, mId);
      }
      return adminId;
    });

    const adminId = transaction();
    res.json({ success: true, id: adminId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

exports.updateAdminMuseums = (req, res) => {
  try {
    const { id } = req.params;
    const { museums = [] } = req.body;

    const deleteMuseums = db.prepare('DELETE FROM admin_museums WHERE admin_id = ?');
    const insertMuseum = db.prepare('INSERT INTO admin_museums (admin_id, museum_id) VALUES (?, ?)');

    const transaction = db.transaction(() => {
      deleteMuseums.run(id);
      for (const mId of museums) {
        insertMuseum.run(id, mId);
      }
    });

    transaction();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update admin assignments' });
  }
};

exports.resetAdminPassword = (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare("UPDATE admins SET password_hash = ? WHERE id = ? AND role != 'super_admin'").run(hash, id);
    if (result.changes === 0) return res.status(404).json({ error: 'Admin not found or cannot reset super_admin' });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

exports.deleteAdmin = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM admins WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
};
