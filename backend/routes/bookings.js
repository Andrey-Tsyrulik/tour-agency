const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/my', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, t.title as tour_title, t.image_url as tour_image, t.location, t.country
       FROM bookings b JOIN tours t ON b.tour_id=t.id WHERE b.user_id=$1 ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при загрузке бронирований' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin' || req.user.role === 'agent') {
      query = `SELECT b.*, u.name as user_name, u.email as user_email, t.title as tour_title, t.image_url as tour_image
               FROM bookings b JOIN users u ON b.user_id=u.id JOIN tours t ON b.tour_id=t.id ORDER BY b.created_at DESC`;
      params = [];
    } else {
      query = `SELECT b.*, t.title as tour_title, t.image_url as tour_image, t.location, t.country
               FROM bookings b JOIN tours t ON b.tour_id=t.id WHERE b.user_id=$1 ORDER BY b.created_at DESC`;
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при загрузке бронирований' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { tour_id, origin, transport_type, travel_class, arrival_date, departure_date, guests } = req.body;
    if (!tour_id || !origin || !arrival_date || !departure_date)
      return res.status(400).json({ message: 'Заполните все обязательные поля' });

    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(arrival_date) < today)
      return res.status(400).json({ message: 'Дата приезда не может быть в прошлом' });
    if (new Date(departure_date) <= new Date(arrival_date))
      return res.status(400).json({ message: 'Дата отъезда должна быть позже даты приезда' });

    const tourResult = await pool.query('SELECT * FROM tours WHERE id=$1', [tour_id]);
    const tour = tourResult.rows[0];
    if (!tour) return res.status(404).json({ message: 'Тур не найден' });

    const days = Math.ceil((new Date(departure_date) - new Date(arrival_date)) / (1000*60*60*24));
    const guestsNum = guests || 1;
    let basePrice = Number(tour.price);
    let classMultiplier = travel_class === 'business' ? 1.8 : 1;
    let transportAdd = transport_type === 'plane' ? 5000 : transport_type === 'train' ? 2000 : transport_type === 'bus' ? 800 : 0;
    const totalPrice = (basePrice * days + transportAdd * guestsNum) * classMultiplier * guestsNum;

    const result = await pool.query(
      `INSERT INTO bookings (user_id, tour_id, origin, transport_type, travel_class, arrival_date, departure_date, guests, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, tour_id, origin, transport_type, travel_class, arrival_date, departure_date, guestsNum, totalPrice.toFixed(2)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при создании бронирования' });
  }
});

router.put('/:id/status', auth, role('admin', 'agent'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Недопустимый статус' });

    const result = await pool.query(
      'UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Бронирование не найдено' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await pool.query('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
    if (!booking.rows[0]) return res.status(404).json({ message: 'Бронирование не найдено' });
    if (req.user.role === 'user' && booking.rows[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Нет доступа' });
    await pool.query('DELETE FROM bookings WHERE id=$1', [req.params.id]);
    res.json({ message: 'Бронирование отменено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при отмене бронирования' });
  }
});

module.exports = router;
