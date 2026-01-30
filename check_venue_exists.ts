import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkVenue() {
    const venueId = "cmkqr2pxz0003taao7ndisy70";
    const venue = await prisma.venue.findUnique({
        where: { id: venueId }
    });

    if (venue) {
        console.log("Venue found:", venue);
    } else {
        console.log("Venue NOT found with ID:", venueId);
    }
}

checkVenue();
