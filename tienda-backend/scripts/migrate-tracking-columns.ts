import 'dotenv/config';
import { Pool } from 'pg';

async function runSafeMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log("Connecting to PostgreSQL...");
  const client = await pool.connect();

  try {
    console.log("Applying non-destructive tracking and escrow columns to VendorOrder...");
    await client.query(`
      ALTER TABLE "VendorOrder" 
      ADD COLUMN IF NOT EXISTS "deliveryStatus" TEXT DEFAULT 'PENDING_DISPATCH',
      ADD COLUMN IF NOT EXISTS "shippingCourier" TEXT,
      ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT,
      ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "dispatchedAt" TIMESTAMP WITH TIME ZONE;
    `);

    console.log("Columns added successfully!");
    
    // Verify
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'VendorOrder'
      ORDER BY ordinal_position;
    `);
    console.log("Current VendorOrder columns in database:", res.rows.map(r => r.column_name));

  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSafeMigration();
