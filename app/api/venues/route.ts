
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

  // New Advanced Filters
  const ambiance = searchParams.get("ambiance");
  const cuisine = searchParams.get("cuisine");
  const eventType = searchParams.get("eventType");
  const eventGenre = searchParams.get("eventGenre");
  const date = searchParams.get("date"); // YYYY-MM-DD
  const startTime = searchParams.get("startTime"); // For event search

  // New Venue-specific time filters
  const startHour = searchParams.get("startHour");
  const endHour = searchParams.get("endHour");
  const openingDays = searchParams.get("openingDays")?.split(",").filter(Boolean);

  const sort = searchParams.get("sort");

  // Build Where Clause
  const where: any = {
    status: { in: ["APPROVED", "PENDING"] },
  };

  // 1. Text Search
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { tagline: { contains: q, mode: "insensitive" } },
    ];
  }

  // 2. Multi-Match Filters (Support for preferences)
  if (city) {
    const cities = city.split(",").filter(Boolean);
    where.city = cities.length > 1 ? { in: cities } : cities[0];
  }
  if (category) {
    const categories = category.split(",").filter(Boolean);
    where.category = categories.length > 1 ? { in: categories } : categories[0];
  }
  if (ambiance) {
    const ambiances = ambiance.split(",").filter(Boolean);
    where.ambiance = ambiances.length > 1 ? { in: ambiances } : ambiances[0];
  }
  if (cuisine) where.cuisine = cuisine;

  // 3. Features
  if (parkingAvailable) where.parkingAvailable = true;
  if (valetParking) where.valetParking = true;
  if (reservationsEnabled) where.reservationsEnabled = true;

  // 4. Array Filters
  if (dressCodes && dressCodes.length > 0) {
    where.dressCode = { in: dressCodes };
  }
  if (agePolicies && agePolicies.length > 0) {
    where.agePolicy = { in: agePolicies };
  }
  if (paymentMethods && paymentMethods.length > 0) {
    where.paymentMethods = { hasSome: paymentMethods };
  }

  // 4a. Opening Hours/Days
  if (startHour) {
    where.startHour = { lte: startHour }; // Venue must open before or at requested time
  }
  if (endHour) {
    where.endHour = { gte: endHour }; // Venue must close after or at requested time
  }
  if (openingDays && openingDays.length > 0) {
    where.openingDays = { hasSome: openingDays };
  }

  // 5. Event Filters (Filtering Venues by their Events)
  if (eventType || eventGenre || date || startTime) {
    const eventWhere: any = {};
    if (eventType) eventWhere.type = eventType;
    if (eventGenre) eventWhere.genre = eventGenre;
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      eventWhere.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    if (startTime) {
      eventWhere.startTime = { gte: startTime };
    }

    where.events = {
      some: eventWhere,
    };
  }

  // Sorting
  let orderBy: any = undefined;
  if (sort === "top-rated") {
    orderBy = { rating: "desc" };
  } else if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  }

  const venues = await prisma.venue.findMany({
    where,
    orderBy,
    include: {
      media: true,
      events: {
        where: date ? {
          date: {
            gte: new Date(date),
            lte: new Date(new Date(date).setHours(23, 59, 59, 999))
          }
        } : undefined,
        take: 5
      }
    },
    take: 100,
  });

  return NextResponse.json({ venues });
}
