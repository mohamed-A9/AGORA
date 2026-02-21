
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const venueId = process.argv[2];
    const reason = process.argv[3];

    if (!venueId || !reason) {
        console.log("Usage: npx tsx scripts/reject_venue.ts <VENUE_ID> \"Reason for rejection\"");
        console.log("Example: npx tsx scripts/reject_venue.ts clv7xg... \"Cover image is too dark\"");
        process.exit(1);
    }

    console.log(`Rejecting venue ${venueId} due to: "${reason}"...`);

    try {
        const venue = await prisma.venue.findUnique({
            where: { id: venueId },
            include: { owner: true }
        });

        if (!venue) {
            console.error("Venue not found!");
            process.exit(1);
        }

        // Reject Venue
        await prisma.venue.update({
            where: { id: venueId },
            data: {
                status: 'REJECTED',
                rejectionReason: reason,
                isVerified: false
            }
        });

        console.log(`❌ Venue ${venue.name} is now REJECTED.`);
        console.log(`   Owner: ${venue.ownerId}`);

        // Create Notification
        try {
            if ((prisma as any).notification) {
                await (prisma as any).notification.create({
                    data: {
                        userId: venue.ownerId,
                        title: "Submission Rejected",
                        message: `Your venue "${venue.name}" was rejected. Reason: ${reason}. Please edit and resubmit.`,
                        type: "ERROR",
                        link: `/business/venue/${venueId}`
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
