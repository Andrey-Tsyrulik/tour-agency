require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const toursRoutes    = require('./routes/tours');
const authRoutes     = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const usersRoutes    = require('./routes/users');
const browsingRoutes = require('./routes/browsing');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth',     authRoutes);
app.use('/api/tours',    toursRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/browsing', browsingRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(200) NOT NULL,
        email      VARCHAR(200) UNIQUE NOT NULL,
        password   TEXT NOT NULL,
        role       VARCHAR(20) NOT NULL DEFAULT 'user',
        avatar     TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(300) NOT NULL,
        description TEXT,
        location    VARCHAR(300),
        country     VARCHAR(150),
        category    VARCHAR(100),
        price       NUMERIC(12,2) NOT NULL DEFAULT 0,
        duration    INTEGER,
        image_url   TEXT,
        available   BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tour_id     INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
        start_date  DATE,
        end_date    DATE,
        guests      INTEGER NOT NULL DEFAULT 1,
        total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
        status      VARCHAR(30) NOT NULL DEFAULT 'pending',
        notes       TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id             SERIAL PRIMARY KEY,
        booking_id     INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount         NUMERIC(12,2) NOT NULL DEFAULT 0,
        status         VARCHAR(30) NOT NULL DEFAULT 'pending',
        method         VARCHAR(50),
        transaction_id VARCHAR(100),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS browsing_history (
        id        SERIAL PRIMARY KEY,
        user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tour_id   INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
        viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@touragency.ru';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminName = 'Администратор';

    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [adminEmail]);
    if (existing.rows.length === 0) {
      const hash = bcrypt.hashSync(String(adminPassword), 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)',
        [adminName, adminEmail, hash, 'admin']
      );
      console.log(`[DB] Admin account created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`[DB] Admin account already exists: ${adminEmail}`);
    }

    console.log('[DB] Database initialized successfully');
  } catch (err) {
    console.error('[DB] Initialization error:', err.message);
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[Server] Backend running on port ${PORT}`);
  await initDB();
});
