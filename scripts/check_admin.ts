
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@agora.com';
    const user = await prisma.user.findUnique({
        where: { email },
        select: { email: true, role: true, emailVerified: true }
    });

    console.log("Admin User Check:", user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
