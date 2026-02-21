
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const venueId = process.argv[2];

    if (!venueId) {
        console.log("Usage: npx tsx scripts/approve_venue.ts <VENUE_ID>");
        console.log("Example: npx tsx scripts/approve_venue.ts clv7xg... ");
        process.exit(1);
    }

    console.log(`Approving venue ${venueId}...`);

    try {
        const venue = await prisma.venue.findUnique({
            where: { id: venueId },
            include: { owner: true }
        });

        if (!venue) {
            console.error("Venue not found!");
            process.exit(1);
        }

        // Approve Venue
        await prisma.venue.update({
            where: { id: venueId },
            data: {
                status: 'APPROVED',
                rejectionReason: null, // Clear any previous rejection
                isVerified: true, // Auto-verify on approval? Maybe keep separated. Let it stay false until Launch?
                // Wait, 'isVerified' usually means "Identity Verified".
                // Keep it false until launch? Or true? Status APPROVED implies verified.
                // Let's set it true.
            }
        });

        console.log(`✅ Venue ${venue.name} is now APPROVED.`);
        console.log(`   Owner: ${venue.ownerId}`);

        // Create Notification
        try {
            if ((prisma as any).notification) {
                await (prisma as any).notification.create({
                    data: {
                        userId: venue.ownerId,
                        title: "Venue Approved!",
                        message: `Great news! "${venue.name}" has been approved. You can now launch it to go live.`,
                        type: "SUCCESS",
                        link: `/business/venue/${venueId}` // Or wizard?
                    }
                });
                console.log("🔔 Notification sent to owner.");
            } else {
                console.log("⚠️ Schema might be outdated: 'notification' model not available on PrismaClient. Skipping notification.");
            }
        } catch (notifError) {
            console.error("⚠️ Failed to create notification (DB schema mismatch?):", notifError);
        }

    } catch (error) {
        console.error("Error approving venue:", error);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
