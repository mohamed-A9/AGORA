import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    try {
        // 1. Fetch User Data with Preferences
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                preferredCities: true,
                preferredCategories: true,
                preferredAmbiances: true,
            },
        });

        // 2. Fetch Stats
        const reservationsCount = await prisma.reservation.count({
            where: { userId },
        });
        const reviewsCount = await prisma.review.count({
            where: { userId },
        });

        // 3. Fetch Upcoming Reservations (Next 3)
        const upcomingReservations = await prisma.reservation.findMany({
            where: {
                userId,
                dateTime: { gte: new Date() },
            },
            include: {
                venue: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        media: { take: 1 },
                    },
                },
            },
            orderBy: { dateTime: "asc" },
            take: 3,
        });

        // 4. Fetch Trending/New Venues (Latest 4 approved)
        const newVenues = await prisma.venue.findMany({
            where: { status: "APPROVED" },
            include: {
                media: { take: 1 },
            },
            orderBy: { approvedAt: "desc" },
            take: 4,
        });

        // 5. Fetch Recommendations based on preferences
        let recommendedVenues: any[] = [];
        const u = user as any;
        if (u && (u.preferredCities?.length > 0 || u.preferredCategories?.length > 0)) {
            recommendedVenues = await prisma.venue.findMany({
                where: {
                    status: "APPROVED",
                    OR: [
                        { city: { in: u.preferredCities } },
                        { category: { in: u.preferredCategories } },
                        { ambiance: { in: u.preferredAmbiances } },
                    ],
                },
                include: {
                    media: { take: 1 },
                },
                take: 4,
            });
        }

        return NextResponse.json({
            stats: {
                reservations: reservationsCount,
                reviews: reviewsCount,
            },
            upcoming: upcomingReservations,
            trending: newVenues,
            recommendations: recommendedVenues,
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
