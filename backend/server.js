const express = require('express');
const cors = require('cors');

const toursRoutes = require('./routes/tours');
const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/tours', toursRoutes);
app.use('/auth', authRoutes);
app.use('/bookings', bookingsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, 'localhost', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
