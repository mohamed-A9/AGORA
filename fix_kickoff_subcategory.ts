import { prisma } from "./lib/prisma";

async function fixKickOff() {
    try {
        const venue = await prisma.venue.findFirst({
            where: { name: { contains: "kick", mode: "insensitive" } }
        });

        if (!venue) {
            console.log("❌ Venue not found");
            return;
        }

        // First, delete any existing subcategories
        await prisma.venueSubcategory.deleteMany({
            where: { venueId: venue.id }
        });

        // Add a subcategory for testing (Sports Bar)
        await prisma.venueSubcategory.create({
            data: {
                venue: { connect: { id: venue.id } },
                subcategory: {
                    connectOrCreate: {
                        where: { slug: "sports-bar" },
                        create: {
                            name: "Sports Bar",
                            slug: "sports-bar",
                            mainCategory: venue.mainCategory
                        }
                    }
                }
            }
        });

        console.log("✅ Added 'Sports Bar' subcategory to Kick Off");
        console.log("Now try editing the venue to see if it shows up!");

    } catch (error: any) {
        console.error("Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixKickOff();
