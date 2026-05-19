const express = require('express');
const router = express.Router();
const pool = require('../db');

const auth = require('../middleware/auth');
const role = require('../middleware/role');

// ПОЛУЧИТЬ ВСЕ ТУРЫ (все могут)
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM tours');
  res.json(result.rows);
});

// ДОБАВИТЬ ТУР (только админ)
router.post('/', auth, role('admin'), async (req, res) => {
  const { title, description, price, duration } = req.body;

  const result = await pool.query(
    'INSERT INTO tours (title, description, price, duration) VALUES ($1,$2,$3,$4) RETURNING *',
    [title, description, price, duration]
  );

  res.json(result.rows[0]);
});

module.exports = router;