import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { verifyCheckinToken } from "@/lib/checkinToken";

export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (token.role !== "BUSINESS" && token.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const ownerId = token.uid as string;

  const body = await req.json().catch(() => ({}));
  const checkinToken = String(body?.token || "").trim();
  if (!checkinToken) return NextResponse.json({ error: "TOKEN_REQUIRED" }, { status: 400 });

  const v = verifyCheckinToken(checkinToken);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const { rid } = v.payload;

  const resv = await prisma.reservation.findUnique({
    where: { id: rid },
    select: {
      id: true,
      status: true,
      venueId: true,
      venue: { select: { ownerId: true, name: true } },
    },
  });

  if (!resv) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (token.role !== "ADMIN" && resv.venue.ownerId !== ownerId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (String(resv.status).toUpperCase() !== "ACCEPTED") {
    return NextResponse.json({ error: "NOT_ACCEPTED" }, { status: 400 });
  }

  await prisma.reservation.update({
    where: { id: resv.id },
    data: { status: "CHECKED_IN" },
  });

  return NextResponse.json({ ok: true, reservationId: resv.id, venueName: resv.venue.name });
}
