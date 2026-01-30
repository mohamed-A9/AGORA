import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDraftWorkflow() {
    console.log('\n🧪 DRAFT WORKFLOW TEST\n' + '='.repeat(50) + '\n');

    // 1. Count existing drafts
    const draftCount = await prisma.venue.count({
        where: { status: 'DRAFT' }
    });
    console.log(`📊 Current draft count: ${draftCount}`);

    // 2. Show recent drafts
    const recentDrafts = await prisma.venue.findMany({
        where: { status: 'DRAFT' },
        select: {
            id: true,
            name: true,
            ownerId: true,
            wizardStep: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    if (recentDrafts.length === 0) {
        console.log('\n❌ No drafts found!');
        console.log('   Please create a draft by:');
        console.log('   1. Go to http://localhost:3000/business/add-venue');
        console.log('   2. Fill Step 1 (name + category)');
        console.log('   3. Click "Continue to Location"');
    } else {
        console.log('\n✅ Recent Drafts:');
        recentDrafts.forEach((draft, i) => {
            console.log(`\n${i + 1}. ${draft.name || '(Unnamed)'}`);
            console.log(`   ID: ${draft.id}`);
            console.log(`   Owner: ${draft.ownerId}`);
            console.log(`   Wizard Step: ${draft.wizardStep || 1}`);
            console.log(`   Created: ${draft.createdAt.toLocaleString()}`);
            console.log(`   Updated: ${draft.updatedAt.toLocaleString()}`);

            const age = Date.now() - draft.createdAt.getTime();
            const ageMinutes = Math.floor(age / 1000 / 60);
            console.log(`   Age: ${ageMinutes} minute(s) ago`);
        });
    }

    // 3. Check for orphaned venue IDs in database
    const allVenues = await prisma.venue.findMany({
        select: { id: true, status: true }
    });

    console.log(`\n📈 Total venues in database: ${allVenues.length}`);
    console.log(`   - Drafts: ${allVenues.filter(v => v.status === 'DRAFT').length}`);
    console.log(`   - Pending: ${allVenues.filter(v => v.status === 'PENDING').length}`);
    console.log(`   - Approved: ${allVenues.filter(v => v.status === 'APPROVED').length}`);

    await prisma.$disconnect();
}

testDraftWorkflow().catch(console.error);
