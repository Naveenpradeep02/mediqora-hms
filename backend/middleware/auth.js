const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. Token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'sri_ram_homeo_jwt_secret_key_2026_super_secure';

    const decoded = jwt.verify(token, secret);
    
    // Fetch user from DB
    const users = await query('SELECT id, name, email, role, phone FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'User invalid or revoked.' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  const allowedRoles = ['admin', 'superadmin', 'doctor', 'doctor_admin'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  const superRoles = ['superadmin', 'admin'];
  if (req.user && superRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden. Super Admin permission required for management operations.' 
    });
  }
};

const requireActiveSubscription = async (req, res, next) => {
  try {
    // SuperAdmin users and global platform operations bypass subscription check
    if (req.user && (req.user.role === 'superadmin' || req.user.email === 'info@mediqora.in')) {
      return next();
    }

    const requestedClientId = req.headers['x-client-id'] || req.query.clientId || 'CLI-RRK-002';
    const clients = await query('SELECT * FROM clients WHERE client_id = ? OR id = 2 LIMIT 1', [requestedClientId]);

    if (clients && clients.length > 0) {
      const client = clients[0];
      const todayStr = new Date().toISOString().split('T')[0];
      let nextBillingStr = client.next_billing_date;
      if (nextBillingStr) {
        if (typeof nextBillingStr === 'object' && nextBillingStr.toISOString) {
          nextBillingStr = nextBillingStr.toISOString().split('T')[0];
        } else if (typeof nextBillingStr === 'string' && nextBillingStr.includes('T')) {
          nextBillingStr = nextBillingStr.split('T')[0];
        }
      }

      const isDateExpired = nextBillingStr && nextBillingStr < todayStr;
      const isPaused = client.status === 'paused';
      const isExpired = client.status === 'expired' || isDateExpired;

      if (isPaused || isExpired) {
        if (isDateExpired && client.status !== 'paused') {
          await query('UPDATE clients SET status = ? WHERE id = ?', ['expired', client.id]);
        }

        return res.status(403).json({
          success: false,
          isPaused: isPaused,
          isExpired: isExpired,
          status: isPaused ? 'paused' : 'expired',
          hospitalName: client.hospital_name,
          nextBillingDate: nextBillingStr,
          pauseReason: client.pause_reason || 'Hospital SaaS subscription has expired or is paused. Clinical data access is locked.',
          message: isPaused
            ? `🛑 SaaS Access Paused by Mediqora Admin: ${client.pause_reason || 'Please renew subscription.'}`
            : `⚠️ SaaS Subscription Expired on ${nextBillingStr}. Clinical data is locked. Please renew to continue.`
        });
      }
    }

    next();
  } catch (error) {
    console.error('Subscription check middleware error:', error);
    next();
  }
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireSuperAdmin,
  requireActiveSubscription
};
