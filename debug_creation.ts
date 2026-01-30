
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCreation() {
    const userEmail = "mohamed.fatih.job@gmail.com";
    console.log(`Fetching user ${userEmail}...`);
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
        console.error("User not found!");
        return;
    }
    console.log("User found:", user.id, user.role);

    console.log("Attempting to create draft venue...");
    try {
        const venue = await prisma.venue.create({
            data: {
                name: "Debug Test Venue",
                slug: `debug-test-venue-${Math.floor(Math.random() * 1000)}`,
                mainCategory: "NIGHTLIFE_BARS",
                status: "DRAFT",
                ownerId: user.id, // Explicitly linking to user
                // wizardStep: 1,
                // city: { connect: { name: "Casablanca" } } // Try connecting city too
            }
        });
        console.log("✅ Success! Created venue:", venue.id);
        console.log("OwnerId:", venue.ownerId);
    } catch (e: any) {
        console.error("❌ Failed to create:", e.message);
        console.error(e);
    }
}

debugCreation()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
