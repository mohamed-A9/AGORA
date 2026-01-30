
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugVenues() {
    console.log('🔍 Listing last 10 venues in database...');

    const venues = await prisma.venue.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            owner: {
                select: { id: true, name: true, email: true, role: true }
            }
        }
    });

    if (venues.length === 0) {
        console.log('❌ No venues found in database.');
    } else {
        venues.forEach(v => {
            console.log('--------------------------------------------------');
            console.log(`ID: ${v.id}`);
            console.log(`Name: "${v.name}"`);
            console.log(`Status: ${v.status}`);
            console.log(`Owner: ${v.owner?.email} (${v.owner?.role}) [ID: ${v.ownerId}]`);
            console.log(`WizardStep: ${v.wizardStep}`);
            console.log(`Created: ${v.createdAt.toISOString()}`);
        });
    }

    console.log('\n🔍 Check Complete.');
}

debugVenues()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
