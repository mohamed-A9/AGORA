import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import crypto from "crypto";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  // ✅ Auth (USER connecté)
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.uid) return json(401, { error: "UNAUTHORIZED" });

  const userId = String(token.uid);

  const body = await req.json().catch(() => ({}));
  const venueId = String(body?.venueId || "").trim();
  const dateTimeRaw = String(body?.dateTime || "").trim();

  if (!venueId || !dateTimeRaw) return json(400, { error: "MISSING_FIELDS" });

  const dateTime = new Date(dateTimeRaw);
  if (Number.isNaN(dateTime.getTime())) return json(400, { error: "INVALID_DATETIME" });

  // ✅ Venue must be APPROVED (bloque PENDING/SUSPENDED/REJECTED)
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true, status: true },
  });

  if (!venue) return json(404, { error: "VENUE_NOT_FOUND" });

  if (venue.status !== "APPROVED") {
    return json(403, { error: "VENUE_NOT_APPROVED", status: venue.status });
  }

  // ✅ Optionnel: empêcher la même réservation (même user, même venue, même datetime)
  const existing = await prisma.reservation.findFirst({
    where: { venueId, userId, dateTime },
    select: { id: true, status: true },
  });

  if (existing) {
    return json(409, { error: "ALREADY_RESERVED", reservationId: existing.id, status: existing.status });
  }

  // ✅ QR token unique + sécurisé
  // (On génère une string random longue, impossible à deviner)
  const qrToken = crypto.randomBytes(32).toString("hex");

  const reservation = await prisma.reservation.create({
    data: {
      venueId,
      userId,
      dateTime,
      status: "PENDING",
      qrToken,
    },
    select: {
      id: true,
      venueId: true,
      userId: true,
      dateTime: true,
      status: true,
      qrToken: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ reservation });
}
