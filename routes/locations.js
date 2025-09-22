const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/v1/locations/update
router.post('/update', async (req, res) => {
    const { tourist_id, location } = req.body;
    try {
      // 1. Upsert the tourist's current location
      const locationQuery = `
        INSERT INTO locations (tourist_id, location, timestamp)
        VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), NOW())
        ON CONFLICT (tourist_id)
        DO UPDATE SET location = EXCLUDED.location, timestamp = EXCLUDED.timestamp;
      `;
      await db.query(locationQuery, [tourist_id, location.lng, location.lat]);
  
      // 2. Geo-Fencing check: find if the location is inside a restricted zone
      const zoneQuery = `
        SELECT name, risk_level, is_restricted
        FROM zones
        WHERE ST_Within(ST_SetSRID(ST_MakePoint($1, $2), 4326), boundary)
        LIMIT 1;
      `;
      const zoneResult = await db.query(zoneQuery, [location.lng, location.lat]);
  
      // 3. Trigger alert if inside a restricted zone
      if (zoneResult.rows.length > 0 && zoneResult.rows[0].is_restricted) {
        const geoFenceAlertQuery = `
          INSERT INTO alerts (tourist_id, location, alert_type)
          VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4);
        `;
        await db.query(geoFenceAlertQuery, [tourist_id, location.lng, location.lat, 'Geo-fence']);
        return res.status(200).json({
          status: 'Location updated',
          alert: 'Geo-fence alert triggered'
        });
      }
  
      res.status(200).json({ status: 'Location updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;