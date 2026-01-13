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

  const venues = await prisma.venue.findMany({
    where: { ownerId },
    // orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      city: true,
      category: true,
      address: true,
      description: true,
      status: true,
      // createdAt: true,
    },
    take: 200,
  });

  return NextResponse.json({ venues });
}

export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (token.role !== "BUSINESS" && token.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const ownerId = token.uid as string;

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const city = String(body?.city || "").trim();
  const category = String(body?.category || "").trim();
  const address = String(body?.address || "").trim() || null;
  const description = String(body?.description || "").trim() || null;

  if (!name || !city || !category) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const venue = await prisma.venue.create({
    data: {
      name,
      city,
      category: category || "",
      address: address || "",
      description,
      ownerId,
      status: "PENDING",
      approvedAt: null,
      approvedBy: null,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: venue.id });
}
