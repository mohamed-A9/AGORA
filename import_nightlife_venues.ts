// Manual TripAdvisor Nightlife Import Script
// Since TripAdvisor blocks scraping, you can manually copy data and paste it here

import { prisma } from "./lib/prisma";

// Manual data - Add venues here by copying from TripAdvisor
const nightlifeVenues = [
    // CASABLANCA
    {
        name: "Le Comptoir Darna",
        city: "Casablanca",
        category: "NIGHTLIFE_BARS",
        subcategory: "Lounge",
        address: "Boulevard Mohammed V, Casablanca",
        description: "Upscale lounge with live music and belly dancing shows",
        vibes: ["Upscale", "Energetic", "Sophisticated"],
        music: ["Live Music", "World Music"],
        priceLevel: 3,
    },
    {
        name: "Sky 28",
        city: "Casablanca",
        category: "NIGHTLIFE_BARS",
        subcategory: "Rooftop bar",
        address: "Sofitel Casablanca Tour Blanche, Rue Sidi Belyout",
        description: "Rooftop bar on the 28th floor with panoramic views",
        vibes: ["Upscale", "Scenic", "Sophisticated"],
        music: ["Background Music", "Lounge"],
        priceLevel: 4,
    },
    {
        name: "La Bodega",
        city: "Casablanca",
        category: "NIGHTLIFE_BARS",
        subcategory: "Bar",
        address: "129-131 Rue Allal Ben Abdellah, Casablanca",
        description: "Popular tapas bar with vibrant atmosphere",
        vibes: ["Energetic", "Casual", "Social"],
        music: ["Background Music", "Latin"],
        priceLevel: 2,
    },

    // MARRAKECH
    {
        name: "Theatro",
        city: "Marrakech",
        category: "CLUBS_PARTY",
        subcategory: "Nightclub",
        address: "Hotel Es Saadi, Rue Ibrahim El Mazini, Marrakech",
        description: "Glamorous nightclub with international DJs",
        vibes: ["Upscale", "Energetic", "Party"],
        music: ["Electronic", "House", "Live DJ"],
        priceLevel: 4,
    },
    {
        name: "Pacha Marrakech",
        city: "Marrakech",
        category: "CLUBS_PARTY",
        subcategory: "Nightclub",
        address: "Boulevard Mohamed VI, Marrakech",
        description: "Famous nightclub from the Pacha brand",
        vibes: ["Upscale", "Energetic", "Party"],
        music: ["Electronic", "House", "Techno", "Live DJ"],
        priceLevel: 4,
    },
    {
        name: "Le Comptoir Darna Marrakech",
        city: "Marrakech",
        category: "NIGHTLIFE_BARS",
        subcategory: "Lounge",
        address: "Avenue Echouhada, Marrakech",
        description: "Moroccan restaurant and lounge with nightly entertainment",
        vibes: ["Upscale", "Energetic", "Cultural"],
        music: ["Live Music", "World Music"],
        priceLevel: 3,
    },
    {
        name: "Kechmara",
        city: "Marrakech",
        category: "NIGHTLIFE_BARS",
        subcategory: "Bar",
        address: "3 Rue de la Liberté, Marrakech",
        description: "Trendy bar with rooftop terrace",
        vibes: ["Casual", "Social", "Trendy"],
        music: ["Background Music", "Electronic"],
        priceLevel: 2,
    },

    // RABAT
    {
        name: "Le Dhow",
        city: "Rabat",
        category: "NIGHTLIFE_BARS",
        subcategory: "Lounge",
        address: "Marina de Bouregreg, Rabat",
        description: "Floating restaurant and lounge on a boat",
        vibes: ["Upscale", "Scenic", "Romantic"],
        music: ["Background Music", "Lounge"],
        priceLevel: 3,
    },
    {
        name: "Le Puzzle",
        city: "Rabat",
        category: "NIGHTLIFE_BARS",
        subcategory: "Bar",
        address: "Avenue Al Abtal, Rabat",
        description: "Popular bar with live music",
        vibes: ["Casual", "Social", "Energetic"],
        music: ["Live Music", "Rock"],
        priceLevel: 2,
    },

    // AGADIR
    {
        name: "Papagayo Beach Club",
        city: "Agadir",
        category: "NIGHTLIFE_BARS",
        subcategory: "Beach club",
        address: "Agadir Beach, Agadir",
        description: "Beachfront club with DJ nights",
        vibes: ["Casual", "Beach", "Party"],
        music: ["Electronic", "Live DJ"],
        priceLevel: 3,
    },
    {
        name: "So Lounge",
        city: "Agadir",
        category: "NIGHTLIFE_BARS",
        subcategory: "Lounge",
        address: "Boulevard du 20 Août, Agadir",
        description: "Modern lounge with hookah and cocktails",
        vibes: ["Casual", "Social", "Relaxed"],
        music: ["Background Music", "Lounge"],
        priceLevel: 2,
    },

    // TANGIER
    {
        name: "Le Mirage",
        city: "Tangier",
        category: "CLUBS_PARTY",
        subcategory: "Nightclub",
        address: "Route de Malabata, Tangier",
        description: "Popular nightclub with sea views",
        vibes: ["Energetic", "Party", "Scenic"],
        music: ["Electronic", "House", "Live DJ"],
        priceLevel: 3,
    },
    {
        name: "El Morocco Club",
        city: "Tangier",
        category: "NIGHTLIFE_BARS",
        subcategory: "Lounge",
        address: "Place du Tabor, Tangier",
        description: "Historic lounge with traditional Moroccan ambiance",
        vibes: ["Upscale", "Cultural", "Sophisticated"],
        music: ["World Music", "Live Music"],
        priceLevel: 3,
    },
];

async function importNightlifeVenues() {
    console.log("🌙 Importing Nightlife Venues from manual data...\n");

    let imported = 0;
    let skipped = 0;

    for (const venue of nightlifeVenues) {
        try {
            // Check if exists
            const existing = await prisma.venue.findFirst({
                where: { name: venue.name }
            });

            if (existing) {
                console.log(`   ⏭️  Skipping "${venue.name}" (already exists)`);
                skipped++;
                continue;
            }

            // Get or create city
            const city = await prisma.city.upsert({
                where: { name: venue.city },
                update: {},
                create: {
                    name: venue.city,
                    slug: venue.city.toLowerCase().replace(/\s+/g, '-'),
                    country: "Morocco"
                }
            });

            // Generate slug
            const slug = `${venue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 10000)}`;

            // Create venue
            const createdVenue = await prisma.venue.create({
                data: {
                    name: venue.name,
                    slug,
                    mainCategory: venue.category as any,
                    description: venue.description,
                    cityId: city.id,
                    address: venue.address,
                    priceLevel: venue.priceLevel,
                    status: "APPROVED",
                    isVerified: true,
                    isActive: true,
                }
            });

            // Add subcategory
            if (venue.subcategory) {
                const subCat = await prisma.subcategory.upsert({
                    where: { slug: venue.subcategory.toLowerCase().replace(/\s+/g, '-') },
                    update: {},
                    create: {
                        name: venue.subcategory,
                        slug: venue.subcategory.toLowerCase().replace(/\s+/g, '-'),
                        mainCategory: venue.category as any
                    }
                });

                await prisma.venueSubcategory.create({
                    data: { venueId: createdVenue.id, subcategoryId: subCat.id }
                });
            }

            // Add vibes
            for (const vibeName of venue.vibes) {
                const vibe = await prisma.vibe.upsert({
                    where: { slug: vibeName.toLowerCase().replace(/\s+/g, '-') },
                    update: {},
                    create: {
                        name: vibeName,
                        slug: vibeName.toLowerCase().replace(/\s+/g, '-')
                    }
                });

                await prisma.venueVibe.create({
                    data: { venueId: createdVenue.id, vibeId: vibe.id }
                });
            }

            // Add music
            for (const musicName of venue.music) {
                const musicType = await prisma.musicType.upsert({
                    where: { slug: musicName.toLowerCase().replace(/\s+/g, '-') },
                    update: {},
                    create: {
                        name: musicName,
                        slug: musicName.toLowerCase().replace(/\s+/g, '-')
                    }
                });

                await prisma.venueMusicType.create({
                    data: { venueId: createdVenue.id, musicTypeId: musicType.id }
                });
            }

            console.log(`   ✅ Imported "${venue.name}" in ${venue.city}`);
            imported++;

        } catch (error) {
            console.error(`   ❌ Error importing "${venue.name}":`, error);
        }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);

    await prisma.$disconnect();
}

importNightlifeVenues();
