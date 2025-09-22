const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/police_units/
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM police_units;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;