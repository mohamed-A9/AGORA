"use server";
import { prisma } from "@/lib/prisma";

async function checkVenues() {
    try {
        const venues = await prisma.venue.findMany({
            take: 5,
            select: { id: true, name: true, status: true, ownerId: true }
        });
        const pending = await prisma.venue.findFirst({
            where: { status: 'PENDING' },
            select: { id: true, name: true, status: true }
        });
        console.log("Latest Venues:", JSON.stringify(venues, null, 2));
        console.log("Found PENDING:", pending ? "YES FOUND ID: " + pending.id : "NO NOT FOUND");
    } catch (e) {
        console.error(e);
    }
}

checkVenues();
