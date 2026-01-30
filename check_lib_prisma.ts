import { prisma } from './lib/prisma';

async function main() {
    // @ts-ignore
    if (prisma.reservation) {
        console.log('✅ LIB/PRISMA: Reservation model EXISTS');
    } else {
        console.log('❌ LIB/PRISMA: Reservation model MISSING');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
