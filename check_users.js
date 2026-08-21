const { initDatabase, query } = require('./backend/config/db');

async function checkUsers() {
  await initDatabase();
  const users = await query('SELECT id, name, email, role FROM users');
  console.log('USERS IN DB:', users);
}

checkUsers().catch(console.error);
