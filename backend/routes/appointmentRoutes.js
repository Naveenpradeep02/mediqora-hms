const express = require('express');
const { body, query: queryParam } = require('express-validator');
const router = express.Router();
const {
  fetchAvailableSlots,
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateStatus,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { verifyToken, requireAdmin, requireSuperAdmin, requireActiveSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Public endpoints
router.get('/slots', fetchAvailableSlots);

router.post(
  '/',
  [
    body('patientName').trim().notEmpty().withMessage('Patient name is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number required'),
    body('email').isEmail().withMessage('Valid email address required'),
    body('serviceId').isInt().withMessage('Valid service ID required'),
    body('branchId').isInt().withMessage('Valid branch ID required'),
    body('appointmentDate').isISO8601().withMessage('Valid appointment date required'),
    body('appointmentTime').notEmpty().withMessage('Appointment time slot required'),
    validate
  ],
  requireActiveSubscription,
  createAppointment
);

// Protected Admin endpoints
router.get('/', verifyToken, requireAdmin, requireActiveSubscription, getAppointments);
router.get('/:id', verifyToken, requireAdmin, requireActiveSubscription, getAppointmentById);
router.patch('/:id/status', verifyToken, requireAdmin, requireActiveSubscription, updateStatus);
router.put('/:id', verifyToken, requireSuperAdmin, updateAppointment);
router.delete('/:id', verifyToken, requireSuperAdmin, deleteAppointment);

module.exports = router;
