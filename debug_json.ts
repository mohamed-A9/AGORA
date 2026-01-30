
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function debug() {
    console.log('Fetching data...');
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true }
    });
    const venues = await prisma.venue.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, ownerId: true, status: true, owner: { select: { email: true } } }
    });

    const data = {
        users,
        venues
    };

    fs.writeFileSync('debug_data.json', JSON.stringify(data, null, 2));
    console.log('Data written to debug_data.json');
}

debug()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
