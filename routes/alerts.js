const express = require('express');
const router = express.Router();
const db = require('../db');

module.exports = function(io) {
  // POST /api/v1/alerts/panic
  router.post('/panic', async (req, res) => {
    const { tourist_id, location } = req.body; // location is expected as { lat: 12.34, lng: 56.78 }
    try {
      // 1. Save the new alert
      const alertQuery = `
        INSERT INTO alerts (tourist_id, location, alert_type)
        VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), 'Panic')
        RETURNING *;
      `;
      const alertResult = await db.query(alertQuery, [tourist_id, location.lng, location.lat]);
      const newAlert = alertResult.rows[0];

      // 2. Find the nearest police unit
      const nearestUnitQuery = `
        SELECT id, name, contact_number, ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance
        FROM police_units
        ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326))
        LIMIT 1;
      `;
      const nearestUnitResult = await db.query(nearestUnitQuery, [location.lng, location.lat]);
      const dispatchedUnit = nearestUnitResult.rows.length > 0 ? nearestUnitResult.rows[0] : null;

      // 3. Update the alert with the dispatched unit
      if (dispatchedUnit) {
        await db.query('UPDATE alerts SET police_unit_id = $1, status = $2 WHERE id = $3',
          [dispatchedUnit.id, 'Dispatched', newAlert.id]);
      }
      // 4. Broadcast the complete alert object to all connected dashboards
      const fullAlertDetails = {
        ...newAlert,
        status: 'Dispatched',
        dispatched_to: dispatchedUnit
      };
      io.emit('new-alert', fullAlertDetails);
      console.log('📢 Alert dispatched to all dashboards in real-time.');

      res.status(201).json({
        status: 'Panic alert received and dispatched',
        data: fullAlertDetails
      });

    } catch (err) {
      console.error("Error in panic alert:", err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

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

  return router;
};