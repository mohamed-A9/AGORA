import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Fix all approved venues that have isActive=false
    const result = await prisma.venue.updateMany({
        where: { status: 'APPROVED', isActive: false },
        data: { isActive: true }
    });
    console.log(`Updated ${result.count} approved venues to isActive=true`);

    // Show all approved venues
    const approved = await prisma.venue.findMany({
        where: { status: 'APPROVED' },
        select: { id: true, name: true, isActive: true, status: true }
    });
    console.log(`\nAll approved venues (${approved.length}):`);
    approved.forEach(v => {
        console.log(`  - ${v.name} | status=${v.status} | isActive=${v.isActive}`);
    });

    await prisma.$disconnect();
}

main();
