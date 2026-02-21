
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Searching for venues pending approval...");

    const venues = await prisma.venue.findMany({
        where: {
            OR: [
                { status: 'PENDING_APPROVAL' },
                { status: 'PENDING' } // Handle potential legacy or mismatch
            ]
        },
        include: {
            owner: {
                select: { email: true, name: true }
            }
        }
    });

    if (venues.length === 0) {
        console.log("✅ No venues are currently pending approval.");
        return;
    }

    console.log(`found ${venues.length} pending venues:`);
    console.table(venues.map(v => ({
        ID: v.id,
        Name: v.name,
        Status: v.status,
        Owner: v.owner?.email
    })));

    console.log("\nTo approve a venue, run:");
    console.log("npx tsx scripts/approve_venue.ts <VENUE_ID>");
    console.log("\nTo reject a venue, run:");
    console.log("npx tsx scripts/reject_venue.ts <VENUE_ID> \"Reason for rejection\"");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
