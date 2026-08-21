const express = require('express');
const router = express.Router();
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { verifyToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

router.get('/', getServices);
router.post('/', verifyToken, requireSuperAdmin, createService);
router.put('/:id', verifyToken, requireSuperAdmin, updateService);
router.delete('/:id', verifyToken, requireSuperAdmin, deleteService);

module.exports = router;
