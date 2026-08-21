const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('⚡ Updating SQLite database with official visiting card contact info...');

  // Update Branch 1 (Anna Nagar)
  db.run(`
    UPDATE branches 
    SET name = 'Shree Ram Homeo - Anna Nagar',
        address = 'G-2, Firm Foundation, Plot No : 3738, 6/22, 17th Street, Q Block, Anna Nagar, Chennai - 600040 (Near K4 Police Station)',
        phone = '+91 95515 19766'
    WHERE id = 1;
  `);

  // Update Branch 2 (West Mambalam / T Nagar)
  db.run(`
    UPDATE branches 
    SET name = 'Shree Ram Homeo - West Mambalam / T Nagar',
        address = '58, Arya Gowder Road, West Mambalam, Chennai - 600033 (Near Panigraha Marriage Hall)',
        phone = '044 2483 7465'
    WHERE id = 2;
  `);

  // Update admin user email
  db.run(`
    UPDATE users SET email = 'dr.selvakumarr@gmail.com' WHERE id = 1;
  `);

  console.log('✅ SQLite Database updated successfully!');
});

db.close();
