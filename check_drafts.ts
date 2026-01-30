import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDrafts() {
    const drafts = await prisma.venue.findMany({
        where: {
            status: 'DRAFT'
        },
        select: {
            id: true,
            name: true,
            ownerId: true,
            status: true,
            wizardStep: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    });

    console.log('\n📋 Recent Draft Venues:');
    console.log('========================');

    if (drafts.length === 0) {
        console.log('❌ No drafts found in the database');
    } else {
        drafts.forEach((draft, i) => {
            console.log(`\n${i + 1}. ${draft.name || '(Unnamed)'}`);
            console.log(`   ID: ${draft.id}`);
            console.log(`   Owner: ${draft.ownerId || 'None'}`);
            console.log(`   Status: ${draft.status}`);
            console.log(`   Step: ${draft.wizardStep || 1}`);
            console.log(`   Created: ${draft.createdAt.toLocaleString()}`);
        });
    }

    await prisma.$disconnect();
}

checkDrafts().catch(console.error);
