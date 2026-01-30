import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = (session.user as any).id as string;

        // Generate unique slug
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 10000);
        const slug = `draft-venue-${timestamp}-${randomId}`;

        // Create empty draft venue
        const venue = await prisma.venue.create({
            data: {
                name: "Untitled Venue", // Will be updated when user types
                slug: slug,
                mainCategory: "NIGHTLIFE_BARS", // Default, will be updated
                ownerId: userId,
                status: "DRAFT",
                wizardStep: 1,
                description: "",
                isActive: false // Inactive until published
            }
        });

        console.log("✅ Empty draft created:", venue.id);

        return NextResponse.json({
            success: true,
            venueId: venue.id
        });

    } catch (e: any) {
        console.error("❌ Failed to create empty draft:", e);
        return NextResponse.json({
            error: e.message || "Failed to create draft"
        }, { status: 500 });
    }
}
