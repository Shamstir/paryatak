const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Import all your API routers
const touristRoutes = require('./routes/tourists');
const locationRoutes = require('./routes/locations');
const itinerariesRoutes = require('./routes/itineraries');
const emergencyContactsRoutes = require('./routes/emergency_contacts');
const alertsRoutes = require('./routes/alerts');
const policeUnitsRoutes = require('./routes/police_units');
const zonesRoutes = require('./routes/zones');

// Connect all the routers to their API endpoints
app.use('/api/v1/tourists', touristRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/itineraries', itinerariesRoutes);
app.use('/api/v1/emergency_contacts', emergencyContactsRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/police_units', policeUnitsRoutes);
app.use('/api/v1/zones', zonesRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});