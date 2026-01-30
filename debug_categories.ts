
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking Hammam Ziani category...");
    const venue = await prisma.venue.findFirst({
        where: { name: { contains: "Hammam Ziani" } }
    });

    if (venue) {
        console.log(`Venue: ${venue.name}`);
        console.log(`Category in DB: ${venue.mainCategory}`);
    } else {
        console.log("❌ Hammam Ziani not found in DB");
    }

    console.log("\n🔍 Checking 'Cafe' query...");
    const cafes = await prisma.venue.findMany({
        where: { mainCategory: 'CAFE' },
        select: { name: true, mainCategory: true }
    });
    console.log(`Found ${cafes.length} cafes:`);
    cafes.forEach(c => console.log(`- ${c.name} (${c.mainCategory})`));
}

main();
