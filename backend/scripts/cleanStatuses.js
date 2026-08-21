const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('⚡ Normalizing database appointment statuses...');

  db.run(`UPDATE appointments SET status = 'Pending' WHERE status = 'New';`);
  db.run(`UPDATE appointments SET status = 'Completed' WHERE status LIKE 'Completed%';`);
  db.run(`UPDATE appointments SET status = 'Cancelled' WHERE status LIKE 'Cancelled%';`);

  console.log('✅ Appointment statuses normalized cleanly in SQLite database!');
});

db.close();
