require('dotenv').config();
const express = require('express');
const pool = require('./src/config/postgres'); // Ajusta la ruta si es necesario

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint de prueba para ver si hay conexión a la base de datos
app.get('/api/ping', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en puerto ${PORT}`);
});