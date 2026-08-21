const express = require('express');
const router = express.Router();
const {
  getSaasStatus,
  updateSaasStatus,
  renewSaasSubscription,
  getClients,
  createClient,
  updateClient,
  renewClient,
  deleteClient,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentHistory
} = require('../controllers/saasController');
const { verifyToken, requireSuperAdmin } = require('../middleware/auth');

// GET /api/saas/status & /api/saas/subscription - Accessible to check status by client ID or session
router.get('/status', getSaasStatus);
router.get('/subscription', getSaasStatus);

// Online Payment & License Renewal Routes (Accessible by Doctor Admin / Hospital session)
router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/verify-razorpay-payment', verifyRazorpayPayment);

// Global SaaS status updates (Super Admin only)
router.put('/status', verifyToken, requireSuperAdmin, updateSaasStatus);
router.post('/renew', verifyToken, requireSuperAdmin, renewSaasSubscription);

// ==========================================
// MEDIQORO CLIENT MANAGEMENT & PAYMENTS ROUTES
// ==========================================
router.get('/clients', verifyToken, requireSuperAdmin, getClients);
router.post('/clients', verifyToken, requireSuperAdmin, createClient);
router.put('/clients/:id', verifyToken, requireSuperAdmin, updateClient);
router.post('/clients/:id/renew', verifyToken, requireSuperAdmin, renewClient);
router.delete('/clients/:id', verifyToken, requireSuperAdmin, deleteClient);

router.get('/payments', verifyToken, requireSuperAdmin, getPaymentHistory);

module.exports = router;
