require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('\n[ERROR] DATABASE_URL environment variable is not set!');
  console.error('Please create a .env file with DATABASE_URL=postgresql://user:password@host/dbname');
  console.error('Or set the DATABASE_URL variable in your environment.\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = pool;
