
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true }
    });
    console.log("USERS IN DATABASE:");
    console.table(users);
}

run().finally(() => prisma.$disconnect());
