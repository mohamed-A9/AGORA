import { PrismaClient, MainCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Slugify helper
const slugify = (text: string) =>
    text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

// Image Pools
const CATEGORY_IMAGES: Record<string, string[]> = {
    RESTAURANT: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1550966842-2410b0200844?auto=format&fit=crop&q=80&w=1000"
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
    WELLNESS_HEALTH: [
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=1000"
    ]
};

async function main() {
    const jsonlPath = 'C:/Users/m.fatih/Desktop/agora/Nouveau dossier/agora_venues_with_photos.jsonl';
    const rawData = fs.readFileSync(jsonlPath, 'utf8');
    const lines = rawData.split('\n').filter(line => line.trim() !== '');

    console.log(`🚀 Starting clean re-import of ${lines.length} venues...`);

    // Ensure cities exist
    const cities = ["Casablanca", "Marrakech", "Agadir", "Tangier", "Rabat", "Fes"];
    for (const cityName of cities) {
        await prisma.city.upsert({
            where: { slug: slugify(cityName) },
            update: {},
            create: { name: cityName, slug: slugify(cityName) }
        });
    }

    const cityMap = new Map();
    const dbCities = await prisma.city.findMany();
    dbCities.forEach(c => cityMap.set(c.name.toLowerCase(), c.id));

    let count = 0;
    for (const line of lines) {
        try {
            const data = JSON.parse(line);
            let mainCategory: MainCategory;

            const rawCat = data.mainCategory;
            if (rawCat === 'RESTAURANT') mainCategory = 'RESTAURANT';
            else if (rawCat === 'CAFE') mainCategory = 'CAFE';
            else if (rawCat === 'BAR') mainCategory = 'NIGHTLIFE_BARS';
            else if (rawCat === 'NIGHTCLUB') mainCategory = 'CLUBS_PARTY';
            else if (rawCat === 'SPA') mainCategory = 'WELLNESS_HEALTH';
            else mainCategory = 'ACTIVITIES_FUN';

            const cityId = cityMap.get(data.city.toLowerCase());
            if (!cityId) continue;

            // Diversified Image Logic
            const imagePool = CATEGORY_IMAGES[mainCategory] || CATEGORY_IMAGES.RESTAURANT;
            const coverImageUrl = imagePool[Math.floor(Math.random() * imagePool.length)];

            await prisma.venue.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    description: data.description || `Experience the best ${mainCategory.toLowerCase().replace('_', ' ')} in ${data.city}.`,
                    mainCategory,
                    cityId,
                    address: data.address,
                    lat: data.lat,
                    lng: data.lng,
                    phone: data.phone,
                    website: data.website,
                    locationUrl: data.locationUrl,
                    priceLevel: data.priceLevel,
                    rating: data.rating || 0,
                    numReviews: data.numReviews || 0,
                    coverImageUrl,
                    status: 'APPROVED',
                    isActive: true,
                    isVerified: true,
                    gallery: {
                        create: imagePool.slice(0, 3).map((url, i) => ({
                            url,
                            kind: 'image',
                            sortOrder: i
                        }))
                    }
                }
            });

            count++;
            if (count % 20 === 0) console.log(`✅ Progress: ${count}/${lines.length}`);
        } catch (e: any) {
            console.error(`❌ Error importing ${count}: ${e.message}`);
        }
    }

    console.log(`✨ Successfully re-imported ${count} venues with diversified images!`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
