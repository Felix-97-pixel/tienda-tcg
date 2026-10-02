import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT * FROM \"StoreSetting\" WHERE key LIKE 'MP_%'");
  console.log("Settings found in DB:", res.rows);
  await client.end();
}
run();
