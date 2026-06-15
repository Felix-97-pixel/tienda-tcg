const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_gYIMFey0Tin3@ep-rough-mode-amapumoj-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&pgbouncer=true"
  });
  await client.connect();

  const res = await client.query(`
    SELECT * FROM "_StoreSupportedGames";
  `);

  console.log(JSON.stringify(res.rows, null, 2));

  const games = await client.query(`
    SELECT * FROM "Game";
  `);

  console.log(JSON.stringify(games.rows, null, 2));

  await client.end();
}

main().catch(console.error);
