import { prisma } from "./lib/prisma";

async function checkWizardStep() {
    const venueId = process.argv[2];

    if (!venueId) {
        console.log("Usage: node check_wizard_step.ts <venue-id>");
        process.exit(1);
    }

    const venue = await prisma.venue.findUnique({
        where: { id: venueId },
        select: {
            id: true,
            name: true,
            wizardStep: true,
            status: true
        }
    });

    if (!venue) {
        console.log("❌ Venue not found");
        return;
    }

    console.log("\n📊 Venue Wizard Progress:");
    console.log("========================");
    console.log(`Name: ${venue.name}`);
    console.log(`ID: ${venue.id}`);
    console.log(`Status: ${venue.status}`);
    console.log(`wizardStep in DB: ${venue.wizardStep}`);
    console.log("========================\n");

    if (!venue.wizardStep || venue.wizardStep === 1) {
        console.log("⚠️ This venue has not progressed past step 1!");
        console.log("   This is why you're not seeing green steps.");
    } else {
        console.log(`✅ Expected green steps: 1 through ${venue.wizardStep - 1}`);
        console.log(`✅ Current step should be: ${venue.wizardStep}`);
    }

    await prisma.$disconnect();
}

checkWizardStep();
