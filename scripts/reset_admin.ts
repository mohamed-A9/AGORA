
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.log("Usage: npx tsx scripts/reset_admin.ts <email> <password>");
        return;
    }

    console.log(`Resetting/Creating Admin: ${email}...`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: new Date(),
                isOnboardingCompleted: true
            },
            create: {
                email,
                name: "Admin User",
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: new Date(),
                isOnboardingCompleted: true
            }
        });

        console.log(`✅ Success! User ${user.email} is ready.`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password: ${password}`);
        console.log(`   Verified: ${user.emailVerified}`);

    } catch (error) {
        console.error("Error:", error);
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
