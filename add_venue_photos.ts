import { prisma } from "./lib/prisma";

// Get free Unsplash API key: https://unsplash.com/developers
// Add to .env: UNSPLASH_ACCESS_KEY=your_key
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_KEY) {
    console.error("❌ UNSPLASH_ACCESS_KEY not found in .env");
    console.log("Get one free at: https://unsplash.com/developers");
    process.exit(1);
}

// Map categories to search terms
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    "CAFE": ["coffee shop interior", "cafe", "coffee bar", "espresso bar"],
    "RESTAURANT": ["restaurant interior", "fine dining", "restaurant table setting"],
    "NIGHTLIFE_BARS": ["bar interior", "cocktail bar", "lounge bar", "nightclub bar"],
    "CLUBS_PARTY": ["nightclub", "dance floor", "club lights", "party venue"],
    "WELLNESS_HEALTH": ["spa interior", "wellness center", "massage room"],
    "ACTIVITIES_FUN": ["entertainment venue", "fun activity space"],
};

const SUBCATEGORY_KEYWORDS: Record<string, string> = {
    "Rooftop bar": "rooftop bar night",
    "Lounge": "luxury lounge interior",
    "Beach club": "beach club sunset",
    "Nightclub": "nightclub lights",
    "Cocktail bar": "cocktail bar",
    "Coffee shop": "modern coffee shop",
};

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchUnsplashPhotos(query: string, count: number = 5): Promise<string[]> {
    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&client_id=${UNSPLASH_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return [];
        }

        // Get regular size URLs (good quality, not too large)
        const urls = data.results.map((photo: any) => photo.urls.regular);

        // Rate limit: 50 requests/hour
        await sleep(100);

        return urls;
    } catch (error) {
        console.error(`   Error fetching photos for "${query}":`, error);
        return [];
    }
}

async function addPhotosToVenue(venue: any) {
    try {
        // Check if already has photos
        const existingPhotos = await prisma.venueMedia.count({
            where: { venueId: venue.id }
        });

        if (existingPhotos > 0) {
            console.log(`   ⏭️  Skipping "${venue.name}" (already has ${existingPhotos} photos)`);
            return;
        }

        // Determine search query
        let searchQuery = "";

        // Get subcategory for more specific search
        const subcategory = await prisma.venueSubcategory.findFirst({
            where: { venueId: venue.id },
            include: { subcategory: true }
        });

        if (subcategory && SUBCATEGORY_KEYWORDS[subcategory.subcategory.name]) {
            searchQuery = SUBCATEGORY_KEYWORDS[subcategory.subcategory.name];
        } else if (CATEGORY_KEYWORDS[venue.mainCategory]) {
            const keywords = CATEGORY_KEYWORDS[venue.mainCategory];
            searchQuery = keywords[Math.floor(Math.random() * keywords.length)];
        } else {
            searchQuery = "restaurant interior";
        }

        console.log(`   🔍 Searching photos for "${venue.name}" (${searchQuery})`);

        const photoUrls = await searchUnsplashPhotos(searchQuery, 5);

        if (photoUrls.length === 0) {
            console.log(`   ⚠️  No photos found for "${venue.name}"`);
            return;
        }

        // Create media entries
        const mediaData = photoUrls.map((url, index) => ({
            venueId: venue.id,
            url,
            kind: "image",
            sortOrder: index
        }));

        await prisma.venueMedia.createMany({
            data: mediaData
        });

        // Set first photo as cover
        await prisma.venue.update({
            where: { id: venue.id },
            data: { coverImageUrl: photoUrls[0] }
        });

        console.log(`   ✅ Added ${photoUrls.length} photos to "${venue.name}"`);

    } catch (error) {
        console.error(`   ❌ Error adding photos to "${venue.name}":`, error);
    }
}

async function main() {
    console.log("📸 Adding Photos to Venues using Unsplash\n");

    // Get all venues without photos
    const venues = await prisma.venue.findMany({
        where: {
            coverImageUrl: null
        },
        select: {
            id: true,
            name: true,
            mainCategory: true
        }
    });

    console.log(`Found ${venues.length} venues without photos\n`);

    let processed = 0;

    for (const venue of venues) {
        await addPhotosToVenue(venue);
        processed++;

        // Progress update every 5 venues
        if (processed % 5 === 0) {
            console.log(`\n📊 Progress: ${processed}/${venues.length}\n`);
        }
    }

    console.log(`\n✅ Complete! Processed ${processed} venues`);

    await prisma.$disconnect();
}

main();
