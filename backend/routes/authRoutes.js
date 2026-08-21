const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { login, getMe, changePassword, updateProfile } = require('../controllers/authController');
const { verifyToken, requireSuperAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

router.get('/me', verifyToken, getMe);

router.put(
  '/change-password',
  verifyToken,
  requireSuperAdmin,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate
  ],
  changePassword
);

router.put('/profile', verifyToken, updateProfile);

module.exports = router;
