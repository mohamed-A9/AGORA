import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        console.warn("⚠️  save-menus: unauthenticated request");
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // ── 2. Parse body ─────────────────────────────────────────────────────────
    let body: any;
    try {
        body = await request.json();
    } catch (e) {
        console.error("❌ save-menus: JSON parse failed", e);
        return NextResponse.json({ error: "BAD_JSON" }, { status: 400 });
    }

    const { venueId, menus } = body ?? {};
    console.log(`📥 save-menus: venueId="${venueId}" menus=${JSON.stringify(menus?.length)}`);

    if (!venueId || typeof venueId !== "string") {
        return NextResponse.json({ error: "MISSING_VENUE_ID" }, { status: 400 });
    }
    if (!Array.isArray(menus)) {
        return NextResponse.json({ error: "MENUS_NOT_ARRAY" }, { status: 400 });
    }

    // ── 3. Ownership check ────────────────────────────────────────────────────
    const venue = await prisma.venue.findUnique({
        where: { id: venueId },
        select: { id: true, ownerId: true }
    }).catch(() => null);

    if (!venue) {
        return NextResponse.json({ error: "VENUE_NOT_FOUND" }, { status: 404 });
    }

    const uid = (token.uid as string) || (token.sub as string);
    const role = (token.role as string) || "";

    if (role !== "ADMIN" && venue.ownerId !== uid) {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // ── 4. Persist ────────────────────────────────────────────────────────────
    try {
        await prisma.venueMedia.deleteMany({
            where: { venueId, kind: { in: ["menu_image", "menu_pdf"] } }
        });

        if (menus.length > 0) {
            await prisma.venueMedia.createMany({
                data: menus.map((m: any, idx: number) => ({
                    venueId,
                    url: String(m.url),
                    kind: "menu_image",
                    sortOrder: idx
                }))
            });
        }

        console.log(`✅ save-menus: saved ${menus.length} items for ${venueId}`);
        return NextResponse.json({ success: true, saved: menus.length });
    } catch (e: any) {
        console.error("❌ save-menus DB error:", e);
        return NextResponse.json({ error: "DB_ERROR", detail: e.message }, { status: 500 });
    }
}
