import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@agora.com';
    const password = '@G0R4';

    console.log(`Creating admin user: ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN', // Ensure role is ADMIN
            emailVerified: new Date(), // Ensure verified
        },
        create: {
            email,
            name: 'Admin',
            password: hashedPassword,
            role: 'ADMIN',
            emailVerified: new Date(),
        },
    });

    console.log(`✅ Admin user ready: ${user.email} (Role: ${user.role})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
