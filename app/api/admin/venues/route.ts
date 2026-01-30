import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "ALL").toUpperCase();
  const q = (searchParams.get("q") || "").trim();

  const where: any = {};

  if (status !== "ALL") {
    // ✅ enum VenueStatus: PENDING | APPROVED | REJECTED
    where.status = status;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { owner: { email: { contains: q, mode: "insensitive" } } },
      { owner: { phone: { contains: q, mode: "insensitive" } } },
      { owner: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const venues = await prisma.venue.findMany({
    where,
    // orderBy: { createdAt: "desc" }, // Temporarily disabled due to schema mismatch
    include: {
      owner: {
        select: { id: true, email: true, phone: true, name: true, role: true },
      },
      gallery: true
    },
  });

  return NextResponse.json({ venues });
}
