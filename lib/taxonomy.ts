
// lib/taxonomy.ts

// import { MainCategory } from "@prisma/client";

export const TAXONOMY = {
    // LEVEL 1: Main Categories (Enums)
    CATEGORIES: [
        { label: "Café", value: "CAFE", icon: "☕", description: "Coffee shops, tea houses, brunch & lounge cafés" },
        { label: "Restaurant", value: "RESTAURANT", icon: "🍽️", description: "Moroccan & international cuisine, casual to fine dining" },
        { label: "Nightlife & Bars", value: "NIGHTLIFE_BARS", icon: "🍸", description: "Cocktail bars, rooftops, lounges & pubs" },
        { label: "Clubs & Party", value: "CLUBS_PARTY", icon: "🎧", description: "Nightclubs, beach clubs, DJs & parties" },
        { label: "Events", value: "EVENTS", icon: "🎟️", description: "Concerts, festivals, comedy, shows & conferences" },
        { label: "Activities & Fun", value: "ACTIVITIES_FUN", icon: "🎯", description: "Sports games, culture & leisure" },
        { label: "Wellness & Health", value: "WELLNESS_HEALTH", icon: "🧖", description: "Hammam, spa, gym, yoga, recovery & beauty" }
    ],

    // LEVEL 2: Subcategories (Grouped by Main Category)
    SUBCATEGORIES: {
        CAFE: [
            "Coffee shop", "Specialty coffee", "Tea house", "Lounge café", "Rooftop café",
            "Bakery café", "Brunch café", "Internet café", "Coworking café", "Concept café",
            "Cat café", "Book café", "Shisha café", "Garden café", "Beach café"
        ],
        RESTAURANT: [
            "Fine dining", "Casual dining", "Fast casual", "Family restaurant", "Buffet",
            "All-you-can-eat", "Street food", "Food court", "Pop-up restaurant",
            "Rooftop restaurant", "Beach restaurant", "Hotel restaurant", "Private dining"
        ],
        NIGHTLIFE_BARS: [
            "Cocktail bar", "Lounge bar", "Rooftop bar", "Sports bar", "Wine bar",
            "Whisky bar", "Beer pub", "Craft beer bar", "Beach bar", "Pool bar",
            "Hotel bar", "Piano bar", "Jazz bar", "Shisha bar", "Speakeasy", "Afterwork bar"
        ],
        CLUBS_PARTY: [
            "Nightclub", "Underground club", "Techno club", "House club", "Afro club",
            "Hip-hop club", "Commercial club", "Latin club", "Beach club", "Pool party club",
            "After-party club", "Open-air club", "Festival club", "Private club", "LGBTQ+ club"
        ],
        EVENTS: [
            "Concert", "Festival", "DJ party", "Live show", "Theatre", "Comedy show",
            "Stand-up", "Opera", "Ballet", "Circus", "Cultural event", "Art exhibition",
            "Fashion show", "Movie premiere", "Screening", "Conference", "Talk",
            "Workshop", "Meetup", "Networking event", "Product launch", "Private event", "Corporate event"
        ],
        ACTIVITIES_FUN: [
            // Entertainment
            "Cinema", "Escape game", "Bowling", "Arcade", "VR experience", "Laser game",
            "Board games café", "Gaming lounge", "E-sports arena",
            // Action
            "Karting", "Paintball", "Quad / ATV", "Buggy", "Zipline", "Climbing",
            "Hiking", "Surfing", "Kitesurf", "Paddle", "Kayak", "Diving", "Snorkeling",
            "Horse riding", "Camel riding", "Paragliding", "Skydiving",
            // Culture
            "Art gallery", "Museum", "Photography exhibition", "Painting workshop",
            "Pottery workshop", "Cooking class", "Mixology workshop", "Wine tasting",
            "Coffee tasting", "Cultural tour", "City tour",
            // Family
            "Kids playground", "Theme park", "Water park", "Zoo", "Aquarium",
            "Family park", "Educational activity"
        ],
        WELLNESS_HEALTH: [
            // Wellness
            "Hammam", "Spa", "Massage", "Sauna", "Steam room", "Thalasso", "Wellness retreat",
            // Health & Fitness
            "Gym", "Fitness class", "Yoga", "Pilates", "CrossFit", "Meditation", "Breathwork",
            // Care & Recovery
            "Facial care", "Body treatments", "Physiotherapy", "Cryotherapy", "Recovery center"
        ]
    },

    // For displaying in groups
    CUISINE_GROUPS: {
        "Popular & Fast Food": [
            "Pizza", "Burger", "Sushi", "Tacos", "Pasta", "Sandwiches", "Fried Chicken",
            "Steak", "Seafood", "Salad", "Bowl", "Dessert", "Breakfast", "Brunch"
        ],
        "Asian": [
            "Asian", "Japanese", "Chinese", "Thai", "Korean", "Vietnamese", "Indian", "Pakistani",
            "Indonesian", "Malaysian", "Filipino", "Nepalese", "Pan-Asian", "Asian Fusion",
            "Ramen", "Dim Sum", "Dumplings", "Bao Buns", "Curry", "Tandoori", "Biryani",
            "Pad Thai", "Pho", "Banh Mi", "Kimchi", "BBQ Korean", "Teppanyaki", "Wok"
        ],
        "European & Mediterranean": [
            "European", "French", "Italian", "Spanish", "Greek", "Portuguese", "British", "German",
            "Belgian", "Swiss", "Scandinavian", "Eastern European", "Nordic", "Alpine",
            "Mediterranean", "Mediterranean fusion", "Seafood Mediterranean", "Riviera",
            "Paella", "Tapas", "Fondue", "Crepes", "Waffles", "Fish & Chips", "Schnitzel", "Bratwurst",
            "Neapolitan Pizza", "Roman Pizza", "Risotto", "Lasagna",
            "Spaghetti", "Carbonara", "Bolognese", "Alfredo", "Ravioli", "Gnocchi"
        ],
        "Middle Eastern & African": [
            "Middle Eastern", "Lebanese", "Turkish", "Syrian", "Palestinian", "Iranian", "Gulf cuisine",
            "African", "Moroccan", "North African", "Berber", "Tunisian", "Egyptian", "Ethiopian", "West African",
            "Tagine", "Couscous", "Rfissa", "Pastilla", "Mechoui", "Harira",
            "Kebab", "Shawarma", "Falafel", "Hummus", "Mezze", "Baklava", "Manakish"
        ],
        "Americas": [
            "American", "American classic", "Tex-Mex", "Southern", "Cajun", "Creole", "Californian",
            "Latin", "Mexican", "Peruvian", "Brazilian", "Argentine", "Colombian", "Caribbean", "Cuban",
            "Smash Burger", "Hot Dog", "BBQ", "Ribs", "Wings", "Burritos",
            "Nachos", "Quesadillas", "Fajitas", "Ceviche", "Empanadas", "Arepas", "Churrasco",
            "New York Style", "Chicago Style", "Detroit Style", "Hawaiian"
        ],
        "Sweets, Bakery & Breakfast": [
            "Breakfast", "Brunch", "Pancakes", "French Toast", "Eggs Benedict", "Omelette",
            "Bakery", "Patisserie", "Viennoiserie", "Croissant", "Bread", "Sourdough",
            "Dessert", "Ice Cream", "Gelato", "Frozen Yogurt", "Donuts", "Cookies",
            "Chocolate", "Candy", "Cake", "Birthday Cakes", "Custom Cakes", "Pie", "Macarons",
            "Cheesecake", "Brownies", "Cupcakes", "Muffins",
            "Churros", "Creperie", "Waffle House", "High Tea", "Afternoon Tea"
        ],
        "Healthy & Dietary": [
            "Vegan", "Vegetarian", "Plant-based", "Gluten-free", "Lactose-free", "Sugar-free", "Nut-free",
            "Healthy", "Bio", "Organic", "Farm-to-Table", "Sustainable", "Raw Food",
            "Halal", "Kosher", "Keto", "Paleo", "Low Carb", "Salad Bar", "Poke Bowl", "Acai Bowl"
        ],
        "Beverages & Nightlife": [
            "Specialty Coffee", "Tea House", "Matcha", "Chai", "Coffee Shop",
            "Juice Bar", "Smoothies", "Bubble Tea", "Milkshakes",
            "Cocktail Bar", "Wine Bar", "Craft Beer", "Brewery", "Pub Food", "Whisky Bar"
        ],
        "Specialty & Concepts": [
            "Fine Dining", "Casual Dining", "Fast Food", "Street Food", "Food Truck",
            "Comfort Food", "Soul Food", "Gastropub", "Bistro", "Brasserie", "Taverna",
            "Buffet", "All-you-can-eat", "Concept Food", "Molecular Gastronomy", "Fusion",
            "Steakhouse", "Rotisserie", "Grill", "Churrascaria",
            "Fish Market", "Oyster Bar", "Lobster", "Crab", "Seafood",
            "Wagyu", "Truffle", "Caviar", "Oysters", "Lobster Roll", "Foie Gras", "Cheese Bar", "Charcuterie",
            "Late Night Food", "Sunday Roast"
        ]
    },

    // Global Lists
    CUISINES: [
        // POPULAR & FAST
        "Pizza", "Burger", "Sushi", "Tacos", "Pasta", "Sandwiches", "Fried Chicken",
        "Steak", "Seafood", "Salad", "Bowl", "Dessert", "Breakfast", "Brunch",

        // African
        "African", "Moroccan", "North African", "Berber", "Tunisian", "Egyptian", "Ethiopian", "West African",
        "Tagine", "Couscous", "Rfissa", "Pastilla", "Mechoui", "Harira",
        // European
        "European", "French", "Italian", "Spanish", "Greek", "Portuguese", "British", "German",
        "Belgian", "Swiss", "Scandinavian", "Eastern European", "Nordic", "Alpine",
        "Paella", "Tapas", "Fondue", "Crepes", "Waffles", "Fish & Chips", "Schnitzel", "Bratwurst",
        // Asian
        "Asian", "Japanese", "Chinese", "Thai", "Korean", "Vietnamese", "Indian", "Pakistani",
        "Indonesian", "Malaysian", "Filipino", "Nepalese", "Pan-Asian", "Asian Fusion",
        "Ramen", "Dim Sum", "Dumplings", "Bao Buns", "Curry", "Tandoori", "Biryani",
        "Pad Thai", "Pho", "Banh Mi", "Kimchi", "BBQ Korean", "Teppanyaki", "Wok",
        // Middle Eastern
        "Middle Eastern", "Lebanese", "Turkish", "Syrian", "Palestinian", "Iranian", "Gulf cuisine",
        "Kebab", "Shawarma", "Falafel", "Hummus", "Mezze", "Baklava", "Manakish",
        // Americas
        "American", "American classic", "Tex-Mex", "Southern", "Cajun", "Creole", "Californian",
        "Latin", "Mexican", "Peruvian", "Brazilian", "Argentine", "Colombian", "Caribbean", "Cuban",
        "Smash Burger", "Hot Dog", "BBQ", "Ribs", "Wings", "Burritos",
        "Nachos", "Quesadillas", "Fajitas", "Ceviche", "Empanadas", "Arepas", "Churrasco",
        // Mediterranean
        "Mediterranean", "Mediterranean fusion", "Seafood Mediterranean", "Riviera",
        // Specialized / Dishes / Styles
        "Fish Market", "Oyster Bar", "Lobster", "Crab",
        "Steakhouse", "Rotisserie", "Grill", "Churrascaria",
        "Neapolitan Pizza", "Roman Pizza", "Risotto", "Lasagna",
        "Spaghetti", "Carbonara", "Bolognese", "Alfredo", "Ravioli", "Gnocchi",
        "Deli", "Bagels", "Wraps", "Panini", "Toast",
        "Salad Bar", "Poke Bowl", "Acai Bowl", "Soup", "Noodles",
        // Breakfast & Brunch & Bakery
        "Pancakes", "French Toast", "Eggs Benedict", "Omelette",
        "Bakery", "Patisserie", "Viennoiserie", "Croissant", "Bread", "Sourdough",
        "Ice Cream", "Gelato", "Frozen Yogurt", "Donuts", "Cookies",
        "Chocolate", "Candy", "Cake", "Birthday Cakes", "Custom Cakes", "Pie", "Macarons",
        "Cheesecake", "Brownies", "Cupcakes", "Muffins",
        // Dietary & Lifestyle
        "Vegan", "Vegetarian", "Plant-based", "Gluten-free", "Lactose-free", "Sugar-free", "Nut-free",
        "Healthy", "Bio", "Organic", "Farm-to-Table", "Sustainable", "Raw Food",
        "Halal", "Kosher", "Keto", "Paleo", "Low Carb",
        // Concepts
        "Fine Dining", "Casual Dining", "Fast Food", "Street Food", "Food Truck",
        "Comfort Food", "Soul Food", "Gastropub", "Bistro", "Brasserie", "Taverna",
        "Buffet", "All-you-can-eat", "Concept Food", "Molecular Gastronomy", "Fusion",
        // Beverages
        "Specialty Coffee", "Tea House", "Matcha", "Chai", "Coffee Shop",
        "Juice Bar", "Smoothies", "Bubble Tea", "Milkshakes",
        "Cocktail Bar", "Wine Bar", "Craft Beer", "Brewery", "Pub Food", "Whisky Bar",
        // More Regional & Specific
        "Basque", "Sicilian", "Tuscan", "Provencal", "Bavarian", "Hawaiian", "Polynesian",
        "New York Style", "Chicago Style", "Detroit Style",
        // Luxury & Ingredients
        "Wagyu", "Truffle", "Caviar", "Oysters", "Lobster Roll", "Foie Gras", "Cheese Bar", "Charcuterie",
        // Snacks & Quick Bites
        "Churros", "Creperie", "Waffle House", "Frozen Custard", "Popcorn", "Pretzels",
        // Occasions
        "High Tea", "Afternoon Tea", "Sunday Roast", "Late Night Food"
    ],

    // Grouped Vibes
    VIBE_GROUPS: {
        "Atmosphere & Mood": [
            "Chill", "Energetic", "Calm", "Lively", "Quiet", "Intimate", "Social", "Festive", "Romantic",
            "Cozy", "Serene", "Electrifying", "Mysterious", "Nostalgic", "Hype", "Laid-back", "Zen"
        ],
        "Style & Decor": [
            "Modern", "Vintage", "Industrial", "Rustic", "Bohemian", "Artsy", "Minimalist", "Retro",
            "Luxury", "Elegant", "Glamorous", "Sophisticated", "Posh", "Upscale", "Premium", "Exclusive",
            "Futuristic", "Neon", "Art Deco", "Gothic", "Botanical", "Tropical", "Oriental", "Instagrammable"
        ],
        "Setting & View": [
            "Rooftop", "Beachfront", "Garden", "Scenic", "Historic", "Terrace", "Courtyard",
            "Waterfront", "Skyline View", "Panoramic", "Hidden Gem", "Speakeasy", "Underground",
            "Outdoor", "Open Air"
        ],
        "Crowd & Occasion": [
            "Casual", "Trendy", "Hipster", "Alternative", "Gritty",
            "Business", "Student-friendly", "Family-friendly", "Date Night", "After Work",
            "Celebratory", "Tourist Friendly", "Local Favorite", "Digital Nomad", "Start-up Friendly"
        ]
    },

    VIBES: [
        "Chill", "Romantic", "Luxury", "Casual", "Festive", "Underground", "Cultural",
        "Family-friendly", "Calm", "Energetic", "Intimate", "Social", "Trendy",
        "Cozy", "Artsy", "Bohemian", "Industrial", "Rustic", "Modern", "Vintage",
        "Business", "Quiet", "Lively", "Sophisticated", "Glamorous", "Retro",
        "Hipster", "Elegant", "Minimalist", "Sporty", "Dark", "Bright",
        "Rooftop", "Beachfront", "Garden", "Historic", "Scenic", "Speakeasy",
        "Student-friendly", "Premium", "Exclusive",
        // Expanded
        "Serene", "Electrifying", "Mysterious", "Nostalgic", "Hype", "Laid-back", "Zen",
        "Posh", "Upscale", "Futuristic", "Neon", "Art Deco", "Gothic", "Botanical", "Tropical", "Oriental", "Instagrammable",
        "Terrace", "Courtyard", "Waterfront", "Skyline View", "Panoramic", "Hidden Gem", "Open Air",
        "Alternative", "Gritty", "Date Night", "After Work", "Celebratory", "Tourist Friendly", "Local Favorite", "Digital Nomad"
    ],



    // Grouped Music
    MUSIC_GROUPS: {
        "Live & Acoustic": [
            "Live band", "Live Piano", "Acoustic", "Jazz", "Blues", "Soul", "Funk",
            "Orchestra", "Classical", "Opera", "Choir", "Guitar", "Saxophone", "Violin", "Percussion", "Singer-Songwriter"
        ],
        "Electronic & Dance": [
            "DJ", "Techno", "House", "Deep House", "Tech House", "Progressive House", "Melodic House",
            "Trance", "Psytrance", "Disco", "Electronic", "Rave", "EDM", "Dubstep", "Drum & Bass",
            "Electro", "Minimal", "Industrial", "Ambient", "Chillout", "Downtempo"
        ],
        "Urban & Hip-Hop": [
            "Hip-Hop", "R&B", "Rap", "Trap", "Drill", "Grime", "Old School Hip-Hop", "Neo-Soul", "Urban"
        ],
        "World & Cultural": [
            "Afro", "Amapiano", "Afrobeats", "Gnaoua", "Tarab", "Chaabi", "Rai", "Amazigh", "Oriental",
            "Arabic Pop", "Khaliji", "Bollywood", "K-Pop", "J-Pop", "Reggae", "Dancehall", "Soca"
        ],
        "Latin & Tropical": [
            "Latin", "Salsa", "Bachata", "Reggaeton", "Merengue", "Cumbia",
            "Bossa Nova", "Samba", "Tango", "Flamenco"
        ],
        "Rock & Alternative": [
            "Rock", "Rock 'n' Roll", "Metal", "Heavy Metal", "Grunge", "Punk", "Post-Punk",
            "Indie", "Alternative", "Folk", "Country", "Blues Rock", "Pop Rock"
        ],
        "Pop & Decades": [
            "Pop", "80s", "90s", "00s", "Retro", "Eurodance", "Synthpop", "Disco"
        ],
        "Mood & Activities": [
            "Lounge", "Background Music", "Lo-fi", "Easy Listening", "Karaoke", "Open Mic", "Quiz Night"
        ]
    },

    MUSIC_TYPES: [
        "DJ", "Live band", "Techno", "House", "Afro", "Amapiano", "Hip-Hop", "R&B",
        "Jazz", "Blues", "Funk", "Disco", "Lounge", "Acoustic", "Pop", "Rock",
        "Reggae", "Latin", "Oriental", "Rave",
        "Deep House", "Reggaeton", "Salsa", "Bachata", "Classical", "Electronic",
        "Indie", "Soul", "Gnaoua", "Tarab", "Chaabi", "Rai", "Amazigh",
        "Rock 'n' Roll", "Metal", "Country", "Folk", "Opera", "Ambient",
        "Background Music", "Live Piano", "Karaoke", "80s", "90s",
        // Expanded
        "Orchestra", "Choir", "Guitar", "Saxophone", "Violin", "Percussion", "Singer-Songwriter",
        "Tech House", "Progressive House", "Melodic House", "Trance", "Psytrance", "EDM", "Dubstep", "Drum & Bass",
        "Electro", "Minimal", "Industrial", "Downtempo", "Chillout",
        "Rap", "Trap", "Drill", "Grime", "Old School Hip-Hop", "Neo-Soul", "Urban",
        "Afrobeats", "Arabic Pop", "Khaliji", "Bollywood", "K-Pop", "J-Pop", "Dancehall", "Soca",
        "Merengue", "Cumbia", "Bossa Nova", "Samba", "Tango", "Flamenco",
        "Heavy Metal", "Grunge", "Punk", "Post-Punk", "Alternative", "Blues Rock", "Pop Rock",
        "00s", "Retro", "Eurodance", "Synthpop",
        "Lo-fi", "Easy Listening", "Open Mic", "Quiz Night"
    ],

    POLICIES: [
        { code: "SMOKING_ALLOWED", label: "Smoking allowed" },
        { code: "NO_SMOKING", label: "Non-smoking" },
        { code: "DRESS_CODE", label: "Dress code", categories: ["Nightlife & Bars", "Clubs & Party", "Restaurant"] },
        { code: "PET_FRIENDLY", label: "Pets allowed", categories: ["Café", "Restaurant", "Activities & Fun"] },
        { code: "ALCOHOL_SERVED", label: "Alcohol served", categories: ["Restaurant", "Nightlife & Bars", "Clubs & Party"] },
        { code: "ALCOHOL_FREE", label: "Alcohol-free", categories: ["Café", "Restaurant"] },
        { code: "RESERVATION_REQUIRED", label: "Reservation required", categories: ["Restaurant", "Nightlife & Bars", "Clubs & Party"] },
        { code: "TICKETED_ENTRY", label: "Ticketed entry", categories: ["Events", "Clubs & Party", "Activities & Fun"] },
        { code: "AGE_RESTRICTED", label: "Age restriction", categories: ["Nightlife & Bars", "Clubs & Party", "Events"] },
        { code: "CASH_ONLY", label: "Cash only" },
        { code: "CARD_PAYMENT", label: "Card payment" },
        { code: "FREE_ENTRY", label: "Free entry", categories: ["Clubs & Party", "Events", "Nightlife & Bars"] }
    ],

    FACILITIES: [
        { code: "BABY_CHAIR", label: "Baby chair", categories: ["Restaurant", "Café"] },
        { code: "DISABLED_ACCESS", label: "Wheelchair Accessible" },
        { code: "PARKING", label: "Parking Lot" },
        { code: "VALET", label: "Valet Parking", categories: ["Restaurant", "Nightlife & Bars", "Clubs & Party", "Events"] },
        { code: "OUTDOOR_SEATING", label: "Outdoor Seating", categories: ["Restaurant", "Café", "Nightlife & Bars"] },
        { code: "WIFI", label: "Free Wi-Fi", categories: ["Café", "Activities & Fun", "Restaurant"] },
        { code: "POWER_OUTLETS", label: "Power Outlets", categories: ["Café", "Activities & Fun"] },
        { code: "AC", label: "Air Conditioning" },
        { code: "OUTDOOR_SPACE", label: "Garden / Terrace" },
        { code: "PHOTO_FRIENDLY", label: "Photo-friendly" },
        { code: "PRAYER_ROOM", label: "Prayer Room" },
        { code: "VIP_AREA", label: "VIP Area", categories: ["Clubs & Party", "Nightlife & Bars"] },
        { code: "PRIVATE_ROOM", label: "Private Dining Room", categories: ["Restaurant"] },
        { code: "SMOKING_AREA", label: "Smoking Area" },
        { code: "NON_SMOKING_AREA", label: "Non-Smoking Area" },
        { code: "LIVE_SPORTS", label: "Live Sports Screening", categories: ["Nightlife & Bars", "Restaurant"] },
        { code: "ROOFTOP", label: "Rooftop Access" },
        { code: "SEA_VIEW", label: "Sea View" },
        { code: "DRIVE_THROUGH", label: "Drive-Through", categories: ["Restaurant"] },
        { code: "DELIVERY", label: "Delivery Service" },
        { code: "TAKEAWAY", label: "Takeaway Available" },
        { code: "WC", label: "WC / Restroom" },
        { code: "KIDS_AREA", label: "Kids Playing Area", categories: ["Restaurant", "Café", "Activities & Fun"] }
    ]
};
