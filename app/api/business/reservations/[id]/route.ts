import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

type Status = "PENDING" | "ACCEPTED" | "DECLINED" | "CHECKED_IN";

function canTransition(from: Status, to: Status) {
  // ✅ règles strictes
  // PENDING -> ACCEPTED/DECLINED
  // ACCEPTED -> CHECKED_IN
  // DECLINED -> (rien)
  // CHECKED_IN -> (rien)
  if (from === "PENDING" && (to === "ACCEPTED" || to === "DECLINED")) return true;
  if (from === "ACCEPTED" && to === "CHECKED_IN") return true;
  return false;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    if (token.role !== "BUSINESS" && token.role !== "ADMIN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const ownerId = token.uid as string;
    const { id } = await ctx.params;

    const body = await req.json().catch(() => ({}));
    const nextStatus = String(body?.status || "").trim().toUpperCase() as Status;

    const allowed: Status[] = ["ACCEPTED", "DECLINED", "CHECKED_IN"];
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json({ error: "STATUS_INVALID" }, { status: 400 });
    }

    const resv = await prisma.reservation.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        venue: { select: { ownerId: true } },
      },
    });

    if (!resv) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    // admin peut tout faire sur ownership? (on garde sécurité: ADMIN bypass ownership)
    if (token.role !== "ADMIN" && resv.venue.ownerId !== ownerId) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const current = (String(resv.status || "PENDING").toUpperCase() as Status);

    // ✅ bloquer les retours arrière
    if (!canTransition(current, nextStatus)) {
      return NextResponse.json(
        { error: "TRANSITION_FORBIDDEN", from: current, to: nextStatus },
        { status: 400 }
      );
    }

    await prisma.reservation.update({
      where: { id },
      data: { status: nextStatus },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
