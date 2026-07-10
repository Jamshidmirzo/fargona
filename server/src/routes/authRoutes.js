const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/login', authController.login);

// Admin user management (Super Admin only)
router.get('/admins', verifyToken, requireRole('super_admin'), authController.listAdmins);
router.post('/admins', verifyToken, requireRole('super_admin'), authController.createAdmin);
router.put('/admins/:id', verifyToken, requireRole('super_admin'), authController.updateAdminMuseums);
router.patch('/admins/:id/password', verifyToken, requireRole('super_admin'), authController.resetAdminPassword);
router.delete('/admins/:id', verifyToken, requireRole('super_admin'), authController.deleteAdmin);

module.exports = router;
