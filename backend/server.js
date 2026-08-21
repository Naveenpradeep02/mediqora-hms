const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initDatabase } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const branchRoutes = require('./routes/branchRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const saasRoutes = require('./routes/saasRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allow local frontend dev server
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    service: 'Shree Ram Homeo API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/saas', saasRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const { startNotificationCron } = require('./services/notificationCron');

// Start Server & Init DB
async function startServer() {
  try {
    await initDatabase();
    
    // Start automated 24h & 2h reminder cron engine
    try {
      startNotificationCron();
    } catch (cronErr) {
      console.warn('Notification cron startup warning:', cronErr.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Shree Ram Homeo API Server running on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`\n⚠️ Port ${PORT} is already in use by an active backend instance.`);
        console.log(`✅ The API Server is ALREADY ACTIVE and running at http://localhost:${PORT}/api\n`);
      } else {
        console.error('Server Error:', err);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
