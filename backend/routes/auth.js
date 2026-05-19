const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tour_agency_secret_2024';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Заполните все поля' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });

    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });

    const allowedRoles = ['user', 'agent', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'user';
    const hashPassword = bcrypt.hashSync(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, avatar, created_at',
      [name, email, hashPassword, userRole]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Введите email и пароль' });

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];

    if (!user)
      return res.status(400).json({ message: 'Пользователь не найден' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.status(400).json({ message: 'Неверный пароль' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.put('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, avatar, newPassword, currentPassword } = req.body;
    const userId = req.user.id;

    const userResult = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    let updatedName = name || user.name;
    let updatedAvatar = avatar !== undefined ? avatar : user.avatar;
    let updatedPassword = user.password;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Введите текущий пароль' });
      const valid = bcrypt.compareSync(currentPassword, user.password);
      if (!valid) return res.status(400).json({ message: 'Неверный текущий пароль' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'Новый пароль должен быть не менее 6 символов' });
      updatedPassword = bcrypt.hashSync(newPassword, 10);
    }

    const result = await pool.query(
      'UPDATE users SET name=$1, avatar=$2, password=$3 WHERE id=$4 RETURNING id, name, email, role, avatar',
      [updatedName, updatedAvatar, updatedPassword, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

module.exports = router;
