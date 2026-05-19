const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, country } = req.query;
    let query = 'SELECT * FROM tours WHERE available=true';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length} OR location ILIKE $${params.length} OR country ILIKE $${params.length})`;
    }
    if (category) {
      params.push(category);
      query += ` AND category=$${params.length}`;
    }
    if (country) {
      params.push(`%${country}%`);
      query += ` AND country ILIKE $${params.length}`;
    }
    if (minPrice) {
      params.push(Number(minPrice));
      query += ` AND price>=$${params.length}`;
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      query += ` AND price<=$${params.length}`;
    }

    query += ' ORDER BY rating DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при загрузке туров' });
  }
});

router.get('/all', auth, role('admin', 'agent'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tours ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при загрузке туров' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tours WHERE id=$1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Тур не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при загрузке тура' });
  }
});

router.post('/', auth, role('admin', 'agent'), async (req, res) => {
  try {
    const { title, description, price, duration, location, country, image_url, rating, category } = req.body;
    if (!title || !price) return res.status(400).json({ message: 'Название и цена обязательны' });

    const result = await pool.query(
      'INSERT INTO tours (title, description, price, duration, location, country, image_url, rating, category) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [title, description, price, duration, location, country, image_url, rating || 4.5, category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании тура' });
  }
});

router.put('/:id', auth, role('admin', 'agent'), async (req, res) => {
  try {
    const { title, description, price, duration, location, country, image_url, rating, category, available } = req.body;
    const result = await pool.query(
      'UPDATE tours SET title=$1, description=$2, price=$3, duration=$4, location=$5, country=$6, image_url=$7, rating=$8, category=$9, available=$10 WHERE id=$11 RETURNING *',
      [title, description, price, duration, location, country, image_url, rating, category, available, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Тур не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении тура' });
  }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM tours WHERE id=$1', [req.params.id]);
    res.json({ message: 'Тур удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении тура' });
  }
});

module.exports = router;
