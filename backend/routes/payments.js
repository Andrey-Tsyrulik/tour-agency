const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { booking_id, method } = req.body;
    if (!booking_id || !method)
      return res.status(400).json({ message: 'Укажите бронирование и способ оплаты' });

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id=$1', [booking_id]);
    const booking = bookingResult.rows[0];
    if (!booking) return res.status(404).json({ message: 'Бронирование не найдено' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Нет доступа' });

    const existing = await pool.query('SELECT * FROM payments WHERE booking_id=$1 AND status=$2', [booking_id, 'completed']);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Это бронирование уже оплачено' });

    const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2,6).toUpperCase();

    const paymentResult = await pool.query(
      'INSERT INTO payments (booking_id, user_id, amount, status, method, transaction_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [booking_id, req.user.id, booking.total_price, 'completed', method, transactionId]
    );

    await pool.query('UPDATE bookings SET status=$1 WHERE id=$2', ['confirmed', booking_id]);

    res.json({ payment: paymentResult.rows[0], message: 'Оплата прошла успешно!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при обработке платежа' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, b.tour_id, t.title as tour_title FROM payments p
       JOIN bookings b ON p.booking_id=b.id
       JOIN tours t ON b.tour_id=t.id
       WHERE p.user_id=$1 ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при загрузке платежей' });
  }
});

module.exports = router;
