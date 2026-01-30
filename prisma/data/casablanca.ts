import { MainCategory } from "@prisma/client";

export const CASABLANCA_VENUES = [
    // --- RESTAURANTS ---
    {
        name: "Rick's Café",
        description: "A romantic restaurant bar and lounge, designed to recreate the bar made famous by Humphrey Bogart and Ingrid Bergman in the movie classic Casablanca.",
        mainCategory: MainCategory.RESTAURANT,
        priceLevel: 4,
        address: "248 Boulevard Sour Jdid, Place du Jardin Public, Ancienne Médina, Casablanca",
        lat: 33.6063,
        lng: -7.6186,
        locationUrl: "https://goo.gl/maps/RicksCafe",
        phone: "+212 5222-74207",
        website: "http://www.rickscafe.ma",
        instagram: "https://www.instagram.com/rickscafecasablanca",
        facebookUrl: "https://www.facebook.com/rickscafecasablanca",
        coverImageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80&w=1000", // Luxurious classic bar
        subcategories: ["International", "Live Music", "Lounge"],
        cuisines: ["International", "Seafood", "Moroccan"],
        vibes: ["Romantic", "Luxury", "Jazz"],
        facilities: ["PARKING", "WIFI", "AIR_CONDITIONING"],
        policies: ["DRESS_CODE", "RESERVATION_REQUIRED"]
    },
    {
        name: "Monty's Cafe & Restaurant",
        description: "Ranked #1 in Casablanca, Monty's offers a premium breakfast and brunch experience with exceptional service and a warm, plant-filled atmosphere.",
        mainCategory: MainCategory.RESTAURANT,
        priceLevel: 3,
        address: "11, 12, 12 Bis Rue Mohamed Kamal, Casablanca 20000",
        lat: 33.585,
        lng: -7.638,
        locationUrl: "https://goo.gl/maps/Montys",
        phone: "+212 661-919240",
        coverImageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000", // Trendy upscale cafe/restaurant
        subcategories: ["Premium Cafe", "Brunch", "Casual Dining"],
        cuisines: ["Moroccan", "International"],
        vibes: ["Warm", "Friendly", "Lively"],
        facilities: ["OUTDOOR_SEATING", "WIFI", "VALET_PARKING"],
        policies: ["FAMILY_FRIENDLY"]
    },
    {
        name: "Mood's Café-Restaurant",
        description: "A sophisticated ocean-view venue in the Marina Shopping Center, offering elegant dining and live music in a stunning waterfront setting.",
        mainCategory: MainCategory.RESTAURANT,
        priceLevel: 3,
        address: "Rue Mourabitine Marina Shopping Center, Casablanca",
        lat: 33.607,
        lng: -7.620,
        locationUrl: "https://goo.gl/maps/Moods",
        phone: "+212 5222-02025",
        coverImageUrl: "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?auto=format&fit=crop&q=80&w=1000", // Beachfront/Marina dining
        subcategories: ["Ocean View", "Live Music", "Modern"],
        cuisines: ["International", "Mediterranean"],
        vibes: ["Elegant", "Trendy", "Romantic"],
        facilities: ["OCEAN_VIEW", "OUTDOOR_SEATING", "LIVE_MUSIC"],
        policies: ["DRESS_CODE"]
    },
    {
        name: "Restaurant Soussgrill",
        description: "An authentic Moroccan grill house serving traditional tagines and wood-fired meats in a beautifully designed modern-traditional setting.",
        mainCategory: MainCategory.RESTAURANT,
        priceLevel: 2,
        address: "Bd Ali Yaâta, Casablanca 20250",
        lat: 33.605,
        lng: -7.585,
        locationUrl: "https://goo.gl/maps/Soussgrill",
        phone: "+212 5223-52001",
        coverImageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=1000", // Middle Eastern grill
        subcategories: ["Authentic Moroccan", "Grill", "Family"],
        cuisines: ["Moroccan", "Grill"],
        vibes: ["Traditional", "Authentic", "Warm"],
        facilities: ["OUTDOOR_SEATING", "PARKING"],
        policies: ["FAMILY_FRIENDLY"]
    },
    {
        name: "La Sqala",
        description: "A delightful restaurant nestled in the fortified walls of the 18th-century bastion, offering traditional Moroccan cuisine in a lush Andalusian garden.",
        mainCategory: MainCategory.RESTAURANT,
        priceLevel: 3,
        address: "Boulevard des Almohades, Casablanca",
        lat: 33.6033,
        lng: -7.6190,
        locationUrl: "https://goo.gl/maps/LaSqala",
        phone: "+212 5222-60960",
        website: "http://restopro.ma/lasqala",
        instagram: "https://www.instagram.com/lasqalacasablanca",
        coverImageUrl: "https://images.unsplash.com/photo-1541793618-9128f73e72dc?auto=format&fit=crop&q=80&w=1000", // Moroccan garden vibe
        subcategories: ["Moroccan", "Garden", "Breakfast"],
        cuisines: ["Moroccan"],
        vibes: ["Traditional", "Calm", "Family-friendly"],
        facilities: ["OUTDOOR_SEATING", "WHEELCHAIR_ACCESS"],
        policies: ["SMOKING_ALLOWED"]
    },
    {
        name: "Le Cabestan",
        description: "Perched on the corniche, offering breathtaking ocean views and a chic dining experience with a Mediterranean menu.",
        mainCategory: MainCategory.RESTAURANT,
        priceLevel: 4,
        address: "90 Boulevard de la Corniche, Phare d'El Hank, Casablanca",
        lat: 33.606,
        lng: -7.658,
        locationUrl: "https://goo.gl/maps/LeCabestan",
        phone: "+212 5223-91190",
        website: "http://www.le-cabestan.com",
        instagram: "https://www.instagram.com/lecabestan",
        coverImageUrl: "https://images.unsplash.com/photo-1544124499-58d74548679f?auto=format&fit=crop&q=80&w=1000", // Specific ocean fine dining
        subcategories: ["Fine Dining", "Ocean View", "Seafood"],
        cuisines: ["Mediterranean", "Seafood", "French"],
        vibes: ["Luxury", "Romantic", "Trendy"],
        facilities: ["VALET_PARKING", "OCEAN_VIEW", "FULL_BAR"],
        policies: ["DRESS_CODE"]
    },
    {
        name: "ILOLI",
        description: "High-end Japanese gastronomy combining traditional techniques with local Moroccan ingredients.",
        mainCategory: MainCategory.RESTAURANT,
        priceLevel: 4,
        address: "33 Rue Najib Mahfoud, Casablanca",
        lat: 33.587,
        lng: -7.632,
        locationUrl: "https://goo.gl/maps/ILOLI",
        phone: "+212 608-866633",
        website: "https://iloli-restaurant.com",
        instagram: "https://www.instagram.com/ilolicasablanca",
        coverImageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=1000", // Sushi/Japanese
        subcategories: ["Japanese", "Sushi", "Fine Dining"],
        cuisines: ["Japanese"],
        vibes: ["Trendy", "Luxury", "Zen"],
        facilities: ["PRIVATE_DINING", "WIFI"],
        policies: ["RESERVATION_REQUIRED"]
    },
    {
        name: "Organic Kitchen",
        description: "A sanctuary of healthy eating offering 100% organic, gluten-free, and vegan-friendly options in a serene green setting.",
        mainCategory: MainCategory.RESTAURANT,
        priceLevel: 3,
        address: "6-8 Rue Ahmed El Mokri, Casablanca",
        lat: 33.580,
        lng: -7.640,
        locationUrl: "https://goo.gl/maps/OrganicKitchen",
        phone: "+212 5229-43775",
        instagram: "https://www.instagram.com/organickitchencasablanca",
        coverImageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1000",
        subcategories: ["Healthy", "Vegan", "Gluten Free"],
        vibes: ["Calm", "Nature", "Zen"],
        facilities: ["OUTDOOR_SEATING", "WIFI", "PARKING"],
        galleryImages: [
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=1000"
        ],
        menuUrl: "https://organickitchen.ma/menu.pdf"
    },

    // --- NIGHTLIFE & BARS ---
    {
        name: "Sky 28",
        description: "A sophisticated rooftop bar located on the 28th floor of the Kenzi Tower Hotel, offering panoramic views of Casablanca.",
        mainCategory: MainCategory.NIGHTLIFE_BARS,
        priceLevel: 4,
        address: "Twin Center, Boulevard Mohamed Zerktouni, Casablanca",
        lat: 33.586,
        lng: -7.633,
        locationUrl: "https://goo.gl/maps/Sky28",
        phone: "+212 5229-78000",
        website: "http://www.kenzi-hotels.com",
        instagram: "https://www.instagram.com/sky28casablanca",
        coverImageUrl: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&q=80&w=1000", // Rooftop night
        subcategories: ["Rooftop", "Cocktail Bar", "Lounge"],
        vibes: ["Luxury", "Chill", "Romantic"],
        musicTypes: ["Lounge", "Jazz"],
        facilities: ["ELEVATOR", "FULL_BAR"],
        policies: ["DRESS_CODE"]
    },
    {
        name: "Maison B",
        description: "A trendy venue combining a restaurant, lounge bar, and club concept with stylish decor and vibrant atmosphere.",
        mainCategory: MainCategory.NIGHTLIFE_BARS,
        priceLevel: 3,
        address: "5 Rue de la Mer Adriatique, Casablanca",
        lat: 33.600,
        lng: -7.650,
        locationUrl: "https://goo.gl/maps/MaisonB",
        phone: "+212 698-999444",
        instagram: "https://www.instagram.com/maisonbcasablanca",
        coverImageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=1000", // Club vibe
        subcategories: ["Lounge", "Club", "Restaurant"],
        vibes: ["Festive", "Trendy", "Energetic"],
        musicTypes: ["House", "Commercial"],
        policies: ["DRESS_CODE", "AGE_RESTRICTION"]
    },
    {
        name: "Le Kimmy'z",
        description: "A lively Parisian-style brasserie and bar known for its vibrant musical atmosphere and classic French cuisine.",
        mainCategory: MainCategory.NIGHTLIFE_BARS,
        priceLevel: 3,
        address: "Rue Najib Mahfoud, Casablanca",
        lat: 33.587,
        lng: -7.632,
        locationUrl: "https://goo.gl/maps/Kimmyz",
        phone: "+212 5222-75656",
        instagram: "https://www.instagram.com/lekimmyz",
        coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000", // Lively brasserie
        subcategories: ["Bistro", "Live Band", "Bar"],
        vibes: ["Festive", "Energetic", "Social"],
        musicTypes: ["Live Band", "Pop"],
        policies: ["SMOKING_ALLOWED"]
    },

    // --- CAFES ---
    {
        name: "Cafe Imperial",
        description: "A traditional and relaxed Moroccan cafe in the heart of Gauthier, perfect for an authentic breakfast or a quiet coffee pulse.",
        mainCategory: MainCategory.CAFE,
        priceLevel: 1,
        address: "Rue d'Alger, Casablanca 20250",
        lat: 33.584,
        lng: -7.630,
        locationUrl: "https://goo.gl/maps/CafeImperial",
        phone: "+212 5225-41526",
        coverImageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=1000", // Classic cafe interior
        subcategories: ["Traditional Cafe", "Local Favorite"],
        vibes: ["Traditional", "Calm", "Authentic"],
        facilities: ["OUTDOOR_SEATING", "WIFI"],
        policies: ["SMOKING_ALLOWED"]
    },
    {
        name: "Caféino",
        description: "A cozy and bustling cafe strategically located in Casa Port, offering high-quality coffee and quick bites for travelers and locals alike.",
        mainCategory: MainCategory.CAFE,
        priceLevel: 1,
        address: "Casa Port, Casablanca 20000",
        lat: 33.599,
        lng: -7.615,
        locationUrl: "https://goo.gl/maps/Cafeino",
        phone: "+212 5376-17942",
        coverImageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1000", // Bustling cafe
        subcategories: ["Transit Cafe", "Quick Bite", "Coffee"],
        vibes: ["Busy", "Cozy", "Friendly"],
        facilities: ["WIFI", "TAKEAWAY"],
        policies: ["NO_SMOKING_INDOORS"]
    },
    {
        name: "% Arabica Casablanca",
        description: "Minimalist Japanese coffee house chain known for excellent specialty coffee and sleek design.",
        mainCategory: MainCategory.CAFE,
        priceLevel: 2,
        address: "Boulevard d'Anfa, Casablanca",
        lat: 33.589,
        lng: -7.643,
        locationUrl: "https://goo.gl/maps/Arabica",
        website: "https://arabica.coffee",
        instagram: "https://www.instagram.com/arabica.journal",
        coverImageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000",
        subcategories: ["Specialty Coffee", "Japanese"],
        vibes: ["Modern", "Chill", "Productive"],
        facilities: ["WIFI", "TAKEAWAY"],
        policies: ["NO_SMOKING_INDOORS"],
        galleryImages: [
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000", // Minimalist cafe interior
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1000", // Latte art
            "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1000"  // Coffee shop counter
        ]
    },
    {
        name: "Bondi Coffee Kitchen",
        description: "Australian-inspired cafe serving specialty coffee, healthy brunches, and colorful smoothie bowls.",
        mainCategory: MainCategory.CAFE,
        priceLevel: 2,
        address: "31 Rue Sebou, Gauthier, Casablanca",
        lat: 33.587,
        lng: -7.635,
        locationUrl: "https://goo.gl/maps/Bondi",
        phone: "+212 5222-02020",
        instagram: "https://www.instagram.com/bondicoffeekitchen",
        coverImageUrl: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&q=80&w=1000",
        subcategories: ["Brunch", "Healthy", "Specialty Coffee"],
        vibes: ["Trendy", "Friendly", "Casual"],
        facilities: ["OUTDOOR_SEATING", "WIFI"],
        galleryImages: [
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000", // Avocado toast/brunch
            "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=1000", // Acai bowl
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000"  // Casual coffee vibe
        ]
    },
    {
        name: "Espressolab",
        description: "Spacious industrial-chic coffee shop perfect for working, studying, or enjoying premium roasted coffee and desserts.",
        mainCategory: MainCategory.CAFE,
        priceLevel: 2,
        address: "Boulevard Ghandi, Casablanca",
        lat: 33.575,
        lng: -7.625,
        locationUrl: "https://goo.gl/maps/Espressolab",
        website: "https://espressolab.com",
        instagram: "https://www.instagram.com/espressolabmaroc",
        coverImageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1000", // Industrial coffee shop
        subcategories: ["Coworking Café", "Specialty Coffee", "Bakery"],
        vibes: ["Productive", "Modern", "Social"],
        facilities: ["WIFI", "POWER_OUTLETS", "AC"],
        policies: ["NO_SMOKING_INDOORS"]
    },
    {
        name: "PAUL",
        description: "Famous French bakery and pâtisserie offering fresh bread, pastries, sandwiches, and macarons in a classic Parisian setting.",
        mainCategory: MainCategory.CAFE,
        priceLevel: 2,
        address: "Boulevard d'Anfa / Villa Zevaco, Casablanca",
        lat: 33.592,
        lng: -7.645,
        locationUrl: "https://goo.gl/maps/PAUL",
        website: "https://www.paul.fr/ma",
        instagram: "https://www.instagram.com/paulmaroc",
        coverImageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1000", // Bakery display
        subcategories: ["Bakery", "Breakfast", "French"],
        vibes: ["Traditional", "Family-friendly", "Busy"],
        facilities: ["OUTDOOR_SEATING", "TAKEAWAY"]
    },

    // --- WELLNESS & ACTIVITIES ---
    {
        name: "Hassan II Mosque",
        description: "The largest mosque in Africa, featuring an oceanfront location and a 210m minaret. A must-see architectural masterpiece.",
        mainCategory: MainCategory.ACTIVITIES_FUN,
        priceLevel: 2,
        address: "Boulevard de la Corniche, Casablanca",
        lat: 33.608,
        lng: -7.633,
        locationUrl: "https://goo.gl/maps/HassanII",
        website: "http://www.fmh2.ma",
        coverImageUrl: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80&w=1000", // Specific Hassan II Mosque
        subcategories: ["Sightseeing", "Cultural"],
        vibes: ["Calm", "Spiritual"],
        facilities: ["GUIDED_TOURS"]
    },
    {
        name: "Hammam Ziani",
        description: "A well-known traditional hammam offering authentic Moroccan spa experiences and massages.",
        mainCategory: MainCategory.WELLNESS_HEALTH,
        priceLevel: 2,
        address: "59 Rue Commissaire Ladeuil, Casablanca",
        lat: 33.589,
        lng: -7.614,
        locationUrl: "https://goo.gl/maps/Ziani",
        phone: "+212 5223-19695",
        coverImageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000",
        subcategories: ["Spa", "Hammam", "Massage"],
        vibes: ["Relaxing", "Traditional"],
        facilities: ["LOCKERS", "TOWEL_SERVICE"]
    }
];
