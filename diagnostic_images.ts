
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const venues = await prisma.venue.findMany({
        select: { name: true, coverImageUrl: true }
    });

    const stats: Record<string, number> = {};
    const samples: Record<string, string[]> = {};

    venues.forEach(v => {
        let category = 'other';
        if (!v.coverImageUrl) category = 'none';
        else if (v.coverImageUrl.includes('agora/venues_real')) category = 'real_cloudinary';
        else if (v.coverImageUrl.includes('cloudinary')) category = 'other_cloudinary';
        else if (v.coverImageUrl.includes('unsplash')) category = 'unsplash';
        else if (v.coverImageUrl.includes('http')) category = 'external_url';

        stats[category] = (stats[category] || 0) + 1;
        if (!samples[category]) samples[category] = [];
        if (samples[category].length < 3) samples[category].push(`${v.name}: ${v.coverImageUrl}`);
    });

    console.log("Image Stats:", stats);
    console.log("Samples:", samples);
}

check().finally(() => prisma.$disconnect());
