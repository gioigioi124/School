"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
async function main() {
    console.log('Fixing profiles and assigning admin role...');
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.pcodugriamvwuzkjpcjd:Gioigioi124@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';
    const client = new pg_1.Client({
        connectionString,
    });
    await client.connect();
    try {
        const usersRes = await client.query(`SELECT id, email FROM auth.users`);
        if (usersRes.rows.length === 0) {
            console.log('No users found in auth.users.');
            return;
        }
        console.log(`Found ${usersRes.rows.length} users in auth.users.`);
        const roleRes = await client.query(`SELECT id FROM roles WHERE name = 'admin'`);
        let roleId;
        if (roleRes.rows.length === 0) {
            const insertRole = await client.query(`
        INSERT INTO roles (id, name, description, "createdAt")
        VALUES (gen_random_uuid(), 'admin', 'Administrator with full access', NOW())
        RETURNING id
      `);
            roleId = insertRole.rows[0].id;
            console.log('Created admin role.');
        }
        else {
            roleId = roleRes.rows[0].id;
        }
        for (const user of usersRes.rows) {
            const profileRes = await client.query(`SELECT id FROM profiles WHERE id = $1`, [user.id]);
            if (profileRes.rows.length === 0) {
                await client.query(`
          INSERT INTO profiles (id, email, "displayName", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, NOW(), NOW())
        `, [user.id, user.email, 'Admin User']);
                console.log(`Created missing profile for ${user.email}`);
            }
            const assignRes = await client.query(`
        SELECT id FROM role_assignments 
        WHERE "profileId" = $1 AND "roleId" = $2
      `, [user.id, roleId]);
            if (assignRes.rows.length === 0) {
                await client.query(`
          INSERT INTO role_assignments (id, "profileId", "roleId", "createdAt")
          VALUES (gen_random_uuid(), $1, $2, NOW())
        `, [user.id, roleId]);
                console.log(`Assigned admin role to: ${user.email}`);
            }
            else {
                console.log(`User already has admin role: ${user.email}`);
            }
        }
        console.log('\n✅ Successfully processed users!');
    }
    finally {
        await client.end();
    }
}
main().catch(console.error);
//# sourceMappingURL=seed-admin.js.map