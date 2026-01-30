
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listAllVenues() {
    const venues = await prisma.venue.findMany({
        include: {
            city: true,
            subcategories: { include: { subcategory: true } }
        }
    });

    console.log(`Total Venues: ${venues.length}`);
    venues.forEach(v => {
        console.log(`-----------------------------------`);
        console.log(`Name: ${v.name}`);
        console.log(`Category: ${v.mainCategory}`);
        console.log(`City: ${v.city?.name}`);
        console.log(`Image: ${v.coverImageUrl}`);
        console.log(`Subcategories: ${v.subcategories.map(s => s.subcategory.name).join(', ')}`);
    });
}

listAllVenues()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
