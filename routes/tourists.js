const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/v1/tourists/register
router.post('/register', async (req, res) => {
  const { name, passport_aadhaar_id, phone_number, email, zk_commitment } = req.body;
  const query = `
    INSERT INTO tourists (name, passport_aadhaar_id, phone_number, email, zk_commitment)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [name, passport_aadhaar_id, phone_number, email, zk_commitment];

  try {
    const { rows } = await db.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/tourists
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM tourists;');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;