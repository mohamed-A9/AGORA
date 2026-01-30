
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking DB for WELLNESS_HEALTH venues...");
        const count = await prisma.venue.count({
            where: { mainCategory: 'WELLNESS_HEALTH' }
        });
        console.log(`Found ${count} venues with WELLNESS_HEALTH`);

        const one = await prisma.venue.findFirst({
            where: { mainCategory: 'WELLNESS_HEALTH' }
        });
        console.log("Sample:", one ? one.name : "None");
    } catch (e) {
        console.error("Error querying WELLNESS_HEALTH:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
