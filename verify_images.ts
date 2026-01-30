
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking Venue Images...");
    const venues = await prisma.venue.findMany({
        take: 5,
        include: { gallery: true }
    });

    venues.forEach(v => {
        console.log(`\nVenue: ${v.name}`);
        console.log(`Cover: ${v.coverImageUrl ? "✅ Found" : "❌ Missing"}`);
        console.log(`Gallery Items: ${v.gallery.length}`);
        if (v.gallery.length > 0) {
            console.log(`Sample item kind: ${v.gallery[0].kind}`); // Check if it says 'image' or 'video'
        }
    });
}

main();
