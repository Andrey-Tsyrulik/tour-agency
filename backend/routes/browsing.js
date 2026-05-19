const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { tour_id } = req.body;
    if (!tour_id) return res.status(400).json({ message: 'Укажите тур' });

    await pool.query(
      'DELETE FROM browsing_history WHERE user_id=$1 AND tour_id=$2',
      [req.user.id, tour_id]
    );
    await pool.query(
      'INSERT INTO browsing_history (user_id, tour_id) VALUES ($1,$2)',
      [req.user.id, tour_id]
    );

    const count = await pool.query('SELECT COUNT(*) FROM browsing_history WHERE user_id=$1', [req.user.id]);
    if (Number(count.rows[0].count) > 20) {
      await pool.query(
        'DELETE FROM browsing_history WHERE id IN (SELECT id FROM browsing_history WHERE user_id=$1 ORDER BY viewed_at ASC LIMIT 1)',
        [req.user.id]
      );
    }

    res.json({ message: 'Записано' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bh.id, bh.viewed_at, t.id as tour_id, t.title, t.image_url, t.price, t.location, t.country, t.rating
       FROM browsing_history bh JOIN tours t ON bh.tour_id=t.id
       WHERE bh.user_id=$1 ORDER BY bh.viewed_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при загрузке истории' });
  }
});

module.exports = router;
