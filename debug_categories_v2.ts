
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- START DEBUG ---");
    const venues = await prisma.venue.findMany({
        where: { name: { contains: "Hammam" } }
    });

    if (venues.length === 0) {
        console.log("No venues found with 'Hammam' in name.");
    } else {
        venues.forEach(v => {
            console.log(`Venue: "${v.name}"`);
            console.log(`ID: ${v.id}`);
            console.log(`MainCategory: ${v.mainCategory}`);
        });
    }

    console.log("\nChecking Total CAFE count:");
    const cafeCount = await prisma.venue.count({ where: { mainCategory: 'CAFE' } });
    console.log(`Total CAFE venues: ${cafeCount}`);

    console.log("--- END DEBUG ---");
}

main();
