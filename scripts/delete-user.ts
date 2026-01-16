
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("Please provide an email address.");
        console.log("Usage: npx tsx scripts/delete-user.ts <email>");
        process.exit(1);
    }

    try {
        const user = await prisma.user.delete({
            where: { email },
        });
        console.log(`✅ User deleted successfully: ${user.email} (ID: ${user.id})`);
    } catch (error: any) {
        if (error.code === 'P2025') {
            console.error(`❌ User not found with email: ${email}`);
        } else {
            console.error("❌ Error deleting user:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
