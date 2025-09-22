const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/v1/alerts/panic
router.post('/panic', async (req, res) => {
  const { tourist_id, location } = req.body;
  try {
    // 1. Save the new alert in the 'alerts' table
    const alertQuery = `
      INSERT INTO alerts (tourist_id, location, alert_type)
      VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4)
      RETURNING *;
    `;
    const alertResult = await db.query(alertQuery, [tourist_id, location.lng, location.lat, 'Panic']);

    // 2. Geospatial query to find the nearest police unit
    const nearestUnitQuery = `
      SELECT id, name, contact_number, ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance
      FROM police_units
      ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326))
      LIMIT 1;
    `;
    const nearestUnit = await db.query(nearestUnitQuery, [location.lng, location.lat]);

    // 3. Update the alert with the dispatched police unit's ID
    if (nearestUnit.rows.length > 0) {
      await db.query('UPDATE alerts SET police_unit_id = $1, status = $2 WHERE id = $3', 
        [nearestUnit.rows[0].id, 'Dispatched', alertResult.rows[0].id]);
    }

    res.status(201).json({
      status: 'Panic alert received and dispatched',
      alert_id: alertResult.rows[0].id,
      dispatched_to: nearestUnit.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/v1/alerts/:id/resolve
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { rows } = await db.query('UPDATE alerts SET status = $1 WHERE id = $2 RETURNING *', ['Resolved', req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ message: `Alert ${req.params.id} has been resolved.` });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;