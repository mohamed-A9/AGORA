import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Starting full database cleanup...");

    try {
        // Order matters for some databases, but with Cascade it usually handles it.
        // We'll delete venues and events to ensure total cleanup.

        const deleteEvents = await prisma.event.deleteMany({});
        console.log(`✅ Deleted ${deleteEvents.count} events.`);

        const deleteVenues = await prisma.venue.deleteMany({});
        console.log(`✅ Deleted ${deleteVenues.count} venues.`);

        // Since we have Cascade on delete for relations (Media, Reviews, etc.),
        // deleting the parent Venue/Event records triggers their cleanup automatically.

        console.log("✨ Database cleanup complete. All venues and related data have been removed.");
    } catch (error) {
        console.error("❌ Error during cleanup:", error);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
