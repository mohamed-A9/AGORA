
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking ALL Venues for Cover Images...");
    const venues = await prisma.venue.findMany({
        select: { name: true, coverImageUrl: true, gallery: { take: 1 } }
    });

    let missingCount = 0;
    venues.forEach(v => {
        const hasCover = !!v.coverImageUrl;
        const hasGallery = v.gallery.length > 0;

        if (!hasCover && !hasGallery) {
            console.log(`❌ MISSING PHOTO: ${v.name}`);
            missingCount++;
        }
    });

    if (missingCount === 0) {
        console.log(`✅ All ${venues.length} venues have at least a cover or gallery image.`);
    } else {
        console.log(`⚠️ Found ${missingCount} venues with NO photos.`);
    }
}

main();
