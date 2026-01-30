import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    try {
        if (!userEmail) throw new Error("User email not found");

        // 1. Fetch User Data (Basic)
        // Preferences removed as they don't exist in schema yet
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        });

        // 2. Fetch Stats (Using email for reservations)
        const reservationsCount = await prisma.reservation.count({
            where: { email: userEmail },
        });

        // Reviews still linked by userId
        const reviewsCount = await prisma.review.count({
            where: { userId: (session.user as any).id },
        });

        // 3. Fetch Upcoming Reservations (Next 3)
        // Using email instead of userId since Reservation doesn't have userId relation yet
        const upcomingReservations = await prisma.reservation.findMany({
            where: {
                email: userEmail,
                date: { gte: new Date() }, // Changed from dateTime to date based on schema
            },
            include: {
                venue: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        gallery: { take: 1 }, // Changed media to gallery
                    },
                },
            },
            orderBy: { date: "asc" }, // Changed dateTime to date
            take: 3,
        });

        // 4. Fetch Trending/New Venues (Latest 4)
        // Changed approvedAt to createdAt, media to gallery
        const newVenues = await prisma.venue.findMany({
            where: { status: "APPROVED" },
            include: {
                gallery: { take: 1 },
            },
            orderBy: { createdAt: "desc" },
            take: 4,
        });

        // 5. Fetch Recommendations
        // Simplified fallback since preferences tables don't exist
        const recommendedVenues = await prisma.venue.findMany({
            where: { status: "APPROVED" },
            include: {
                gallery: { take: 1 },
            },
            // Random-ish sort or just latest for now
            orderBy: { rating: "desc" },
            take: 4,
        });

        // Map data to match frontend expectations where possible
        const mappedUpcoming = upcomingReservations.map(r => ({
            ...r,
            dateTime: r.date, // Map date to dateTime for frontend
            venue: {
                ...r.venue,
                media: r.venue.gallery // Map gallery to media for frontend
            }
        }));

        const mappedNew = newVenues.map(v => ({
            ...v,
            media: v.gallery
        }));

        const mappedRecommended = recommendedVenues.map(v => ({
            ...v,
            media: v.gallery
        }));

        return NextResponse.json({
            stats: {
                reservations: reservationsCount,
                reviews: reviewsCount,
            },
            upcoming: mappedUpcoming,
            trending: mappedNew,
            recommendations: mappedRecommended,
        });
    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
