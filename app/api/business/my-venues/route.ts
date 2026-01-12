import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (!session || !session.user || session.user.role !== 'BUSINESS') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const ownerId = session.user.id;

    const venues = await prisma.venue.findMany({
        where: { ownerId },
        // orderBy: { createdAt: "desc" }, // Temporarily disabled
        include: { media: true }
    });

    return NextResponse.json({ venues });
}
