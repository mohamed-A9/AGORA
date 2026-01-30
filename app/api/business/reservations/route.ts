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

  const reservations = await prisma.reservation.findMany({
    where: { venue: { ownerId } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      date: true,
      time: true,
      status: true,

      createdAt: true,
      name: true,
      email: true,
      phone: true,
      venue: { select: { id: true, name: true, city: true, mainCategory: true } },
    },
    take: 150,
  });

  return NextResponse.json({ reservations });
}
