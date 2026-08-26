const { Pool } = require('pg');

const connectionString = "postgresql://postgres.pcodugriamvwuzkjpcjd:Gioigioi124@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
const pool = new Pool({ connectionString });

async function run() {
  console.log("Connecting to PostgreSQL...");
  const client = await pool.connect();
  try {
    // 1. Confirm all existing users in auth.users
    const res = await client.query(`
      UPDATE auth.users 
      SET email_confirmed_at = NOW() 
      WHERE email_confirmed_at IS NULL;
    `);
    console.log(`Successfully confirmed ${res.rowCount} users in auth.users.`);

    // 2. Add automatic confirmation trigger for phone users
    await client.query(`
      CREATE OR REPLACE FUNCTION auto_confirm_phone_users()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.email LIKE '%@kinderly.com' OR NEW.email LIKE '%@phone.kinderly.edu' THEN
          NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS tr_auto_confirm_phone_users ON auth.users;
      CREATE TRIGGER tr_auto_confirm_phone_users
      BEFORE INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION auto_confirm_phone_users();
    `);
    console.log("Successfully created auto_confirm_phone_users trigger on auth.users!");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
