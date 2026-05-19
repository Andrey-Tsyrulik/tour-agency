,const express = require('express');
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

app.use('/auth', authRoutes);
app.use('/tours', toursRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/users', usersRoutes);
app.use('/browsing', browsingRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

const PORT = 3001;
app.listen(PORT, 'localhost', () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
