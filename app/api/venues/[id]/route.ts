import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        media: true,
        events: true, // Include events
        owner: { select: { id: true, name: true } },
      },
    });

    if (!venue) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    // ✅ si APPROVED ou PENDING => tout le monde peut voir (Dev purposes)
    if (venue.status === "APPROVED" || venue.status === "PENDING") return NextResponse.json({ venue });

    // ✅ sinon: uniquement owner business ou admin
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

    const uid = token.uid as string;
    const role = token.role as string;

    if (role === "ADMIN" || uid === venue.ownerId) {
      return NextResponse.json({ venue });
    }

    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  } catch (e: any) {
    return NextResponse.json({ error: "SERVER_ERROR", message: e?.message || "unknown" }, { status: 500 });
  }
}
