
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const user = await prisma.user.findFirst({
            select: {
                preferredCities: true,
            }
        });
        console.log("Success: preferredCities exists");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
