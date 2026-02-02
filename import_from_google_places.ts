import { prisma } from "./lib/prisma";

// You need to set your Google Places API key in .env:
// GOOGLE_PLACES_API_KEY=your_key_here
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_PLACES_API_KEY not found in .env");
    process.exit(1);
}

// Limit to stay within free tier (1000 requests/month)
const MAX_VENUES_PER_CATEGORY = 10; // 10 per category
const MAX_TOTAL_REQUESTS = 500; // Safety limit

let requestCount = 0;

// Moroccan cities to search
const CITIES = [
    { name: "Casablanca", lat: 33.5731, lng: -7.5898 },
    { name: "Marrakech", lat: 31.6295, lng: -7.9811 },
    { name: "Rabat", lat: 34.0209, lng: -6.8416 },
    { name: "Fès", lat: 34.0181, lng: -5.0078 },
    { name: "Tangier", lat: 35.7595, lng: -5.8340 },
];

// Map our categories to Google Places types/keywords
const SEARCH_QUERIES = [
    // CAFE
    { keyword: "coffee shop", mainCategory: "CAFE", subcategory: "Coffee shop" },
    { keyword: "cafe", mainCategory: "CAFE", subcategory: "Café" },
    { keyword: "tea house", mainCategory: "CAFE", subcategory: "Tea house" },

    // RESTAURANT
    { keyword: "restaurant", mainCategory: "RESTAURANT", subcategory: "Traditional Moroccan" },
    { keyword: "fine dining", mainCategory: "RESTAURANT", subcategory: "Fine dining" },
    { keyword: "italian restaurant", mainCategory: "RESTAURANT", subcategory: "Italian" },
    { keyword: "sushi restaurant", mainCategory: "RESTAURANT", subcategory: "Asian Fusion" },

    // NIGHTLIFE_BARS
    { keyword: "bar", mainCategory: "NIGHTLIFE_BARS", subcategory: "Cocktail bar" },
    { keyword: "lounge", mainCategory: "NIGHTLIFE_BARS", subcategory: "Lounge" },
    { keyword: "rooftop bar", mainCategory: "NIGHTLIFE_BARS", subcategory: "Rooftop bar" },

    // CLUBS_PARTY
    { keyword: "nightclub", mainCategory: "CLUBS_PARTY", subcategory: "Nightclub" },
    { keyword: "dance club", mainCategory: "CLUBS_PARTY", subcategory: "DJ club" },
];

interface GooglePlace {
    place_id: string;
    name: string;
    formatted_address?: string;
    geometry?: {
        location: { lat: number; lng: number };
    };
    rating?: number;
    user_ratings_total?: number;
    formatted_phone_number?: string;
    website?: string;
    opening_hours?: {
        weekday_text?: string[];
        periods?: any[];
    };
    photos?: Array<{ photo_reference: string }>;
    types?: string[];
    price_level?: number;
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchPlaces(query: string, location: { lat: number; lng: number }): Promise<string[]> {
    if (requestCount >= MAX_TOTAL_REQUESTS) {
        console.log("⚠️ Reached request limit, stopping.");
        return [];
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location.lat},${location.lng}&radius=10000&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        requestCount++;

        if (data.status !== "OK") {
            console.log(`   ⚠️ Search returned: ${data.status}`);
            return [];
        }

        const placeIds = data.results.slice(0, MAX_VENUES_PER_CATEGORY).map((p: any) => p.place_id);
        console.log(`   Found ${placeIds.length} places`);

        // Rate limit: 1 request per second
        await sleep(1000);

        return placeIds;
    } catch (error) {
        console.error(`   Error searching: ${error}`);
        return [];
    }
}

async function getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
    if (requestCount >= MAX_TOTAL_REQUESTS) {
        return null;
    }

    const fields = [
        "place_id", "name", "formatted_address", "geometry",
        "rating", "user_ratings_total", "formatted_phone_number",
        "website", "opening_hours", "photos", "types", "price_level"
    ].join(",");

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        requestCount++;

        if (data.status !== "OK" || !data.result) {
            return null;
        }

        // Rate limit
        await sleep(1000);

        return data.result;
    } catch (error) {
        console.error(`   Error fetching details: ${error}`);
        return null;
    }
}

function inferCuisine(name: string, types: string[]): string[] {
    const cuisines: string[] = [];
    const text = `${name} ${types.join(" ")}`.toLowerCase();

    if (text.includes("italian") || text.includes("pizza") || text.includes("pasta")) cuisines.push("Italian");
    if (text.includes("japanese") || text.includes("sushi") || text.includes("ramen")) cuisines.push("Japanese");
    if (text.includes("moroccan") || text.includes("tagine") || text.includes("couscous")) cuisines.push("Moroccan");
    if (text.includes("french")) cuisines.push("French");
    if (text.includes("asian") || text.includes("chinese") || text.includes("thai")) cuisines.push("Asian Fusion");
    if (text.includes("mediterranean")) cuisines.push("Mediterranean");
    if (text.includes("seafood")) cuisines.push("Seafood");
    if (text.includes("burger") || text.includes("american")) cuisines.push("American");

    return cuisines.length > 0 ? cuisines : ["International"];
}

function inferVibe(types: string[], priceLevel?: number): string[] {
    const vibes: string[] = [];

    if (types.includes("bar") || types.includes("night_club")) vibes.push("Energetic");
    if (types.includes("cafe") || types.includes("coffee")) vibes.push("Cozy");
    if (priceLevel && priceLevel >= 3) vibes.push("Upscale");
    if (types.includes("rooftop")) vibes.push("Scenic");
    if (types.includes("lounge")) vibes.push("Sophisticated");

    return vibes.length > 0 ? vibes : ["Casual"];
}

function inferMusic(category: string, types: string[]): string[] {
    if (category === "CLUBS_PARTY") return ["Electronic", "House"];
    if (category === "NIGHTLIFE_BARS") return ["Live DJ", "Background Music"];
    if (types.includes("jazz")) return ["Jazz"];
    return [];
}

function parseOpeningHours(weekdayText?: string[]): any[] {
    if (!weekdayText || weekdayText.length === 0) {
        // Default: Open every day 9:00 - 23:00
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
            day,
            open: "09:00",
            close: "23:00",
            closed: false
        }));
    }

    const schedule = [];
    const dayMap: any = {
        "Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed",
        "Thursday": "Thu", "Friday": "Fri", "Saturday": "Sat", "Sunday": "Sun"
    };

    for (const line of weekdayText) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (!match) continue;

        const dayName = match[1];
        const hours = match[2];
        const day = dayMap[dayName] || dayName.substring(0, 3);

        if (hours.toLowerCase().includes("closed")) {
            schedule.push({ day, open: "00:00", close: "00:00", closed: true });
        } else {
            // Parse hours like "9:00 AM – 11:00 PM"
            const timeMatch = hours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/);
            if (timeMatch) {
                const [_, h1, m1, ap1, h2, m2, ap2] = timeMatch;
                const openHour = ap1 === "PM" && parseInt(h1) !== 12 ? parseInt(h1) + 12 : parseInt(h1);
                const closeHour = ap2 === "PM" && parseInt(h2) !== 12 ? parseInt(h2) + 12 : parseInt(h2);
                schedule.push({
                    day,
                    open: `${openHour.toString().padStart(2, '0')}:${m1}`,
                    close: `${closeHour.toString().padStart(2, '0')}:${m2}`,
                    closed: false
                });
            } else {
                schedule.push({ day, open: "09:00", close: "23:00", closed: false });
            }
        }
    }

    return schedule.length === 7 ? schedule : null;
}

function getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
}

async function importVenue(place: GooglePlace, cityName: string, mainCategory: string, subcategory: string) {
    try {
        // Check if already exists
        const existing = await prisma.venue.findFirst({
            where: {
                OR: [
                    { name: place.name },
                    { address: place.formatted_address }
                ]
            }
        });

        if (existing) {
            console.log(`   ⏭️  Skipping "${place.name}" (already exists)`);
            return;
        }

        // Get or create city
        const city = await prisma.city.upsert({
            where: { name: cityName },
            update: {},
            create: {
                name: cityName,
                slug: cityName.toLowerCase().replace(/\s+/g, '-'),
                country: "Morocco"
            }
        });

        // Generate slug
        const slug = `${place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 10000)}`;

        // Infer attributes
        const cuisines = inferCuisine(place.name, place.types || []);
        const vibes = inferVibe(place.types || [], place.price_level);
        const music = inferMusic(mainCategory, place.types || []);
        const schedule = parseOpeningHours(place.opening_hours?.weekday_text);

        // Create venue
        const venue = await prisma.venue.create({
            data: {
                name: place.name,
                slug,
                mainCategory: mainCategory as any,
                description: `${place.name} in ${cityName}`,
                cityId: city.id,
                address: place.formatted_address || "",
                lat: place.geometry?.location.lat,
                lng: place.geometry?.location.lng,
                phone: place.formatted_phone_number || null,
                website: place.website || null,
                rating: place.rating || 0,
                numReviews: place.user_ratings_total || 0,
                priceLevel: place.price_level || null,
                weeklySchedule: schedule,
                status: "APPROVED",
                isVerified: true,
                isActive: true,
                ownerId: null, // System-imported venues
            }
        });

        // Add subcategory
        if (subcategory) {
            const subCat = await prisma.subcategory.upsert({
                where: { slug: subcategory.toLowerCase().replace(/\s+/g, '-') },
                update: {},
                create: {
                    name: subcategory,
                    slug: subcategory.toLowerCase().replace(/\s+/g, '-'),
                    mainCategory: mainCategory as any
                }
            });

            await prisma.venueSubcategory.create({
                data: { venueId: venue.id, subcategoryId: subCat.id }
            });
        }

        // Add cuisines
        for (const cuisineName of cuisines) {
            const cuisine = await prisma.cuisine.upsert({
                where: { slug: cuisineName.toLowerCase().replace(/\s+/g, '-') },
                update: {},
                create: {
                    name: cuisineName,
                    slug: cuisineName.toLowerCase().replace(/\s+/g, '-')
                }
            });

            await prisma.venueCuisine.create({
                data: { venueId: venue.id, cuisineId: cuisine.id }
            });
        }

        // Add vibes
        for (const vibeName of vibes) {
            const vibe = await prisma.vibe.upsert({
                where: { slug: vibeName.toLowerCase().replace(/\s+/g, '-') },
                update: {},
                create: {
                    name: vibeName,
                    slug: vibeName.toLowerCase().replace(/\s+/g, '-')
                }
            });

            await prisma.venueVibe.create({
                data: { venueId: venue.id, vibeId: vibe.id }
            });
        }

        // Add music
        for (const musicName of music) {
            const musicType = await prisma.musicType.upsert({
                where: { slug: musicName.toLowerCase().replace(/\s+/g, '-') },
                update: {},
                create: {
                    name: musicName,
                    slug: musicName.toLowerCase().replace(/\s+/g, '-')
                }
            });

            await prisma.venueMusicType.create({
                data: { venueId: venue.id, musicTypeId: musicType.id }
            });
        }

        // Add photos
        if (place.photos && place.photos.length > 0) {
            const photoUrls = place.photos.slice(0, 5).map((photo, idx) => ({
                url: getPhotoUrl(photo.photo_reference),
                kind: idx === 0 ? "image" : "image",
                sortOrder: idx,
                venueId: venue.id
            }));

            await prisma.venueMedia.createMany({
                data: photoUrls
            });

            // Set first photo as cover
            await prisma.venue.update({
                where: { id: venue.id },
                data: { coverImageUrl: photoUrls[0].url }
            });
        }

        console.log(`   ✅ Imported "${place.name}"`);
    } catch (error) {
        console.error(`   ❌ Error importing "${place.name}":`, error);
    }
}

async function main() {
    console.log("🌍 Starting Google Places Import (Free Tier Safe)");
    console.log(`📊 Limits: ${MAX_VENUES_PER_CATEGORY} per category, max ${MAX_TOTAL_REQUESTS} total requests\n`);

    let totalImported = 0;

    for (const city of CITIES) {
        console.log(`\n📍 ${city.name}`);

        for (const query of SEARCH_QUERIES) {
            if (requestCount >= MAX_TOTAL_REQUESTS) {
                console.log("\n⚠️ Reached request limit. Stopping.");
                break;
            }

            console.log(`  🔍 Searching: ${query.keyword}`);

            const placeIds = await searchPlaces(`${query.keyword} in ${city.name}`, city);

            for (const placeId of placeIds) {
                if (requestCount >= MAX_TOTAL_REQUESTS) break;

                const details = await getPlaceDetails(placeId);
                if (details) {
                    await importVenue(details, city.name, query.mainCategory, query.subcategory);
                    totalImported++;
                }
            }
        }

        if (requestCount >= MAX_TOTAL_REQUESTS) break;
    }

    console.log(`\n✅ Import complete!`);
    console.log(`📊 Total venues imported: ${totalImported}`);
    console.log(`📊 Total API requests: ${requestCount}/${MAX_TOTAL_REQUESTS}`);
    console.log(`💰 Cost: $0 (within free tier)`);

    await prisma.$disconnect();
}

main();
