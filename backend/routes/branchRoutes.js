const express = require('express');
const router = express.Router();
const { getBranches, createBranch, updateBranch, deleteBranch } = require('../controllers/branchController');
const { verifyToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

router.get('/', getBranches);
router.post('/', verifyToken, requireSuperAdmin, createBranch);
router.put('/:id', verifyToken, requireSuperAdmin, updateBranch);
router.delete('/:id', verifyToken, requireSuperAdmin, deleteBranch);

module.exports = router;
