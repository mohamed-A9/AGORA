import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    try {
        const { venueId, rating, comment } = await req.json();

        if (!venueId || !rating) {
            return NextResponse.json({ error: "Venue ID and rating are required" }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
        }

        // 1. Verify User has checked-in to this venue
        const checkin = await prisma.reservation.findFirst({
            where: {
                email: session.user.email || "", // Check by email as Reservation has no userId
                venueId,
                status: "CHECKED_IN",
            },
        });

        if (!checkin) {
            return NextResponse.json({
                error: "Vous devez avoir fréquenté ce lieu (check-in validé) pour laisser un avis."
            }, { status: 403 });
        }

        // 2. Check if already reviewed (optional but recommended)
        const existingReview = await prisma.review.findFirst({
            where: {
                userId,
                venueId,
            },
        });

        if (existingReview) {
            return NextResponse.json({ error: "Vous avez déjà laissé un avis pour ce lieu." }, { status: 400 });
        }

        // 3. Create the review
        const review = await prisma.review.create({
            data: {
                userId,
                venueId,
                rating: Math.round(rating),
                comment,
            },
        });

        return NextResponse.json({ ok: true, review });
    } catch (error) {
        console.error("Review API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
