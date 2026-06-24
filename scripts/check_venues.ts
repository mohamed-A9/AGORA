import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
    const venues = await p.venue.findMany({
        where: { status: 'APPROVED' },
        select: { name: true, isActive: true, status: true }
    });
    console.log("Approved venues:");
    for (const v of venues) {
        console.log("  " + v.name + " | isActive=" + v.isActive);
    }
    console.log("Total: " + venues.length);
    await p.$disconnect();
}
main();
