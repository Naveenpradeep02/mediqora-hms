const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function resetPassword() {
  const plainPassword1 = 'admin123';
  const plainPassword2 = 'AdminPassword123!';
  const newHash = await bcrypt.hash(plainPassword1, 10);

  console.log(`🔐 Resetting Admin Credentials:`);
  console.log(`Email: dr.selvakumarr@gmail.com`);
  console.log(`Password: ${plainPassword1} (or ${plainPassword2})`);

  // 1. Reset in SQLite
  const dbPath = path.resolve(__dirname, '../database.sqlite');
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES (1, 'Dr. Selvakumar', 'dr.selvakumarr@gmail.com', ?, 'admin')
       ON CONFLICT(id) DO UPDATE SET email = 'dr.selvakumarr@gmail.com', password_hash = ?`,
      [newHash, newHash],
      (err) => {
        if (err) console.error('SQLite reset error:', err.message);
        else console.log('✅ SQLite Admin Password updated!');
      }
    );

    // Also insert single 'r' email alias just in case
    db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES ('Dr. Selvakumar', 'dr.selvakumar@gmail.com', ?, 'admin')
       ON CONFLICT(email) DO UPDATE SET password_hash = ?`,
      [newHash, newHash]
    );
  });
  db.close();

  // 2. Reset in MySQL
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'shreeram_homeo'
    });

    await connection.execute(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES (1, 'Dr. Selvakumar', 'dr.selvakumarr@gmail.com', ?, 'admin')
       ON DUPLICATE KEY UPDATE email = 'dr.selvakumarr@gmail.com', password_hash = ?`,
      [newHash, newHash]
    );

    await connection.execute(
      `INSERT INTO users (name, email, password_hash, role) VALUES ('Dr. Selvakumar', 'dr.selvakumar@gmail.com', ?, 'admin')
       ON DUPLICATE KEY UPDATE password_hash = ?`,
      [newHash, newHash]
    );

    console.log('✅ MySQL Admin Password updated successfully!');
    await connection.end();
  } catch (err) {
    console.warn('MySQL update skipped or error:', err.message);
  }
}

resetPassword();
