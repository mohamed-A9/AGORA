
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function debugCreation() {
    const userEmail = "mohamed.fatih.job@gmail.com";
    const log = [];

    try {
        log.push(`Fetching user ${userEmail}...`);
        const user = await prisma.user.findUnique({ where: { email: userEmail } });

        if (!user) {
            log.push("User not found!");
            fs.writeFileSync('debug_result.json', JSON.stringify({ log }, null, 2));
            return;
        }
        log.push(`User found: ${user.id}`);

        log.push("Attempting to create draft venue (NO CITY)...");

        // Mimic createVenueDraft exactly
        const venue = await prisma.venue.create({
            data: {
                name: "Debug Test Venue 2",
                slug: `debug-test-venue-2-${Math.floor(Math.random() * 1000)}`,
                mainCategory: "NIGHTLIFE_BARS",
                status: "DRAFT",
                ownerId: user.id,
                wizardStep: 1,
                // NO CITY connection here
            }
        });
        log.push(`✅ Success! Created venue: ${venue.id}`);

    } catch (e: any) {
        log.push(`❌ Failed to create: ${e.message}`);
        log.push(`Error Code: ${e.code}`);
        log.push(`Error Meta: ${JSON.stringify(e.meta)}`);
    }

    fs.writeFileSync('debug_result.json', JSON.stringify({ log }, null, 2));
}

debugCreation()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
