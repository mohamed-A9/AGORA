import { PrismaClient, MainCategory } from '@prisma/client'
import { TAXONOMY } from '../lib/taxonomy'
import { moroccanCities } from '../lib/constants'
import { CASABLANCA_VENUES } from './data/casablanca'

const prisma = new PrismaClient()

// Helper slugify
const slugify = (text: string) =>
    text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end

async function main() {
    console.log('🌱 Starting seed with EXTENDED taxonomy...')

    // 1. Clean up
    try {
        await prisma.venueSubcategory.deleteMany()
        await prisma.venueCuisine.deleteMany()
        await prisma.venueVibe.deleteMany()
        await prisma.venueMusicType.deleteMany()
        await prisma.venuePolicy.deleteMany()
        await prisma.venueFacility.deleteMany()
        await prisma.venueTag.deleteMany()
        await prisma.event.deleteMany()
        await prisma.venue.deleteMany()

        await prisma.subcategory.deleteMany()
        await prisma.cuisine.deleteMany()
        await prisma.vibe.deleteMany()
        await prisma.musicType.deleteMany()
        await prisma.policy.deleteMany()
        await prisma.facility.deleteMany()
        await prisma.city.deleteMany()
        console.log('🧹 Database cleaned')
    } catch (e) {
        console.log('⚠️  Clean up failed (might be empty), continuing...')
    }

    // 2. Seed Cities
    for (const name of moroccanCities) {
        await prisma.city.upsert({
            where: { slug: slugify(name) },
            update: {},
            create: { name, slug: slugify(name) }
        })
    }
    console.log('🏙️  Cities seeded')

    // 3. Seed Global Lookups
    for (const name of TAXONOMY.CUISINES) {
        await prisma.cuisine.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name) } })
    }
    for (const name of TAXONOMY.VIBES) {
        await prisma.vibe.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name) } })
    }
    for (const name of TAXONOMY.MUSIC_TYPES) {
        await prisma.musicType.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name) } })
    }
    for (const { code, label } of TAXONOMY.POLICIES) {
        await prisma.policy.upsert({ where: { code }, update: {}, create: { code, label } })
    }
    for (const { code, label } of TAXONOMY.FACILITIES) {
        await prisma.facility.upsert({ where: { code }, update: {}, create: { code, label } })
    }
    console.log('📚 Global lookups seeded')

    // 4. Seed Subcategories by Main Category
    for (const [catKey, subList] of Object.entries(TAXONOMY.SUBCATEGORIES)) {
        const mainCat = catKey as MainCategory; // Ensure matched
        for (const name of subList) {
            try {
                const slug = slugify(name)
                await prisma.subcategory.upsert({
                    where: { slug }, // Assuming global slug uniqueness for simplicity
                    update: { mainCategory: mainCat },
                    create: { name, slug, mainCategory: mainCat }
                })
            } catch (e) {
                // Ignore duplicates or conflicts
            }
        }
    }
    console.log('📂 Subcategories seeded')

    // 5. Seed diverse venues
    const casaCity = await prisma.city.findUnique({ where: { slug: 'casablanca' } })
    if (!casaCity) return;

    const VENUE_NAMES = [
        "Le Petit Coin", "Sky 28", "Rick's Café", "La Sqala", "Cabestan",
        "Lily's", "Zayna", "Organic Kitchen", "Blend", "Bondi Coffee",
        "Amoud", "Paul", "Venezia Ice", "Starbucks", "Carrion",
        "The Jame's Rooftop", "Le Kimmy'z", "Boccaccio", "Trica",
        "Le Cenacle", "Dar Dada", "Nkoa", "Ifrane", "Basmane",
        "Gatsby", "Soho House", "Havana", "Bambou", "La Bodega",
        "Irish Pub", "Brooklyn Bar", "Vertigo", "Tiger House", "Yellow Club"
    ];

    const DESCRIPTIONS = [
        "An amazing spot for friends and family.",
        "Experience the best vibes in town.",
        "Luxury dining with a view.",
        "Cozy atmosphere and great coffee.",
        "Perfect for a night out with great music.",
        "Authentic tastes in a modern setting.",
        "Relax and unwind in our beautiful space.",
        "The ultimate destination for fun and entertainment.",
        "Award-winning service and exquisite menu.",
        "A hidden gem in the heart of the city."
    ];

    const IMAGES_BY_CATEGORY: Record<MainCategory, string[]> = {
        RESTAURANT: [
            "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000"
        ],
        CAFE: [
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000"
        ],
        NIGHTLIFE_BARS: [
            "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1536935338725-8f32e7c37487?auto=format&fit=crop&q=80&w=1000"
        ],
        CLUBS_PARTY: [
            "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1574391884720-2e45597e95b6?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000"
        ],
        ACTIVITIES_FUN: [
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000", // Bowling
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000", // Gaming
            "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&q=80&w=1000", // Cinema
            "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=1000", // Karting
            "https://images.unsplash.com/photo-1576435728678-be95f39e8ab7?auto=format&fit=crop&q=80&w=1000"
        ],
        WELLNESS_HEALTH: [
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=1000"
        ],
        EVENTS: [
            "https://images.unsplash.com/photo-1459749411177-71299e497e8e?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1470229722913-7ea051c7130e?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1533174072545-e8d985973970?auto=format&fit=crop&q=80&w=1000"
        ]
    };

    // Helper to get random subset
    function getRandom<T>(arr: T[], n: number = 1): T[] {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    function getRandomOne<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    console.log('🏭 Generating simulated venues...');

    // Taxonomy Keys for Random Assignment
    const ALL_CUISINES = TAXONOMY.CUISINES;
    const ALL_VIBES = TAXONOMY.VIBES;
    const ALL_MUSIC = TAXONOMY.MUSIC_TYPES;
    const ALL_FACILITIES = TAXONOMY.FACILITIES.map(f => f.code);
    const ALL_POLICIES = TAXONOMY.POLICIES.map(p => p.code);

    // Fetch existing slugs to ensure referential integrity
    const existingSubcategorySlugs = (await prisma.subcategory.findMany({ select: { slug: true } })).map(s => s.slug);


    // 4. Seed Real Venues
    console.log('🏭 Seeding real venues from CASABLANCA_VENUES...');

    // Import here or at top (dynamic import if needed, or just standard if file serves)
    // Since we can't easily add top-level imports with replace_file_content acting on mid-file, 
    // we'll assume the import is added or we use require/dynamic import if possible. 
    // Better to ADD the import at the top in a separate move or just use the data if available contextually.
    // Actually, I'll just paste the array's content logic here for safety or try to import it if I can edit the top.
    // Let's use the tool to edit the file fully or assume I can modify the loop.

    // For this specific tool call, I will Replace the LOOP. 
    // Given the constraints, I will add the import at the top in a separate edit, 
    // or just defined the array in the replace block if it's small? 
    // The array is in a separate file. I should try to import it.

    for (const venueData of CASABLANCA_VENUES) {
        // Check if exists
        const slug = slugify(`${venueData.name}-${Math.floor(Math.random() * 100)}`); // simple slug

        try {
            await prisma.venue.create({
                data: {
                    name: venueData.name,
                    slug: slugify(venueData.name) + '-' + Math.floor(Math.random() * 1000), // ensure unique
                    description: venueData.description,
                    mainCategory: venueData.mainCategory,
                    cityId: casaCity.id,
                    priceLevel: venueData.priceLevel,
                    address: venueData.address,
                    lat: venueData.lat,
                    lng: venueData.lng,

                    // Contact
                    phone: venueData.phone,
                    website: venueData.website,
                    instagram: venueData.instagram,
                    facebookUrl: venueData.facebookUrl,
                    locationUrl: venueData.locationUrl,

                    coverImageUrl: venueData.coverImageUrl,

                    isVerified: true, // Real venues are verified
                    isActive: true,
                    status: 'APPROVED',

                    rating: 4.0 + Math.random(), // 4.0-5.0 for these quality venues
                    numReviews: Math.floor(Math.random() * 200) + 50,

                    // Relations
                    subcategories: {
                        create: (venueData.subcategories || []).map((s: string) => ({
                            subcategory: {
                                connectOrCreate: {
                                    where: { slug: slugify(s) },
                                    create: { name: s, slug: slugify(s), mainCategory: venueData.mainCategory }
                                }
                            }
                        }))
                    },
                    cuisines: {
                        create: (venueData.cuisines || []).map((c: string) => ({
                            cuisine: {
                                connectOrCreate: {
                                    where: { slug: slugify(c) },
                                    create: { name: c, slug: slugify(c) }
                                }
                            }
                        }))
                    },
                    vibes: {
                        create: (venueData.vibes || []).map((v: string) => ({
                            vibe: {
                                connectOrCreate: {
                                    where: { slug: slugify(v) },
                                    create: { name: v, slug: slugify(v) }
                                }
                            }
                        }))
                    },
                    facilities: {
                        create: (venueData.facilities || []).map((f: string) => ({
                            facility: {
                                connectOrCreate: {
                                    where: { code: f },
                                    create: { code: f, label: f.replace(/_/g, ' ') }
                                }
                            }
                        }))
                    },
                    policies: {
                        create: (venueData.policies || []).map((p: string) => ({
                            policy: {
                                connectOrCreate: {
                                    where: { code: p },
                                    create: { code: p, label: p.replace(/_/g, ' ') }
                                }
                            }
                        }))
                    },

                    // Gallery & Media
                    gallery: {
                        create: [
                            // 1. Cover Image
                            { url: venueData.coverImageUrl, kind: 'image', sortOrder: 0 },

                            // 2. Specific Gallery Images (if any)
                            ...(venueData.galleryImages || []).map((url: string, i: number) => ({
                                url, kind: 'image', sortOrder: i + 1
                            })),

                            // 3. Fallback: If no specific images, add randoms (only if galleryImages is missing)
                            ...(!venueData.galleryImages && IMAGES_BY_CATEGORY[venueData.mainCategory]
                                ? IMAGES_BY_CATEGORY[venueData.mainCategory].slice(0, 3).map((url: string, i: number) => ({
                                    url, kind: 'image', sortOrder: i + 1
                                }))
                                : []),

                            // 4. Menu PDF (if any)
                            // We treat it as part of media/gallery for now, but with kind='pdf'
                            ...(venueData.menuUrl ? [{
                                url: venueData.menuUrl,
                                kind: 'pdf',
                                sortOrder: 99
                            }] : [])
                        ]
                    }
                }
            });
            process.stdout.write('+');
        } catch (e: any) {
            console.error(`\nFailed to seed ${venueData.name}: ${e.message}`);
        }
    }
    console.log('\n✨ Created 40 rich venues.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
