import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        gallery: { orderBy: { sortOrder: 'asc' } },
        events: {},
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

    return NextResponse.json({ venue });
  } catch (e: any) {
    return NextResponse.json({ error: "SERVER_ERROR", message: e?.message || "unknown" }, { status: 500 });
  }
}

/**
 * PATCH /api/venues/[id]
 * Saves lightweight wizard state fields (wizardStep, etc.)
 * For full field updates use updateVenueStep server action.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();

    // Find venue and verify ownership
    const venue = await prisma.venue.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!venue) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const uid = token.uid as string || token.sub as string;
    const role = token.role as string;

    if (role !== "ADMIN" && venue.ownerId !== uid) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // Only allow updating safe, non-sensitive fields via this endpoint
    const allowed: Record<string, any> = {};
    if (typeof body.wizardStep === 'number') allowed.wizardStep = body.wizardStep;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await prisma.venue.update({
      where: { id },
      data: allowed,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "SERVER_ERROR", message: e?.message || "unknown" }, { status: 500 });
  }
}
