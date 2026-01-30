import { PrismaClient, MainCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper slugify
const slugify = (text: string) =>
    text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end

async function main() {
    const rawData = fs.readFileSync(path.join('C:', 'Users', 'm.fatih', 'Desktop', 'agora', 'Nouveau dossier', 'agora_venues_safe.jsonl'), 'utf8');
    const lines = rawData.split('\n').filter(line => line.trim() !== '');

    console.log(`🚀 Starting import of ${lines.length} venues...`);

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

            // Map JSONL mainCategory to Prisma MainCategory
            // In JSONL: RESTAURANT, CAFE, BAR, NIGHTCLUB, SPA
            // In Prisma: CAFE, RESTAURANT, NIGHTLIFE_BARS, CLUBS_PARTY, EVENTS, ACTIVITIES_FUN, WELLNESS_HEALTH
            let mainCategory: MainCategory;

            const rawCat = data.mainCategory;
            if (rawCat === 'RESTAURANT') mainCategory = 'RESTAURANT';
            else if (rawCat === 'CAFE') mainCategory = 'CAFE';
            else if (rawCat === 'BAR') mainCategory = 'NIGHTLIFE_BARS';
            else if (rawCat === 'NIGHTCLUB') mainCategory = 'CLUBS_PARTY';
            else if (rawCat === 'SPA') mainCategory = 'WELLNESS_HEALTH';
            else mainCategory = 'ACTIVITIES_FUN';

            const cityId = cityMap.get(data.city.toLowerCase());

            if (!cityId) {
                console.warn(`⚠️  City not found for: ${data.name} (${data.city})`);
                continue;
            }

            // Fallback image if none
            const coverImageUrl = data.coverImageUrl || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000`;

            await prisma.venue.upsert({
                where: { slug: data.slug },
                update: {},
                create: {
                    name: data.name,
                    slug: data.slug,
                    description: data.description || `Special ${mainCategory.toLowerCase()} in ${data.city}.`,
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
                    // Add some base facilities based on types
                    facilities: {
                        create: data.sourceTypes?.includes('park') ? [{ facility: { connect: { code: 'PARKING' } } }] : []
                    }
                }
            });

            count++;
            if (count % 20 === 0) console.log(`✅ Progress: ${count}/${lines.length}`);
        } catch (e: any) {
            console.error(`❌ Error importing line: ${e.message}`);
        }
    }

    console.log(`✨ Successfully imported ${count} venues!`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
