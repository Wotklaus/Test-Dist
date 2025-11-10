const express = require('express');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const sqlFiles = [
  path.join(__dirname, '../db/2-schema.sql'),
  path.join(__dirname, '../db/3-procedure.sql'),
  path.join(__dirname, '../db/4-backup.sql')
];

router.get('/import-sql', async (req, res) => {
  const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    for (const file of sqlFiles) {
      if (!fs.existsSync(file)) {
        return res.status(500).send(`SQL file not found: ${file}`);
      }
      const sql = fs.readFileSync(file, 'utf8');
      await client.query(sql);
    }
    await client.end();
    return res.send('All SQL scripts imported successfully!');
  } catch (err) {
    await client.end();
    return res.status(500).send('Error importing SQL scripts: ' + err.message);
  }
});

module.exports = router;