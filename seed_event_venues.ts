import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Event Venues...');

    const cities = await prisma.city.findMany();
    const cityMap = new Map(cities.map((c) => [c.name, c.id]));

    const venuesData = [
        {
            name: "Studio des Arts Vivants",
            slug: "studio-des-arts-vivants-casablanca",
            description: "A premier cultural hub and theater in Casablanca, hosting concerts, plays, and art exhibitions.",
            mainCategory: "EVENTS",
            cityName: "Casablanca",
            address: "38 Boulevard Abdelhadi Botaieb, Casablanca",
            coverImageUrl: "https://images.unsplash.com/photo-1514302240736-b1fee5989c41?auto=format&fit=crop&w=1200&q=80",
            rating: 4.8,
            numReviews: 156,
        },
        {
            name: "Megarama Casablanca",
            slug: "megarama-casablanca",
            description: "The largest cinema complex in Africa, also hosting massive concerts and events by the sea.",
            mainCategory: "EVENTS",
            cityName: "Casablanca",
            address: "Boulevard de la Corniche, Aïn Diab, Casablanca",
            coverImageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
            rating: 4.5,
            numReviews: 2400,
        },
        {
            name: "Théâtre National Mohammed V",
            slug: "theatre-national-mohammed-v-rabat",
            description: "The most prestigious theater in Morocco, located in the heart of Rabat.",
            mainCategory: "EVENTS",
            cityName: "Rabat",
            address: "Rue Al Mansour Ad Dahbi, Rabat",
            coverImageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
            rating: 4.7,
            numReviews: 890,
        },
        {
            name: "Cinema Rialto",
            slug: "cinema-rialto-casablanca",
            description: "Historic Art Deco cinema and event space in the heart of Casablanca, established in 1930.",
            mainCategory: "EVENTS",
            cityName: "Casablanca",
            address: "35 Rue Mohammed El Qory, Casablanca",
            coverImageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
            rating: 4.6,
            numReviews: 420,
        },
        {
            name: "Palais des Congrès Marrakech",
            slug: "palais-des-congres-marrakech",
            description: "World-class convention center hosting the Marrakech International Film Festival and major global events.",
            mainCategory: "EVENTS",
            cityName: "Marrakech",
            address: "Boulevard Mohamed VI, Marrakech",
            coverImageUrl: "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?auto=format&fit=crop&w=1200&q=80",
            rating: 4.9,
            numReviews: 1200,
        },
        {
            name: "Complexe Mohammed V",
            slug: "complexe-mohammed-v-casablanca",
            description: "The iconic stadium of Casablanca, used for major sporting events and large-scale stadium concerts.",
            mainCategory: "EVENTS",
            cityName: "Casablanca",
            address: "Rue Ahmed El Yazidi, Casablanca",
            coverImageUrl: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80",
            rating: 4.4,
            numReviews: 5600,
        },
        {
            name: "L'Uzine",
            slug: "l-uzine-casablanca",
            description: "Alternative art space and cultural center focusing on contemporary creation and underground events.",
            mainCategory: "EVENTS",
            cityName: "Casablanca",
            address: "Route de Rabat, Ain Sebaa, Casablanca",
            coverImageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
            rating: 4.7,
            numReviews: 310,
        },
        {
            name: "Villa des Arts Rabat",
            slug: "villa-des-arts-rabat",
            description: "Elegant cultural space hosted in a colonial mansion, perfect for intimate concerts and art shows.",
            mainCategory: "EVENTS",
            cityName: "Rabat",
            address: "10 Rue Beni Mellal, Rabat",
            coverImageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecea8f82?auto=format&fit=crop&w=1200&q=80",
            rating: 4.8,
            numReviews: 540,
        },
        {
            name: "Salle Omnisports M'Hamid",
            slug: "salle-omnisports-mhamid-marrakech",
            description: "Large indoor arena in Marrakech used for concerts, festivals, and sporting events.",
            mainCategory: "EVENTS",
            cityName: "Marrakech",
            address: "Avenue M'Hamid, Marrakech",
            coverImageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80",
            rating: 4.2,
            numReviews: 210,
        },
        {
            name: "Complexe Moulay Abdellah",
            slug: "complexe-moulay-abdellah-rabat",
            description: "The main stadium in Rabat, hosting international festivals like Mawazine on its massive grounds.",
            mainCategory: "EVENTS",
            cityName: "Rabat",
            address: "Route de Casablanca, Rabat",
            coverImageUrl: "https://images.unsplash.com/photo-1522158673376-3ae012356396?auto=format&fit=crop&w=1200&q=80",
            rating: 4.5,
            numReviews: 4300,
        }
    ];

    for (const v of venuesData) {
        const cityId = cityMap.get(v.cityName);
        if (!cityId) {
            console.warn(`City ${v.cityName} not found, skipping ${v.name}`);
            continue;
        }

        await prisma.venue.upsert({
            where: { slug: v.slug },
            update: {},
            create: {
                name: v.name,
                slug: v.slug,
                description: v.description,
                mainCategory: v.mainCategory as any,
                cityId: cityId,
                address: v.address,
                coverImageUrl: v.coverImageUrl,
                rating: v.rating,
                numReviews: v.numReviews,
                isActive: true,
                status: "APPROVED",
                isVerified: true
            }
        });
        console.log(`✅ Upserted: ${v.name}`);
    }

    console.log('🚀 Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
