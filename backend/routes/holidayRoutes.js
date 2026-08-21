const express = require('express');
const router = express.Router();
const { getHolidays, createHoliday, deleteHoliday } = require('../controllers/holidayController');
const { verifyToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

router.get('/', getHolidays);
router.post('/', verifyToken, requireSuperAdmin, createHoliday);
router.delete('/:id', verifyToken, requireSuperAdmin, deleteHoliday);

module.exports = router;
