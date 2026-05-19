const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// РЕГИСТРАЦИЯ
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const hashPassword = bcrypt.hashSync(password, 7);

  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, email, hashPassword, 'user']
  );

  res.json(result.rows[0]);
});

// ЛОГИН
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

  if (!user.rows[0]) {
    return res.status(400).json({ message: 'Пользователь не найден' });
  }

  const validPassword = bcrypt.compareSync(password, user.rows[0].password);

  if (!validPassword) {
    return res.status(400).json({ message: 'Неверный пароль' });
  }

  const token = jwt.sign(
    { id: user.rows[0].id, role: user.rows[0].role },
    'secret_key',
    { expiresIn: '24h' }
  );

  res.json({ token });
});

module.exports = router;