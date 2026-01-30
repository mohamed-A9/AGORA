
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying Organic Kitchen Category...");
    const venue = await prisma.venue.findFirst({
        where: { name: { contains: "Organic Kitchen" } }
    });

    if (venue) {
        console.log(`Venue: ${venue.name}`);
        console.log(`Category: ${venue.mainCategory}`); // Should be RESTAURANT
    } else {
        console.log("❌ Organic Kitchen not found");
    }
}

main();
