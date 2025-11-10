require('dotenv').config();
const express = require('express');
const pool = require('./src/config/postgres');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // NEW: For reading cookies
const { extractTokenFromCookies } = require('./src/middlewares/cookieAuth'); // NEW: Cookie middleware

const app = express();
const PORT = process.env.PORT || 3000;

// NEW: Cookie parser middleware
app.use(cookieParser());

// CORS configuration - UPDATED for cookies
app.use(cors({
    origin: true, // In development accepts any origin
    credentials: true // IMPORTANT: Required for sending/receiving cookies
}));

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
const importRoutes = require('./src/routes/import.routes');


// NEW: Apply cookie middleware to protected routes
app.use('/api/favorites', extractTokenFromCookies); // Extract token from cookies before JWT verification
app.use('/api/history', extractTokenFromCookies);   // Apply to any other protected routes
app.use('/api/refresh', extractTokenFromCookies);   // For refresh endpoint too


// Endpoints
app.use('/api/login', loginRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/refresh', refreshRoutes);
app.use('/api/import', importRoutes);

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});