const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при загрузке пользователей' });
  }
});

router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const { name, email, password, role: userRole } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Заполните все поля' });

    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Email уже используется' });

    const hashPassword = bcrypt.hashSync(password, 10);
    const allowedRoles = ['user', 'agent', 'admin'];
    const finalRole = allowedRoles.includes(userRole) ? userRole : 'user';

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, created_at',
      [name, email, hashPassword, finalRole]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании пользователя' });
  }
});

router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { name, email, role: userRole } = req.body;
    const allowedRoles = ['user', 'agent', 'admin'];
    const finalRole = allowedRoles.includes(userRole) ? userRole : 'user';
    const result = await pool.query(
      'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, name, email, role, created_at',
      [name, email, finalRole, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
  }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id)
      return res.status(400).json({ message: 'Нельзя удалить собственный аккаунт' });
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
});

module.exports = router;
