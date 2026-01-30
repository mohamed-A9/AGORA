const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkVenue() {
    try {
        const venueId = "cmkqr2pxz0003taao7ndisy70";
        const venue = await prisma.venue.findUnique({
            where: { id: venueId }
        });

        if (venue) {
            console.log("RESULT:FOUND");
            console.log(JSON.stringify(venue, null, 2));
        } else {
            console.log("RESULT:NOT_FOUND");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkVenue();
