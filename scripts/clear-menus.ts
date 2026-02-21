import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearMenus() {
    console.log("🗑️  Deleting all menu/PDF entries from VenueMedia...");

    const deleted = await prisma.venueMedia.deleteMany({
        where: {
            OR: [
                { kind: "menu" },
                { kind: "pdf" },
                { url: { contains: ".pdf" } },
            ]
        }
    });

    console.log(`✅ Deleted ${deleted.count} media entries.`);

    console.log("🗑️  Clearing menuUrl on all Venues...");
    const updated = await prisma.venue.updateMany({
        where: { menuUrl: { not: null } },
        data: { menuUrl: null }
    });

    console.log(`✅ Cleared menuUrl on ${updated.count} venues.`);
    console.log("\n🎉 Done! All menus/PDFs removed from the database.");

    await prisma.$disconnect();
}

clearMenus().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
