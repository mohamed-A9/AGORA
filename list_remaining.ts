
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const venues = await prisma.venue.findMany({
        where: {
            NOT: {
                coverImageUrl: {
                    contains: 'agora/venues_real'
                }
            }
        },
        select: { name: true, coverImageUrl: true, city: { select: { name: true } } }
    });

    console.log(`TOTAL REMAINING: ${venues.length}`);
    console.log("Samples:");
    venues.slice(0, 10).forEach(v => {
        console.log(`- ${v.name} (${v.city?.name}): ${v.coverImageUrl}`);
    });
}

run().finally(() => prisma.$disconnect());
