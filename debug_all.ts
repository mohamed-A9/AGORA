
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function debugAllJson() {
    const venues = await prisma.venue.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, ownerId: true, status: true, owner: { select: { email: true } } }
    });
    fs.writeFileSync('debug_all.json', JSON.stringify(venues, null, 2));
}

debugAllJson()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
