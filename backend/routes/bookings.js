const express = require('express');
const router = express.Router();
const pool = require('../db');

// Создать бронирование
router.post('/', async (req, res) => {
  try {
    const { user_id, tour_id } = req.body;

    const result = await pool.query(
      'INSERT INTO bookings (user_id, tour_id) VALUES ($1,$2) RETURNING *',
      [user_id, tour_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;