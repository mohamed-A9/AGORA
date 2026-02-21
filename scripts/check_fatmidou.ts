
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'fatmidou@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
        select: { email: true, role: true, name: true }
    });

    if (user) {
        console.log(`User: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Name: ${user.name}`);
    } else {
        console.log("User not found");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
