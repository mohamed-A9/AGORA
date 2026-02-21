
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const arg = process.argv[2];

    if (!arg || arg === 'list') {
        console.log("👥 Listing all users:");
        const users = await prisma.user.findMany();
        if (users.length === 0) {
            console.log("   No users found in database.");
        } else {
            console.table(users.map(u => ({
                email: u.email,
                role: u.role,
                name: u.name,
                id: u.id
            })));
        }
        console.log("\n---------------------------------------------------------");
        console.log("Usage:");
        console.log("  npx tsx scripts/make_admin.ts list");
        console.log("  npx tsx scripts/make_admin.ts <email>          (Promote existing user to ADMIN)");
        console.log("  npx tsx scripts/make_admin.ts create <email> <password> (Create NEW Admin user)");
        return;
    }

    if (arg === 'create') {
        const email = process.argv[3];
        const password = process.argv[4];

        if (!email || !password) {
            console.error("❌ Usage: npx tsx scripts/make_admin.ts create <email> <password>");
            return;
        }

        console.log(`🔨 Creating new ADMIN user: ${email}...`);

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    email,
                    name: "Admin User",
                    password: hashedPassword,
                    role: "ADMIN",
                    emailVerified: new Date(), // Auto-verify
                    isOnboardingCompleted: true
                }
            });

            console.log(`✅ Success! Created ADMIN user.`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Password: ${password}`);
            console.log(`   Role: ${user.role}`);
        } catch (e: any) {
            if (e.code === 'P2002') {
                console.error(`❌ User with email ${email} already exists. Use "npx tsx scripts/make_admin.ts ${email}" to promote them instead.`);
            } else {
                console.error("❌ Error creating user:", e);
            }
        }
        return;
    }

    // Default: Promote existing email
    const email = arg;
    console.log(`🔎 Promoting existing user: ${email}...`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            console.log(`   Tip: Use "create" command to make a new user.`);
            return;
        }

        const updated = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });

        console.log(`✅ Success! User ${updated.email} is now an ADMIN.`);
    } catch (error) {
        console.error("Error updating user:", error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
