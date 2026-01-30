import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // @ts-ignore
    if (prisma.reservation) {
        console.log('✅ Reservation model EXISTS');
        // @ts-ignore
        const count = await prisma.reservation.count();
        console.log('Count:', count);
    } else {
        console.log('❌ Reservation model MISSING');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
