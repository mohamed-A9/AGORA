import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        gallery: true, // properties: id, url, kind...
        events: {
          // include: { media: true } // Media relation on Event might be missing or named differently. Removing to be safe for now.
        },
        owner: { select: { id: true, name: true } },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        facilities: { include: { facility: true } },
        policies: { include: { policy: true } },
        subcategories: { include: { subcategory: true } },
        cuisines: { include: { cuisine: true } },
        vibes: { include: { vibe: true } },
        city: true,
      },
    });

    if (!venue) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    // For development, we allow viewing all venues or check isActive
    // if (!venue.isActive) return NextResponse.json({ error: "NOT_ACTIVE" }, { status: 404 });

    return NextResponse.json({ venue });

    /*
    // ✅ Only APPROVED venues are public
    if (venue.status === "APPROVED") return NextResponse.json({ venue });

    // ✅ sinon: uniquement owner business ou admin
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

    const uid = token.uid as string;
    const role = token.role as string;

    if (role === "ADMIN" || uid === venue.ownerId) {
      return NextResponse.json({ venue });
    }

    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    */
  } catch (e: any) {
    return NextResponse.json({ error: "SERVER_ERROR", message: e?.message || "unknown" }, { status: 500 });
  }
}
