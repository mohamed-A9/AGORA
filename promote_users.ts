import { prisma } from "./lib/prisma";

async function main() {
    try {
        const res = await prisma.user.updateMany({
            data: { role: "BUSINESS" }
        });
        console.log(`Updated ${res.count} users to BUSINESS role.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
