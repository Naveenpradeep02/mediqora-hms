const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  console.log('⚡ Connected to MySQL Database Server...');

  // Create Database if not exists
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'sri_ram_homeo_db'}\`;`);
  await connection.query(`USE \`${process.env.DB_NAME || 'sri_ram_homeo_db'}\`;`);

  // Read and execute schema
  const schemaPath = path.join(__dirname, '../db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await connection.query(schemaSql);
  console.log('✅ Schema tables verified/created');

  // Insert/Update Branches
  await connection.query(`
    INSERT INTO branches (id, name, code, address, phone, is_active) VALUES
    (1, 'Shree Ram Homeo - Anna Nagar', 'ANNA_NAGAR', 'G-2, Firm Foundation, Plot No: 3738, 6/22, 17th Street, Q Block, Anna Nagar, Chennai - 600040 (Near K4 Police Station)', '+91 95515 19766', TRUE),
    (2, 'Shree Ram Homeo - West Mambalam / T Nagar', 'T_NAGAR', '58, Arya Gowder Road, West Mambalam, Chennai - 600033 (Near Panigraha Marriage Hall)', '044 2483 7465', TRUE)
    ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), phone=VALUES(phone);
  `);

  // Insert/Update Services
  await connection.query(`
    INSERT INTO services (id, name, description, is_active) VALUES
    (1, 'General Homeopathic Consultation', 'Comprehensive health assessment and constitutional remedy prescription', TRUE),
    (2, 'Chronic Illness Care', 'Long-term management for skin, respiratory, digestive, and autoimmune conditions', TRUE),
    (3, 'Pediatric & Immunity Care', 'Gentle and safe homeopathic treatments for children and infants', TRUE),
    (4, 'Women\\'s Health & Wellness', 'Specialized homeopathic care for hormonal balance, PCOD, thyroid, and wellness', TRUE)
    ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
  `);

  // Insert/Update Default Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await connection.query(`
    INSERT INTO users (id, name, email, password, role) VALUES
    (1, 'Dr. Selvakumar', 'dr.selvakumarr@gmail.com', ?, 'admin')
    ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password);
  `, [adminPasswordHash]);

  console.log('✅ Master seed data updated successfully (Branches, Services & Admin)');
  await connection.end();
}

initDb().catch(err => {
  console.error('❌ DB Initialization Failed:', err);
  process.exit(1);
});
