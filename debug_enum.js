
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking Enum in DB...");
        // Raw query to get enum values
        const result = await prisma.$queryRaw`SELECT unnest(enum_range(NULL::"MainCategory")) as label`;
        console.log("Enum Labels:", result);

        console.log("Checking specific count...");
        const count = await prisma.venue.count({
            where: { mainCategory: 'WELLNESS_HEALTH' }
        });
        console.log(`Found ${count} venues with WELLNESS_HEALTH`);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
