import { prisma } from "./lib/prisma";
import fs from "fs";

async function checkKickOff() {
    try {
        const venue = await prisma.venue.findFirst({
            where: {
                name: {
                    contains: "kick",
                    mode: "insensitive"
                }
            },
            include: {
                gallery: true,
                subcategories: {
                    include: {
                        subcategory: true
                    }
                },
                cuisines: {
                    include: {
                        cuisine: true
                    }
                },
                vibes: {
                    include: {
                        vibe: true
                    }
                }
            }
        });

        if (!venue) {
            console.log("❌ Kick Off venue not found");
            return;
        }

        const report = {
            name: venue.name,
            id: venue.id,
            mainCategory: venue.mainCategory,
            status: venue.status,
            galleryCount: venue.gallery?.length || 0,
            gallery: venue.gallery || [],
            subcategoriesCount: venue.subcategories?.length || 0,
            subcategories: venue.subcategories || [],
            cuisinesCount: venue.cuisines?.length || 0,
            cuisines: venue.cuisines || [],
            vibesCount: venue.vibes?.length || 0,
            vibes: venue.vibes || []
        };

        fs.writeFileSync("kickoff_data.json", JSON.stringify(report, null, 2));

        console.log("✅ Venue:", venue.name);
        console.log("Gallery items:", venue.gallery?.length || 0);
        console.log("Subcategories:", venue.subcategories?.length || 0);
        console.log("\n📄 Full data written to kickoff_data.json");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkKickOff();
