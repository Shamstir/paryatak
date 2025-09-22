const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/v1/itineraries/
router.post('/', async (req, res) => {
  const { tourist_id, start_date, end_date, planned_route } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO itineraries (tourist_id, start_date, end_date, planned_route) VALUES ($1, $2, $3, $4) RETURNING *',
      [tourist_id, start_date, end_date, planned_route]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/itineraries/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM itineraries WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;