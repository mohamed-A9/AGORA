
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking specific broken venues...");
    const names = ["Espressolab", "PAUL"];

    const venues = await prisma.venue.findMany({
        where: { name: { in: names } },
        select: { id: true, name: true, coverImageUrl: true, gallery: true }
    });

    venues.forEach(v => {
        console.log(`\nVenue: ${v.name}`);
        console.log(`Cover URL: '${v.coverImageUrl}'`);
        console.log(`Gallery Count: ${v.gallery.length}`);
        if (v.gallery.length > 0) {
            console.log(`Gallery[0] Kind: ${v.gallery[0].kind}`);
            console.log(`Gallery[0] URL: '${v.gallery[0].url}'`);
        }
    });
}

main();
