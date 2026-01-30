// TEST: Check if drafts are being created
// Run this in your database or Prisma Studio

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDrafts() {
    console.log('🔍 Checking for DRAFT venues...\n');

    const drafts = await prisma.venue.findMany({
        where: { status: 'DRAFT' },
        select: {
            id: true,
            name: true,
            status: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
            wizardStep: true
        },
        orderBy: { createdAt: 'desc' }
    });

    if (drafts.length === 0) {
        console.log('❌ No DRAFT venues found in database');
        console.log('\nThis means:');
        console.log('1. The empty-draft API is not being called');
        console.log('2. Or the API is failing silently');
        console.log('3. Or drafts are being created but status is not DRAFT');
    } else {
        console.log(`✅ Found ${drafts.length} DRAFT venue(s):\n`);
        drafts.forEach((draft, idx) => {
            console.log(`${idx + 1}. ${draft.name}`);
            console.log(`   ID: ${draft.id}`);
            console.log(`   Owner: ${draft.ownerId}`);
            console.log(`   Step: ${draft.wizardStep || 'N/A'}`);
            console.log(`   Created: ${draft.createdAt}`);
            console.log(`   Updated: ${draft.updatedAt}`);
            console.log('');
        });
    }

    // Also check all venue statuses
    const statusCount = await prisma.venue.groupBy({
        by: ['status'],
        _count: true
    });

    console.log('\n📊 Venue Status Breakdown:');
    statusCount.forEach(item => {
        console.log(`   ${item.status}: ${item._count} venues`);
    });

    await prisma.$disconnect();
}

checkDrafts().catch(console.error);
