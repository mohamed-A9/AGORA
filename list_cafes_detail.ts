
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listCafes() {
    const cafes = await prisma.venue.findMany({
        where: { mainCategory: 'CAFE' },
        include: { gallery: true }
    });
    console.log(JSON.stringify(cafes.map(c => ({
        name: c.name,
        coverImageUrl: c.coverImageUrl,
        galleryCount: c.gallery.length,
        firstGalleryUrl: c.gallery[0]?.url
    })), null, 2));
}

listCafes();
