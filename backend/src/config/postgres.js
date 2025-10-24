require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
});

pool.connect()
    .then(() => console.log("Conectado a PostgreSQL"))
    .catch(err => {
        console.error("Error al conectar PostgreSQL", err.message);
        process.exit(1);
    });

module.exports = pool;