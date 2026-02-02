import { prisma } from "./lib/prisma";

async function checkVenues() {
    // Check total venues
    const total = await prisma.venue.count();
    console.log(`\n📊 Total venues: ${total}`);

    // Check by category
    const byCategory = await prisma.venue.groupBy({
        by: ['mainCategory'],
        _count: true
    });

    console.log("\n📂 By Category:");
    for (const cat of byCategory) {
        console.log(`   ${cat.mainCategory}: ${cat._count}`);
    }

    // Check cities
    const cities = await prisma.city.findMany({
        include: {
            _count: {
                select: { venues: true }
            }
        }
    });

    console.log("\n🏙️  By City:");
    for (const city of cities) {
        console.log(`   ${city.name}: ${city._count.venues} venues`);
    }

    // Sample cafés in Casablanca
    const casablanca = await prisma.city.findFirst({
        where: { name: "Casablanca" }
    });

    if (casablanca) {
        const cafes = await prisma.venue.findMany({
            where: {
                mainCategory: "CAFE",
                cityId: casablanca.id
            },
            select: {
                name: true,
                address: true
            },
            take: 5
        });

        console.log(`\n☕ Sample Cafés in Casablanca (${cafes.length}):`);
        cafes.forEach(c => console.log(`   - ${c.name}`));
    } else {
        console.log("\n⚠️  Casablanca city not found in database");
    }

    await prisma.$disconnect();
}

checkVenues();
