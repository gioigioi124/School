import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Confirming emails for phone users in auth.users...");

  // 1. Confirm all existing users in auth.users
  const confirmedCount = await prisma.$executeRawUnsafe(`
    UPDATE auth.users 
    SET email_confirmed_at = NOW(), confirmed_at = NOW() 
    WHERE email_confirmed_at IS NULL;
  `);
  console.log(`Updated ${confirmedCount} unconfirmed users in auth.users.`);

  // 2. Create trigger to automatically confirm any future @kinderly.com phone accounts
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION auto_confirm_phone_users()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.email LIKE '%@kinderly.com' OR NEW.email LIKE '%@phone.kinderly.edu' THEN
        NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
        NEW.confirmed_at = COALESCE(NEW.confirmed_at, NOW());
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
  console.log("Created automatic email confirmation trigger for phone users.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
