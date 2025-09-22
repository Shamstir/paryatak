const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/zones/
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM zones;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;