const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sqlFiles = [
  './db/2-schema.sql',
  './db/3-procedure.sql',
  './db/4-backup.sql'
];

async function importSQL() {
  const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  for (const file of sqlFiles) {
    const filePath = path.resolve(file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Executing: ${file}`);
    await client.query(sql);
  }

  await client.end();
  console.log('All SQL scripts were executed successfully!');
}

importSQL().catch(err => {
  console.error('Error executing SQL scripts:', err);
  process.exit(1);
});