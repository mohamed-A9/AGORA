
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listCafes() {
    const cafes = await prisma.venue.findMany({
        where: { mainCategory: 'CAFE' },
        select: { id: true, name: true, coverImageUrl: true }
    });
    console.log(JSON.stringify(cafes, null, 2));
}

listCafes();
