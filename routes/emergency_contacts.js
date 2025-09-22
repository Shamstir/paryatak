const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/v1/emergency_contacts/
router.post('/', async (req, res) => {
  const { tourist_id, name, phone_number } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO emergency_contacts (tourist_id, name, phone_number) VALUES ($1, $2, $3) RETURNING *',
      [tourist_id, name, phone_number]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/emergency_contacts/:tourist_id
router.get('/:tourist_id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM emergency_contacts WHERE tourist_id = $1', [req.params.tourist_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;