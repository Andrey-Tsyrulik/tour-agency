const express = require('express');
const cors = require('cors');

const toursRoutes = require('./routes/tours');
const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const usersRoutes = require('./routes/users');
const browsingRoutes = require('./routes/browsing');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/browsing', browsingRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});
