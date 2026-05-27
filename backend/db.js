require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('\n[ERROR] DATABASE_URL environment variable is not set!\n');
  process.exit(1);
}

let poolConfig;
try {
  const parsed = new URL(process.env.DATABASE_URL);
  poolConfig = {
    host:     parsed.hostname || 'localhost',
    port:     parseInt(parsed.port) || 5432,
    user:     decodeURIComponent(parsed.username || 'postgres'),
    password: parsed.password ? String(decodeURIComponent(parsed.password)) : undefined,
    database: parsed.pathname.replace(/^\//, '') || 'postgres',
    ssl:      false,
  };
} catch {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = pool;
