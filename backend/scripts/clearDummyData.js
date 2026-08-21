const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbPath = path.resolve(__dirname, '../database.sqlite');

async function clearDummyData() {
  console.log('🧹 Clearing all sample dummy appointments...');

  // 1. Clear SQLite appointments
  const db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run(`DELETE FROM appointments;`, (err) => {
      if (err) {
        console.error('Error clearing SQLite appointments:', err);
      } else {
        console.log('✅ SQLite appointments table cleared completely!');
      }
    });

    db.run(`DELETE FROM sqlite_sequence WHERE name='appointments';`);
  });
  db.close();

  // 2. Clear MySQL appointments if configured
  if (process.env.DB_NAME && process.env.DB_USER) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sri_ram_homeopathy'
      });

      await connection.execute('TRUNCATE TABLE appointments;');
      console.log('✅ MySQL appointments table truncated completely!');
      await connection.end();
    } catch (mysqlErr) {
      console.log('ℹ️ MySQL connection skipped or unavailable (SQLite cleaned).');
    }
  }
}

clearDummyData();
