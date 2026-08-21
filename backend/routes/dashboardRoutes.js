const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { verifyToken, requireAdmin, requireActiveSubscription } = require('../middleware/auth');

router.get('/stats', verifyToken, requireAdmin, requireActiveSubscription, getDashboardStats);

module.exports = router;
