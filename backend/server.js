require('dotenv').config();
const express = require('express');
const pool = require('./src/config/postgres'); // Ajusta la ruta si es necesario
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sirve archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/src')));

//Routes 
const loginRoutes = require('./src/routes/login.routes');
const favoriteRoutes = require('./src/routes/favorite.routes');
const registerRoutes = require('./src/routes/register.routes');

//Endpoints
app.use('/api/login', loginRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/register', registerRoutes);




app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en puerto ${PORT}`);
});