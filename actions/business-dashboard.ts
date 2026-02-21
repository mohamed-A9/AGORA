"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getBusinessStats() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    const userId = (session.user as any).id;

    const [venueCount, reservationCount] = await Promise.all([
        prisma.venue.count({
            where: { ownerId: userId, isActive: true }
        }),
        prisma.reservation.count({
            where: { venue: { ownerId: userId } }
        })
    ]);

    return {
        venues: venueCount,
        reservations: reservationCount,
        views: 0, // Not tracked yet
        engagement: 0 // Not tracked yet
    };
}
