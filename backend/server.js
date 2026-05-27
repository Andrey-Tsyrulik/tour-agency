const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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

const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(200).send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Tour Agency API</title>
      <style>body{font-family:monospace;padding:40px;background:#071828;color:#7EC8F0;}h1{color:#C4384F;}code{background:#0C2D52;padding:4px 10px;border-radius:6px;}</style></head>
      <body><h1>Tour Agency — API Server</h1>
      <p>Backend is running. Frontend is not built yet.</p>
      <p>To build the frontend, run: <code>cd frontend && npm install && npm run build</code></p>
      <p>Then restart the server.</p></body></html>`);
  }
  res.sendFile(indexPath);
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
