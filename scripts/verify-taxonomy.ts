
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking VenueType...');
    try {
        // @ts-ignore
        const types = await prisma.venueType.findMany();
        console.log('Success! Found ' + types.length + ' types.');
        console.log(JSON.stringify(types.slice(0, 2), null, 2));
    } catch (e) {
        console.error('Error fetching VenueType:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
