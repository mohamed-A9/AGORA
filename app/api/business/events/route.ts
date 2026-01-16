import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    if (token.role !== "BUSINESS" && token.role !== "ADMIN") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const ownerId = token.uid as string;

    const events = await prisma.event.findMany({
        where: { venue: { ownerId } },
        orderBy: { date: "asc" },
        include: {
            venue: { select: { name: true, city: true } },
            media: { take: 1 }
        }
    });

    return NextResponse.json({ events });
}
