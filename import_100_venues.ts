import { prisma } from "./lib/prisma";

const venues = [
    // ==================== CAFÉS (25) ====================
    { name: "Cafe Imperial", city: "Casablanca", category: "CAFE", subcategory: "Café", address: "9 Rue Chaouia, Casablanca", vibes: ["Vintage", "Cozy"], music: [], priceLevel: 2 },
    { name: "Caféino", city: "Casablanca", category: "CAFE", subcategory: "Coffee shop", address: "Boulevard de la Corniche, Casablanca", vibes: ["Modern", "Social"], music: ["Background Music"], priceLevel: 2 },
    { name: "% Arabica Casablanca", city: "Casablanca", category: "CAFE", subcategory: "Coffee shop", address: "Morocco Mall, Casablanca", vibes: ["Modern", "Minimalist"], music: [], priceLevel: 3 },
    { name: "Bondi Coffee Kitchen", city: "Casablanca", category: "CAFE", subcategory: "Coffee shop", address: "Twin Center, Casablanca", vibes: ["Casual", "Fresh"], music: ["Background Music"], priceLevel: 2 },
    { name: "Espressolab", city: "Casablanca", category: "CAFE", subcategory: "Coffee shop", address: "Anfa Place, Casablanca", vibes: ["Modern", "Cozy"], music: [], priceLevel: 2 },

    { name: "Café des Épices", city: "Marrakech", category: "CAFE", subcategory: "Café", address: "Rahba Lakdima, Medina, Marrakech", vibes: ["Cultural", "Cozy"], music: [], priceLevel: 2 },
    { name: "Café Clock", city: "Marrakech", category: "CAFE", subcategory: "Café", address: "224 Derb Chtouka, Marrakech", vibes: ["Cultural", "Social"], music: ["World Music"], priceLevel: 2 },
    { name: "Atay Café", city: "Marrakech", category: "CAFE", subcategory: "Tea house", address: "66 Derb Jdid, Marrakech", vibes: ["Traditional", "Cozy"], music: [], priceLevel: 2 },
    { name: "Nomad", city: "Marrakech", category: "CAFE", subcategory: "Café", address: "1 Derb Aarjane, Marrakech", vibes: ["Modern", "Upscale"], music: ["Background Music"], priceLevel: 3 },
    { name: "Le Jardin", city: "Marrakech", category: "CAFE", subcategory: "Café", address: "32 Souk Jeld Sidi Abdelaziz, Marrakech", vibes: ["Garden", "Peaceful"], music: [], priceLevel: 3 },

    { name: "Paul Rabat", city: "Rabat", category: "CAFE", subcategory: "Bakery café", address: "Avenue Mohammed V, Rabat", vibes: ["French", "Classic"], music: [], priceLevel: 2 },
    { name: "Café Maure", city: "Rabat", category: "CAFE", subcategory: "Tea house", address: "Kasbah des Oudaias, Rabat", vibes: ["Scenic", "Traditional"], music: [], priceLevel: 1 },
    { name: "Bab Mansour Café", city: "Rabat", category: "CAFE", subcategory: "Café", address: "Agdal, Rabat", vibes: ["Modern", "Social"], music: ["Background Music"], priceLevel: 2 },
    { name: "Columbus Café", city: "Rabat", category: "CAFE", subcategory: "Coffee shop", address: "Mega Mall, Rabat", vibes: ["Casual", "Family-friendly"], music: [], priceLevel: 2 },
    { name: "Vertigo Café", city: "Rabat", category: "CAFE", subcategory: "Café", address: "Rue Monastir, Rabat", vibes: ["Trendy", "Social"], music: ["Background Music"], priceLevel: 2 },

    { name: "Café Clock Fès", city: "Fès", category: "CAFE", subcategory: "Café", address: "7 Derb El Magana, Fès", vibes: ["Cultural", "Cozy"], music: ["World Music"], priceLevel: 2 },
    { name: "Café Najjarine", city: "Fès", category: "CAFE", subcategory: "Tea house", address: "Place Najjarine, Fès", vibes: ["Traditional", "Historic"], music: [], priceLevel: 1 },
    { name: "MB Café", city: "Fès", category: "CAFE", subcategory: "Coffee shop", address: "Boulevard Hassan II, Fès", vibes: ["Modern", "Casual"], music: [], priceLevel: 2 },
    { name: "La Belle Vue", city: "Fès", category: "CAFE", subcategory: "Café", address: "Batha, Fès", vibes: ["Scenic", "Relaxed"], music: [], priceLevel: 2 },
    { name: "Ruined Garden", city: "Fès", category: "CAFE", subcategory: "Café", address: "15 Derb Idrissy, Fès", vibes: ["Garden", "Romantic"], music: [], priceLevel: 3 },

    { name: "Café Hafa", city: "Tangier", category: "CAFE", subcategory: "Tea house", address: "Rue Hafa, Tangier", vibes: ["Historic", "Scenic"], music: [], priceLevel: 1 },
    { name: "Grand Café de Paris", city: "Tangier", category: "CAFE", subcategory: "Café", address: "Place de France, Tangier", vibes: ["Classic", "Historic"], music: [], priceLevel: 2 },
    { name: "Café Tingis", city: "Tangier", category: "CAFE", subcategory: "Café", address: "Medina, Tangier", vibes: ["Traditional", "Cozy"], music: [], priceLevel: 2 },
    { name: "Le Salon Bleu", city: "Tangier", category: "CAFE", subcategory: "Tea house", address: "33 Rue Touila, Tangier", vibes: ["Upscale", "Sophisticated"], music: [], priceLevel: 3 },
    { name: "Café Central", city: "Tangier", category: "CAFE", subcategory: "Café", address: "Petit Socco, Tangier", vibes: ["Historic", "Social"], music: [], priceLevel: 2 },

    // ==================== RESTAURANTS (25) ====================
    { name: "Le Cabestan", city: "Casablanca", category: "RESTAURANT", subcategory: "Seafood", address: "Boulevard de la Corniche, Casablanca", vibes: ["Upscale", "Scenic"], music: ["Background Music"], priceLevel: 4 },
    { name: "Rick's Café", city: "Casablanca", category: "RESTAURANT", subcategory: "International", address: "248 Boulevard Sour Jdid, Casablanca", vibes: ["Upscale", "Historic"], music: ["Live Music"], priceLevel: 4 },
    { name: "La Sqala", city: "Casablanca", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "Boulevard des Almohades, Casablanca", vibes: ["Cultural", "Garden"], music: [], priceLevel: 3 },
    { name: "Le Rouget de l'Isle", city: "Casablanca", category: "RESTAURANT", subcategory: "French", address: "Rue Abdelkrim Diouri, Casablanca", vibes: ["Upscale", "Romantic"], music: [], priceLevel: 4 },
    { name: "La Bodega", city: "Casablanca", category: "RESTAURANT", subcategory: "Spanish", address: "Rue Allal Ben Abdellah, Casablanca", vibes: ["Casual", "Social"], music: ["Background Music"], priceLevel: 3 },
    { name: "Brasserie Bavaroise", city: "Casablanca", category: "RESTAURANT", subcategory: "International", address: "129 Rue Allal Ben Abdellah, Casablanca", vibes: ["Casual", "Classic"], music: [], priceLevel: 3 },

    { name: "Dar Yacout", city: "Marrakech", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "79 Sidi Ahmed Soussi, Marrakech", vibes: ["Upscale", "Cultural"], music: ["World Music"], priceLevel: 4 },
    { name: "Le Foundouk", city: "Marrakech", category: "RESTAURANT", subcategory: "Mediterranean", address: "55 Souk Hal Fassi, Marrakech", vibes: ["Upscale", "Romantic"], music: [], priceLevel: 4 },
    { name: "Al Fassia", city: "Marrakech", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "55 Boulevard Zerktouni, Marrakech", vibes: ["Upscale", "Authentic"], music: [], priceLevel: 3 },
    { name: "La Maison Arabe", city: "Marrakech", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "1 Derb Assehbe, Marrakech", vibes: ["Upscale", "Romantic"], music: ["Live Music"], priceLevel: 4 },
    { name: "Le Jardin", city: "Marrakech", category: "RESTAURANT", subcategory: "Mediterranean", address: "32 Souk Jeld, Marrakech", vibes: ["Garden", "Romantic"], music: [], priceLevel: 3 },
    { name: "Amal", city: "Marrakech", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "Rue Allal Ben Ahmed, Marrakech", vibes: ["Casual", "Authentic"], music: [], priceLevel: 2 },

    { name: "Dar Zaki", city: "Rabat", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "1 Rue Mehdi Ben Barka, Rabat", vibes: ["Upscale", "Cultural"], music: [], priceLevel: 3 },
    { name: "Le Dhow", city: "Rabat", category: "RESTAURANT", subcategory: "Seafood", address: "Marina Bouregreg, Rabat", vibes: ["Upscale", "Scenic"], music: ["Background Music"], priceLevel: 4 },
    { name: "Matsuri", city: "Rabat", category: "RESTAURANT", subcategory: "Japanese", address: "Agdal, Rabat", vibes: ["Modern", "Upscale"], music: [], priceLevel: 3 },
    { name: "Le Petit Beur", city: "Rabat", category: "RESTAURANT", subcategory: "French", address: "8 Rue Ghandi, Rabat", vibes: ["Upscale", "Romantic"], music: [], priceLevel: 4 },
    { name: "Villa Mandarine", city: "Rabat", category: "RESTAURANT", subcategory: "Mediterranean", address: "19 Rue Ouled Bousbaa, Rabat", vibes: ["Upscale", "Garden"], music: [], priceLevel: 4 },

    { name: "Palais Medina & Spa", city: "Fès", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "13 Derb Bensouda, Fès", vibes: ["Upscale", "Cultural"], music: [], priceLevel: 4 },
    { name: "Dar Roumana", city: "Fès", category: "RESTAURANT", subcategory: "Mediterranean", address: "30 Derb El Amer, Fès", vibes: ["Upscale", "Romantic"], music: [], priceLevel: 4 },
    { name: "Riad Rcif", city: "Fès", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "4 Derb Miter, Fès", vibes: ["Cultural", "Cozy"], music: [], priceLevel: 3 },
    { name: "L'Amandier", city: "Fès", category: "RESTAURANT", subcategory: "Mediterranean", address: "Boulevard Chefchaouni, Fès", vibes: ["Upscale", "Modern"], music: [], priceLevel: 3 },

    { name: "El Morocco Club", city: "Tangier", category: "RESTAURANT", subcategory: "International", address: "Place du Tabor, Tangier", vibes: ["Upscale", "Historic"], music: ["Live Music"], priceLevel: 4 },
    { name: "Le Saveur de Poisson", city: "Tangier", category: "RESTAURANT", subcategory: "Seafood", address: "2 Escalier Waller, Tangier", vibes: ["Casual", "Authentic"], music: [], priceLevel: 2 },
    { name: "Dar Nour", city: "Tangier", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "20 Rue Gourna, Tangier", vibes: ["Cultural", "Cozy"], music: [], priceLevel: 3 },
    { name: "Restaurant Hamadi", city: "Tangier", category: "RESTAURANT", subcategory: "Traditional Moroccan", address: "2 Rue Kasbah, Tangier", vibes: ["Traditional", "Family-friendly"], music: [], priceLevel: 2 },

    // ==================== NIGHTLIFE_BARS (25) ====================
    { name: "Le Comptoir Darna Casa", city: "Casablanca", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Boulevard Mohammed V, Casablanca", vibes: ["Upscale", "Energetic"], music: ["Live Music"], priceLevel: 3 },
    { name: "Sky 28", city: "Casablanca", category: "NIGHTLIFE_BARS", subcategory: "Rooftop bar", address: "Sofitel Tour Blanche, Casablanca", vibes: ["Upscale", "Scenic"], music: ["Lounge"], priceLevel: 4 },
    { name: "La Bodega Bar", city: "Casablanca", category: "NIGHTLIFE_BARS", subcategory: "Bar", address: "129 Rue Allal Ben Abdellah, Casablanca", vibes: ["Energetic", "Social"], music: ["Background Music"], priceLevel: 2 },
    { name: "Le Roof", city: "Casablanca", category: "NIGHTLIFE_BARS", subcategory: "Rooftop bar", address: "Corniche, Casablanca", vibes: ["Casual", "Scenic"], music: ["Background Music"], priceLevel: 3 },
    { name: "Armstrong Jazz Bar", city: "Casablanca", category: "NIGHTLIFE_BARS", subcategory: "Jazz bar", address: "Boulevard de la Corniche, Casablanca", vibes: ["Sophisticated", "Cozy"], music: ["Jazz"], priceLevel: 3 },
    { name: "Villa Zevaco", city: "Casablanca", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Anfa, Casablanca", vibes: ["Upscale", "Trendy"], music: ["Live DJ"], priceLevel: 4 },

    { name: "Le Comptoir Darna", city: "Marrakech", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Avenue Echouhada, Marrakech", vibes: ["Upscale", "Energetic"], music: ["Live Music"], priceLevel: 3 },
    { name: "Kechmara", city: "Marrakech", category: "NIGHTLIFE_BARS", subcategory: "Bar", address: "3 Rue de la Liberté, Marrakech", vibes: ["Casual", "Trendy"], music: ["Background Music"], priceLevel: 2 },
    { name: "Baromètre", city: "Marrakech", category: "NIGHTLIFE_BARS", subcategory: "Cocktail bar", address: "Hotel & Ryads Barrière Le Naoura, Marrakech", vibes: ["Upscale", "Sophisticated"], music: ["Lounge"], priceLevel: 4 },
    { name: "Lotus Club", city: "Marrakech", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Palmeraie, Marrakech", vibes: ["Upscale", "Scenic"], music: ["Electronic"], priceLevel: 4 },
    { name: "Café Arabe", city: "Marrakech", category: "NIGHTLIFE_BARS", subcategory: "Bar", address: "184 Rue Mouassine, Marrakech", vibes: ["Casual", "Cultural"], music: ["Background Music"], priceLevel: 2 },
    { name: "Sky Bar Marrakech", city: "Marrakech", category: "NIGHTLIFE_BARS", subcategory: "Rooftop bar", address: "Place Djemaa El Fna, Marrakech", vibes: ["Scenic", "Social"], music: ["Background Music"], priceLevel: 3 },

    { name: "Le Dhow Lounge", city: "Rabat", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Marina Bouregreg, Rabat", vibes: ["Upscale", "Scenic"], music: ["Lounge"], priceLevel: 3 },
    { name: "Le Puzzle", city: "Rabat", category: "NIGHTLIFE_BARS", subcategory: "Bar", address: "Avenue Al Abtal, Rabat", vibes: ["Casual", "Social"], music: ["Live Music"], priceLevel: 2 },
    { name: "Amber Lounge", city: "Rabat", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Sofitel Rabat Jardin des Roses", vibes: ["Upscale", "Sophisticated"], music: ["Lounge"], priceLevel: 4 },
    { name: "La Villa Mandarine Bar", city: "Rabat", category: "NIGHTLIFE_BARS", subcategory: "Bar", address: "19 Rue Ouled Bousbaa, Rabat", vibes: ["Upscale", "Garden"], music: ["Background Music"], priceLevel: 3 },
    { name: "Uptown Bar", city: "Rabat", category: "NIGHTLIFE_BARS", subcategory: "Cocktail bar", address: "Agdal, Rabat", vibes: ["Modern", "Trendy"], music: ["Background Music"], priceLevel: 3 },

    { name: "El Morocco Club Bar", city: "Tangier", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Place du Tabor, Tangier", vibes: ["Upscale", "Cultural"], music: ["World Music"], priceLevel: 3 },
    { name: "Tanjah Flandria", city: "Tangier", category: "NIGHTLIFE_BARS", subcategory: "Bar", address: "83 Rue de la Plage, Tangier", vibes: ["Casual", "Historic"], music: ["Background Music"], priceLevel: 2 },
    { name: "Le Nabab", city: "Tangier", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "4 Rue Al Mansour Dahbi, Tangier", vibes: ["Upscale", "Sophisticated"], music: ["Lounge"], priceLevel: 3 },
    { name: "Tangerine Lounge", city: "Tangier", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Hilton Tangier City Center", vibes: ["Modern", "Upscale"], music: ["Background Music"], priceLevel: 3 },

    { name: "Papagayo Beach Club", city: "Agadir", category: "NIGHTLIFE_BARS", subcategory: "Beach club", address: "Beach Road, Agadir", vibes: ["Casual", "Beach"], music: ["Electronic"], priceLevel: 3 },
    { name: "So Lounge Agadir", city: "Agadir", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Boulevard du 20 Août, Agadir", vibes: ["Casual", "Social"], music: ["Lounge"], priceLevel: 2 },
    { name: "Flamingo Beach", city: "Agadir", category: "NIGHTLIFE_BARS", subcategory: "Beach bar", address: "Corniche, Agadir", vibes: ["Casual", "Beach"], music: ["Background Music"], priceLevel: 2 },
    { name: "Pure Passion", city: "Agadir", category: "NIGHTLIFE_BARS", subcategory: "Lounge", address: "Marina Agadir", vibes: ["Upscale", "Scenic"], music: ["Lounge"], priceLevel: 3 },

    // ==================== CLUBS_PARTY (25) ====================
    { name: "Black House", city: "Casablanca", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Boulevard de la Corniche, Casablanca", vibes: ["Energetic", "Party"], music: ["Electronic", "House"], priceLevel: 3 },
    { name: "Factory", city: "Casablanca", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Ain Diab, Casablanca", vibes: ["Energetic", "Trendy"], music: ["Electronic", "Live DJ"], priceLevel: 3 },
    { name: "Le Relais de Paris", city: "Casablanca", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Anfa, Casablanca", vibes: ["Upscale", "Party"], music: ["House", "Live DJ"], priceLevel: 4 },
    { name: "Backstage Casablanca", city: "Casablanca", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Maarif, Casablanca", vibes: ["Energetic", "Social"], music: ["Hip Hop", "R&B"], priceLevel: 3 },
    { name: "VIP Club Casa", city: "Casablanca", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Boulevard de la Corniche, Casablanca", vibes: ["Upscale", "Exclusive"], music: ["Electronic", "House"], priceLevel: 4 },
    { name: "Movida Casablanca", city: "Casablanca", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Ain Diab, Casablanca", vibes: ["Energetic", "Party"], music: ["Latin", "Commercial"], priceLevel: 3 },

    { name: "Theatro", city: "Marrakech", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Hotel Es Saadi, Marrakech", vibes: ["Upscale", "Glamorous"], music: ["Electronic", "House"], priceLevel: 4 },
    { name: "Pacha Marrakech", city: "Marrakech", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Boulevard Mohamed VI, Marrakech", vibes: ["Upscale", "Party"], music: ["Electronic", "Techno"], priceLevel: 4 },
    { name: "Nikki Beach Marrakech", city: "Marrakech", category: "CLUBS_PARTY", subcategory: "Beach club", address: "Circuit de la Palmeraie, Marrakech", vibes: ["Upscale", "Beach"], music: ["House", "Live DJ"], priceLevel: 4 },
    { name: "555 Famous Club", city: "Marrakech", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Zone Touristique Agdal, Marrakech", vibes: ["Energetic", "Party"], music: ["Commercial", "Hip Hop"], priceLevel: 3 },
    { name: "So Night Lounge", city: "Marrakech", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Palmeraie, Marrakech", vibes: ["Upscale", "Trendy"], music: ["House", "Electronic"], priceLevel: 4 },
    { name: "Montecristo", city: "Marrakech", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Rue Ibn Aicha, Marrakech", vibes: ["Energetic", "Social"], music: ["Commercial", "Live DJ"], priceLevel: 3 },
    { name: "African Chic", city: "Marrakech", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Rue Oum Errabia, Marrakech", vibes: ["Cultural", "Energetic"], music: ["Afrobeat", "Hip Hop"], priceLevel: 3 },

    { name: "Le Mirage", city: "Tangier", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Route de Malabata, Tangier", vibes: ["Energetic", "Scenic"], music: ["Electronic", "House"], priceLevel: 3 },
    { name: "Morocco Palace", city: "Tangier", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Boulevard Mohamed VI, Tangier", vibes: ["Upscale", "Cultural"], music: ["World Music", "Live DJ"], priceLevel: 3 },
    { name: "Le Living", city: "Tangier", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Marina Bay, Tangier", vibes: ["Modern", "Trendy"], music: ["House", "Electronic"], priceLevel: 3 },
    { name: "Tangerina", city: "Tangier", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Rue de Mexico, Tangier", vibes: ["Casual", "Social"], music: ["Commercial", "Latin"], priceLevel: 2 },

    { name: "Flamingo Night", city: "Agadir", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Seafront, Agadir", vibes: ["Beach", "Party"], music: ["Commercial", "House"], priceLevel: 3 },
    { name: "Papagayo Night Club", city: "Agadir", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Marina Agadir", vibes: ["Upscale", "Beach"], music: ["Electronic", "Live DJ"], priceLevel: 3 },
    { name: "So Beach Club", city: "Agadir", category: "CLUBS_PARTY", subcategory: "Beach club", address: "Beach Boulevard, Agadir", vibes: ["Casual", "Beach"], music: ["House", "Reggae"], priceLevel: 2 },

    { name: "VIP Rabat", city: "Rabat", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Agdal, Rabat", vibes: ["Upscale", "Exclusive"], music: ["House", "Electronic"], priceLevel: 4 },
    { name: "Puzzle Night", city: "Rabat", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Avenue Al Abtal, Rabat", vibes: ["Energetic", "Social"], music: ["Commercial", "R&B"], priceLevel: 3 },
    { name: "Amnesia Rabat", city: "Rabat", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Hay Riad, Rabat", vibes: ["Energetic", "Party"], music: ["Electronic", "Techno"], priceLevel: 3 },
    { name: "The Loft", city: "Rabat", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Souissi, Rabat", vibes: ["Modern", "Trendy"], music: ["House", "Live DJ"], priceLevel: 3 },
    { name: "After Club", city: "Rabat", category: "CLUBS_PARTY", subcategory: "Nightclub", address: "Quartier Hassan, Rabat", vibes: ["Casual", "Social"], music: ["Hip Hop", "R&B"], priceLevel: 2 },
];

async function importVenue(venue: any) {
    try {
        // Check if exists
        const existing = await prisma.venue.findFirst({
            where: { name: venue.name }
        });

        if (existing) {
            return { status: "skipped", name: venue.name };
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
                description: `${venue.name} - ${venue.subcategory} in ${venue.city}`,
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

        return { status: "imported", name: venue.name };

    } catch (error) {
        return { status: "error", name: venue.name, error };
    }
}

async function main() {
    console.log("🎯 Importing 100 Venues Across All Categories\n");

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const venue of venues) {
        const result = await importVenue(venue);

        if (result.status === "imported") {
            console.log(`   ✅ ${venue.category}: ${result.name}`);
            imported++;
        } else if (result.status === "skipped") {
            skipped++;
        } else {
            console.error(`   ❌ Error: ${result.name}`);
            errors++;
        }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📈 Total: ${venues.length} venues processed`);

    // Group count by category
    const byCat = venues.reduce((acc, v) => {
        acc[v.category] = (acc[v.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log(`\n📂 By Category:`);
    Object.entries(byCat).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} venues`);
    });

    await prisma.$disconnect();
}

main();
