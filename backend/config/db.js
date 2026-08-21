const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbPool = null;
let sqliteDb = null;
let dbMode = 'mysql';

// Convert SQL query parameters to SQLite compatible format if using SQLite
function convertQuery(sql) {
  if (dbMode === 'sqlite') {
    // Replace ON DUPLICATE KEY UPDATE with SQLite syntax or handling if needed
    // Simple placeholder conversion if needed
    let count = 0;
    return sql.replace(/\?/g, () => `$${++count}`);
  }
  return sql;
}

// Wrapper query execution function that supports both MySQL and SQLite seamlessly
async function query(sql, params = []) {
  if (dbMode === 'mysql' && dbPool) {
    try {
      const [rows, fields] = await dbPool.query(sql, params);
      return rows;
    } catch (err) {
      if (!err.message.includes('Duplicate column name')) {
        console.warn('⚠️ MySQL Query Failed, trying fallback/reconnect:', err.message);
      }
      throw err;
    }
  } else if (sqliteDb) {
    return new Promise((resolve, reject) => {
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      
      // Adapt MySQL specific syntax for SQLite when needed
      let adaptedSql = sql
        .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
        .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
        .replace(/TINYINT\(1\)/gi, 'INTEGER')
        .replace(/ON DUPLICATE KEY UPDATE.*/gi, '');

      if (isSelect) {
        sqliteDb.all(adaptedSql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        sqliteDb.run(adaptedSql, params, function (err) {
          if (err) reject(err);
          else resolve({ insertId: this.lastID, affectedRows: this.changes });
        });
      }
    });
  } else {
    throw new Error('Database connection not initialized');
  }
}

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'shreeram_homeo';
  const port = process.env.DB_PORT || 3306;

  try {
    // Try connecting to MySQL first
    console.log(`🔌 Attempting connection to MySQL at ${host}:${port}...`);
    const connection = await mysql.createConnection({ host, user, password, port });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.end();

    dbPool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test pool connection
    const [rows] = await dbPool.query('SELECT 1 + 1 AS result');
    console.log('✅ MySQL Database connected successfully!');
    dbMode = 'mysql';

    // Auto-patch services table missing columns
    try {
      await dbPool.query("ALTER TABLE services ADD COLUMN display_order INT DEFAULT 0");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE services ADD COLUMN icon_name VARCHAR(50) DEFAULT 'Stethoscope'");
    } catch (e) {}

    // Auto-patch appointment_status_history missing columns
    try {
      await dbPool.query("ALTER TABLE appointment_status_history ADD COLUMN old_status VARCHAR(50)");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE appointment_status_history ADD COLUMN previous_status VARCHAR(50)");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE appointment_status_history ADD COLUMN notes TEXT");
    } catch (e) {}

    // Auto-patch branch exact visiting card operating hours
    try {
      // West Mambalam / T Nagar (Mon-Sat: 10:00 AM-2:00 PM & 6:30 PM-9:00 PM | Sun: 11:00 AM-2:00 PM)
      await dbPool.query(`UPDATE branches SET 
        morning_open = '10:00',
        morning_close = '14:00',
        evening_open = '18:30',
        evening_close = '21:00',
        sunday_morning_open = '11:00',
        sunday_morning_close = '14:00',
        sunday_evening_open = NULL,
        sunday_evening_close = NULL,
        is_sunday_open = 1
        WHERE name LIKE '%Mambalam%' OR name LIKE '%T Nagar%' OR slug = 't-nagar' OR id = 2`);

      // Anna Nagar (Mon-Sat: 4:00 PM-6:00 PM | Sunday Holiday)
      await dbPool.query(`UPDATE branches SET 
        morning_open = NULL,
        morning_close = NULL,
        evening_open = '16:00',
        evening_close = '18:00',
        sunday_morning_open = NULL,
        sunday_morning_close = NULL,
        sunday_evening_open = NULL,
        sunday_evening_close = NULL,
        is_sunday_open = 0
        WHERE name LIKE '%Anna Nagar%' OR slug = 'anna-nagar' OR id = 1`);
    } catch (e) {}

    await seedDefaultUsers();
    return { mode: 'mysql', db: dbPool };
  } catch (mysqlErr) {
    console.warn(`⚠️ MySQL Connection could not be established: ${mysqlErr.message}`);
    console.log('🔄 Falling back to embedded SQLite database engine for instant execution...');

    const dbPath = path.resolve(__dirname, '..', process.env.SQLITE_DB_PATH || 'database.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
    dbMode = 'sqlite';

    // Enable foreign keys in SQLite
    sqliteDb.run('PRAGMA foreign_keys = ON;');
    console.log(`✅ SQLite Database connected successfully at ${dbPath}`);

    // Seed default Super Admin & Doctor accounts
    await seedDefaultUsers();

    return { mode: 'sqlite', db: sqliteDb };
  }
}

async function ensureTablesExist() {
  try {
    const pk = dbMode === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id ${pk},
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        phone VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS branches (
        id ${pk},
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        address TEXT NOT NULL,
        phone VARCHAR(50) NOT NULL,
        morning_open VARCHAR(10),
        morning_close VARCHAR(10),
        evening_open VARCHAR(10),
        evening_close VARCHAR(10),
        sunday_morning_open VARCHAR(10),
        sunday_morning_close VARCHAR(10),
        sunday_evening_open VARCHAR(10),
        sunday_evening_close VARCHAR(10),
        is_sunday_open TINYINT(1) DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        google_map_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id ${pk},
        name VARCHAR(150) NOT NULL,
        description TEXT,
        icon_name VARCHAR(50) DEFAULT 'Stethoscope',
        display_order INT DEFAULT 0,
        duration_minutes INT DEFAULT 30,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id ${pk},
        appointment_id VARCHAR(50) NOT NULL UNIQUE,
        patient_name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(150) NOT NULL,
        service_id INT NOT NULL,
        branch_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time VARCHAR(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        remarks TEXT,
        admin_notes TEXT,
        reminder_24h_sent TINYINT(1) DEFAULT 0,
        reminder_2h_sent TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS appointment_status_history (
        id ${pk},
        appointment_id INT NOT NULL,
        old_status VARCHAR(50),
        previous_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by VARCHAR(100) DEFAULT 'System',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS holidays (
        id ${pk},
        branch_id INT NULL,
        holiday_date DATE NOT NULL,
        title VARCHAR(150) NOT NULL,
        reason TEXT,
        is_recurring TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id ${pk},
        recipient_email VARCHAR(150) NOT NULL,
        email_type VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id ${pk},
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS clients (
        id ${pk},
        client_id VARCHAR(50) NOT NULL UNIQUE,
        hospital_name VARCHAR(150) NOT NULL,
        contact_person VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        plan_name VARCHAR(100) DEFAULT 'Monthly Hospital Enterprise',
        monthly_fee VARCHAR(20) DEFAULT '2999',
        status VARCHAR(20) DEFAULT 'active',
        pause_reason TEXT,
        next_billing_date DATE,
        last_payment_date DATE,
        brevo_api_key VARCHAR(255),
        brevo_sender_email VARCHAR(150),
        brevo_sender_name VARCHAR(150),
        whatsapp_api_key VARCHAR(255),
        whatsapp_phone_number_id VARCHAR(100),
        sms_api_key VARCHAR(255),
        sms_sender_id VARCHAR(50),
        feedback_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notification Logs Table
    await query(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id ${pk},
        appointment_id VARCHAR(100),
        channel VARCHAR(20) NOT NULL,
        stage VARCHAR(50) NOT NULL,
        recipient VARCHAR(150) NOT NULL,
        status VARCHAR(20) NOT NULL,
        message TEXT,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments Table for SaaS Subscription Billing History
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id ${pk},
        client_id VARCHAR(50) NOT NULL,
        hospital_name VARCHAR(150) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        amount VARCHAR(20) NOT NULL,
        payment_id VARCHAR(100) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'Razorpay',
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        active_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'SUCCESS',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Auto-patch missing columns silently
    const silentAlter = async (q) => { try { await query(q); } catch (e) {} };
    await silentAlter("ALTER TABLE clients ADD COLUMN brevo_api_key VARCHAR(255)");
    await silentAlter("ALTER TABLE clients ADD COLUMN brevo_sender_email VARCHAR(150)");
    await silentAlter("ALTER TABLE clients ADD COLUMN brevo_sender_name VARCHAR(150)");
    await silentAlter("ALTER TABLE clients ADD COLUMN whatsapp_api_key VARCHAR(255)");
    await silentAlter("ALTER TABLE clients ADD COLUMN whatsapp_phone_number_id VARCHAR(100)");
    await silentAlter("ALTER TABLE clients ADD COLUMN sms_api_key VARCHAR(255)");
    await silentAlter("ALTER TABLE clients ADD COLUMN sms_sender_id VARCHAR(50)");
    await silentAlter("ALTER TABLE clients ADD COLUMN feedback_url TEXT");
    await silentAlter("ALTER TABLE clients ADD COLUMN pricing_rates TEXT");
    await silentAlter("ALTER TABLE appointments ADD COLUMN reminder_24h_sent TINYINT(1) DEFAULT 0");
    await silentAlter("ALTER TABLE appointments ADD COLUMN reminder_2h_sent TINYINT(1) DEFAULT 0");
  } catch (err) {
    console.warn('⚠️ Table Creation Warning:', err.message);
  }
}

async function seedDefaultUsers() {
  try {
    await ensureTablesExist();

    const bcrypt = require('bcryptjs');
    const superHash = await bcrypt.hash('superadmin123', 10);
    const doctorHash = await bcrypt.hash('admin123', 10);

    // 1. Super Admin User: Srija (info@mediqora.in)
    const existingSuper = await query('SELECT id FROM users WHERE email = ? OR role = ?', ['info@mediqora.in', 'superadmin']);
    if (existingSuper.length === 0) {
      await query('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)', [
        'Srija',
        'info@mediqora.in',
        superHash,
        'superadmin',
        '+91 73735 09585'
      ]);
      console.log('👤 Created Super Admin user: Srija (info@mediqora.in)');
    } else {
      await query('UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?', [
        'Srija',
        'info@mediqora.in',
        '+91 73735 09585',
        'superadmin',
        existingSuper[0].id
      ]);
      console.log('👤 Updated Super Admin user: Srija (info@mediqora.in)');
    }

    // 2. RRK Clinic Staff & Admin Accounts
    const adminHash = await bcrypt.hash('admin123', 10);
    const doctorPassHash = await bcrypt.hash('doctor123', 10);
    const receptionHash = await bcrypt.hash('reception123', 10);

    // 2A. Hospital Admin Account
    const existingAdmin = await query('SELECT id FROM users WHERE email IN (?, ?)', ['admin@rrkclinic.com', 'admin@kkrclinic.com']);
    if (existingAdmin.length === 0) {
      await query('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)', [
        'RRK Hospital Administrator',
        'admin@rrkclinic.com',
        adminHash,
        'admin',
        '+91 98400 11223'
      ]);
      console.log('👑 Created RRK Hospital Administrator user: admin@rrkclinic.com');
    } else {
      await query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [
        'RRK Hospital Administrator',
        'admin@rrkclinic.com',
        'admin',
        existingAdmin[0].id
      ]);
      console.log('👑 Updated RRK Hospital Administrator user role to admin');
    }

    // 2B. Senior Doctors
    const existingDocRajan = await query('SELECT id FROM users WHERE email IN (?, ?)', ['dr.rajan@rrkclinic.com', 'dr.rajan@kkrclinic.com']);
    if (existingDocRajan.length === 0) {
      await query('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)', [
        'Dr. R.R. Rajan',
        'dr.rajan@rrkclinic.com',
        doctorPassHash,
        'doctor',
        '+91 98401 22334'
      ]);
      console.log('👨‍⚕️ Created Doctor user: dr.rajan@rrkclinic.com');
    }

    const existingDocAnitha = await query('SELECT id FROM users WHERE email IN (?, ?)', ['dr.anitha@rrkclinic.com', 'dr.anitha@kkrclinic.com']);
    if (existingDocAnitha.length === 0) {
      await query('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)', [
        'Dr. Anitha Rajan',
        'dr.anitha@rrkclinic.com',
        doctorPassHash,
        'doctor',
        '+91 98402 33445'
      ]);
      console.log('👩‍⚕️ Created Doctor user: dr.anitha@rrkclinic.com');
    }

    // 2C. Front Desk Receptionist
    const existingReceptionist = await query('SELECT id FROM users WHERE email IN (?, ?)', ['receptionist@rrkclinic.com', 'receptionist@kkrclinic.com']);
    if (existingReceptionist.length === 0) {
      await query('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)', [
        'Priya Sundaram',
        'receptionist@rrkclinic.com',
        receptionHash,
        'receptionist',
        '+91 98403 44556'
      ]);
      console.log('📋 Created Receptionist user: receptionist@rrkclinic.com');
    }

    // 3. Seed RRK Clinic Branches if empty
    const existingBranches = await query('SELECT id FROM branches');
    if (existingBranches.length === 0) {
      await query(`
        INSERT INTO branches (id, name, slug, address, phone, morning_open, morning_close, evening_open, evening_close, sunday_morning_open, sunday_morning_close, sunday_evening_open, sunday_evening_close, is_sunday_open, is_active) VALUES
        (1, 'RRK Clinic - Anna Nagar Main', 'anna-nagar', 'Plot 42, 2nd Avenue, Anna Nagar East, Chennai - 600102', '+91 44 2621 1122', '09:00', '13:00', '17:00', '21:00', '10:00', '13:00', NULL, NULL, 1, 1),
        (2, 'RRK Clinic - T. Nagar Specialty Desk', 't-nagar', '88, Usman Road, T. Nagar, Chennai - 600017', '+91 44 2434 5566', '10:00', '14:00', '18:00', '21:00', '11:00', '14:00', NULL, NULL, 1, 1)
      `);
      console.log('📍 Seeded default RRK Clinic Branches');
    }

    // 4. Seed RRK Clinic Services if empty
    const existingServices = await query('SELECT id FROM services');
    if (existingServices.length === 0) {
      await query(`
        INSERT INTO services (id, name, description, icon_name, display_order, is_active) VALUES
        (1, 'General & Preventive Consultation', 'Comprehensive health assessment and clinical prescription', 'Stethoscope', 1, 1),
        (2, 'Cardiology & ECG Screening', 'Cardiovascular evaluation and resting 12-lead ECG analysis', 'Activity', 2, 1),
        (3, 'Pediatric Checkup & Immunization', 'Specialized pediatric health monitoring, growth checks, and vaccines', 'HeartPulse', 3, 1),
        (4, 'Gynaecology & Ultrasound Scan', 'Women healthcare consultations and routine ultrasound screenings', 'Sparkles', 4, 1)
      `);
      console.log('🩺 Seeded default RRK Clinic Services');
    }

    // 5. Primary Hospital Client: RRK Clinic & Multispecialty Hospital
    const existingRRK = await query('SELECT id FROM clients WHERE client_id IN (?, ?) OR email IN (?, ?)', ['CLI-RRK-002', 'CLI-KKR-002', 'admin@rrkclinic.com', 'admin@kkrclinic.com']);
    if (existingRRK.length === 0) {
      await query(`
        INSERT INTO clients 
        (client_id, hospital_name, contact_person, email, phone, plan_name, monthly_fee, status, pause_reason, next_billing_date, last_payment_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'CLI-RRK-002',
        'RRK Clinic & Multispecialty Hospital',
        'RRK Hospital Administrator',
        'admin@rrkclinic.com',
        '+91 98400 11223',
        '3 Months Plan (Without Email Follow-up)',
        '12000',
        'active',
        'Hospital SaaS subscription is currently paused. Please contact Mediqora Super Admin.',
        '2026-11-21',
        '2026-08-21'
      ]);
      console.log('🏥 Registered Primary Hospital Client: RRK Clinic & Multispecialty Hospital');
    } else {
      await query(`
        UPDATE clients 
        SET client_id = 'CLI-RRK-002', hospital_name = 'RRK Clinic & Multispecialty Hospital', contact_person = 'RRK Hospital Administrator', email = 'admin@rrkclinic.com' 
        WHERE id = ?
      `, [existingRRK[0].id]);
    }

    // Clean up Shree Ram Homeo and dummy clients completely
    await query("DELETE FROM clients WHERE client_id = 'CLI-SRIRAM-001' OR hospital_name LIKE '%Shree Ram%' OR client_id IN ('CLI-ABC-002', 'CLI-XYZ-003')");
  } catch (err) {
    console.warn('⚠️ User/Client Seeding Warning:', err.message);
  }
}

function getDbMode() {
  return dbMode;
}

module.exports = {
  initDatabase,
  query,
  getDbMode
};
