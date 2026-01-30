
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("🔍 Verifying Seeded Venues...");
        const venues = await prisma.venue.findMany({
            take: 3,
            include: {
                subcategories: { include: { subcategory: true } },
                facilities: true
            }
        });

        console.log(`Found ${venues.length} venues.`);
        for (const v of venues) {
            console.log(`\n- ${v.name} (${v.mainCategory})`);
            console.log(`  Address: ${v.address}`);
            console.log(`  FB: ${v.facebookUrl || 'N/A'}`);
            console.log(`  Rating: ${v.rating.toFixed(2)}`);
            console.log(`  Subcats: ${v.subcategories.map(s => s.subcategory.name).join(', ')}`);
        }
    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
