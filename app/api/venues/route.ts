
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Extract Filters
  const q = searchParams.get("q");
  const city = searchParams.get("city");
  const category = searchParams.get("category");

  // Features
  const parkingAvailable = searchParams.get("parkingAvailable") === "true";
  const valetParking = searchParams.get("valetParking") === "true";
  const reservationsEnabled = searchParams.get("reservationsEnabled") === "true";

  // Arrays
  const dressCodes = searchParams.get("dressCode")?.split(",").filter(Boolean);
  const agePolicies = searchParams.get("agePolicy")?.split(",").filter(Boolean);
  const paymentMethods = searchParams.get("paymentMethods")?.split(",").filter(Boolean);

  // Build Where Clause
  const where: any = {
    status: { in: ["APPROVED", "PENDING"] }, // Keep PENDING for testing if needed
  };

  // 1. Text Search
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  // 2. Exact Matches
  if (city) where.city = city;
  if (category) where.category = category;

  // 3. Features
  if (parkingAvailable) where.parkingAvailable = true;
  if (valetParking) where.valetParking = true;
  if (reservationsEnabled) where.reservationsEnabled = true;

  // 4. Array Filters (IN clausse)
  if (dressCodes && dressCodes.length > 0) {
    where.dressCode = { in: dressCodes };
  }
  if (agePolicies && agePolicies.length > 0) {
    where.agePolicy = { in: agePolicies };
  }

  // 5. Payment Methods (Array contains)
  // Prisma doesn't support 'hasSome' for scalar lists in Postgres easily in older versions, 
  // but for simple array fields, we can use `hasSome` if strictly typed, or constructing raw if needed.
  // Standard prisma: items: { has: 'value' } is for single value checking.
  // For OR logic (has ANY of these), we need OR conditions with `has`.
  if (paymentMethods && paymentMethods.length > 0) {
    where.paymentMethods = {
      hasSome: paymentMethods
    };
  }

  const venues = await prisma.venue.findMany({
    where,
    include: { media: true },
    take: 200,
    // orderBy: { approvedAt: 'desc' } // Optional: sort by approval time
  });

  return NextResponse.json({ venues });
}
