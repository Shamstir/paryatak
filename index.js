const express = require('express');
const http = require('http');
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

const port = 3000;

app.use(express.json());

// Import all your API routers
const touristRoutes = require('./routes/tourists');
const locationRoutes = require('./routes/locations');
const itinerariesRoutes = require('./routes/itineraries');
const emergencyContactsRoutes = require('./routes/emergency_contacts');
const policeUnitsRoutes = require('./routes/police_units');
const zonesRoutes = require('./routes/zones');
const alertsRoutes = require('./routes/alerts')(io);

// Connect all the routers to their API endpoints
app.use('/api/v1/tourists', touristRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/itineraries', itinerariesRoutes);
app.use('/api/v1/emergency_contacts', emergencyContactsRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/police_units', policeUnitsRoutes);
app.use('/api/v1/zones', zonesRoutes);

io.on('connection', (socket) => {
  console.log('Dashboard connected via WebSocket!!!:',socket.id);
  socket.on('disconnect', () => {
    console.log('Dashboard disconnected:',socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});