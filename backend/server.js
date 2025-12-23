require('dotenv').config();
const express = require('express');
const pool = require('./src/config/postgres');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { extractTokenFromCookies } = require('./src/middlewares/cookieAuth');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.status(200).send('OK');
});


// Para distinguir entre producción y desarrollo/local
const isProduction = process.env.NODE_ENV === "production";
const FRONTEND_URL = isProduction
  ? 'https://test-dist-frontend.onrender.com'     // Cambia esto si tu frontend cambia de URL
  : 'http://localhost:3000';

app.use(cors({
  origin: function(origin, callback) {
    // Permite TODO lo que venga desde un URL de AWS ALB (.elb.amazonaws.com), localhost y tu onrender
    if (!origin) return callback(null, true);
    if (
      origin.includes('elb.amazonaws.com') ||                  // Esto acepta cualquier DNS de ALB de AWS
      origin === 'http://localhost:3000' ||
      origin === 'http://localhost:5173' ||
      origin === 'https://test-dist-frontend.onrender.com'
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// En producción pura podrías dejar solo:
//// app.use(cors({
////   origin: FRONTEND_URL,
////   credentials: true,
////   optionsSuccessStatus: 200
//// }));

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Middlewares
app.use(cookieParser());
app.use(express.json());

// NO uses 'express.static' para servir el frontend si está deployado aparte en otro render.
// La siguiente línea es útil solo si quieres servir archivos frontend EN EL MISMO SERVIDOR (local/dev),
// pero si tu frontend está en otro Render, puedes comentar o quitar.
//// app.use(express.static(path.join(__dirname, '../frontend/src')));

// Routes
const loginRoutes = require('./src/routes/login.routes');
const favoriteRoutes = require('./src/routes/favorite.routes');
const registerRoutes = require('./src/routes/register.routes');
const roleRoutes = require('./src/routes/role.routes');
const historyRoutes = require('./src/routes/history.routes');
const refreshRoutes = require('./src/routes/refresh.routes');
const importRoutes = require('./src/routes/import.routes');

// Protected routes with middleware
app.use('/api/favorites', extractTokenFromCookies);
app.use('/api/history', extractTokenFromCookies);
app.use('/api/refresh', extractTokenFromCookies);

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