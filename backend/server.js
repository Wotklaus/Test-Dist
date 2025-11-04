require('dotenv').config();
const express = require('express');
const pool = require('./src/config/postgres'); // Adjust path if necessary
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/src')));

// Routes
const loginRoutes = require('./src/routes/login.routes');
const favoriteRoutes = require('./src/routes/favorite.routes');
const registerRoutes = require('./src/routes/register.routes');
const roleRoutes = require('./src/routes/role.routes');
const historyRoutes = require('./src/routes/history.routes');
const refreshRoutes = require('./src/routes/refresh.routes');


// Endpoints
app.use('/api/login', loginRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/refresh', refreshRoutes);

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});