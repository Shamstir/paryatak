const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Import and use your API routes
const touristRoutes = require('./routes/tourists');
app.use('/api/v1/tourists', touristRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});