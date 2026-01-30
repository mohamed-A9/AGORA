
export const moroccanCities = [
    "Casablanca", "Rabat", "Marrakech", "Agadir", "Tangier", "Fes", "Meknes",
    "Oujda", "Kenitra", "Tetouan", "Safi", "Mohammedia", "El Jadida", "Beni Mellal",
    "Nador", "Taza", "Settat", "Berrechid", "Khemisset", "Inezgane", "Ksar El Kebir",
    "Larache", "Guelmim", "Khouribga", "Errachidia", "Essaouira", "Dakhla", "Laayoune"
].sort();

export const VENUE_CATEGORIES = ["Restaurant", "Club", "Cafe", "Rooftop", "Lounge", "Bar", "Beach Club"];
export const DRESS_CODES = ["Casual", "Smart Casual", "Formal", "Beachwear", "Sporty", "No Dress Code"];
export const AGE_POLICIES = ["All Ages", "18+", "21+", "23+", "25+", "Family Friendly"];
export const PAYMENT_METHODS = ["Cash", "Credit Card", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Crypto"];

export const AMBIANCES = [
    "Chic & Elegant", "Underground", "Cozy", "Party", "Romantic",
    "Family Friendly", "Business", "Traditional", "Modern", "Rooftop",
    "Speakeasy", "Lounge", "Vibrant", "Chill", "Industrial", "Luxury"
];

export const CUISINES = [
    "Moroccan", "Italian", "French", "Japanese", "Chinese", "Thai", "Vietnamese", "Korean",
    "Mediterranean", "Lebanese", "Turkish", "Greek", "Spanish", "Mexican", "American", "Indian",
    "International", "Asian Fusion", "Latin American", "Comfort Food",
    "Steakhouse", "Seafood", "Grill", "Burgers", "Pizza", "Pasta", "Tapas",
    "Fine Dining", "Brunch", "Vegetarian", "Vegan", "Healthy", "Pastries", "Coffee & Tea"
].sort();

export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const min = (i % 2 === 0 ? '00' : '30');
    return `${hour}:${min}`;
});

export const MUSIC_STYLES = [
    "Techno", "House", "Deep House", "Tech House", "Minimal",
    "Trance", "Progressive", "Electro", "Drum & Bass", "Dubstep",
    "Hip Hop", "R&B", "Trap", "Afrobeat", "Reggaeton",
    "Jazz", "Blues", "Soul", "Funk", "Disco",
    "Rock", "Indie", "Alternative", "Pop", "Latin",
    "Arabic", "Chaabi", "Gnawa", "Raï", "Oriental",
    "Live Band", "Acoustic", "Open Format", "Mixed"
];

export const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
    'restaurants': [
        'Fine Dining', 'Casual Dining', 'Bistro', 'Brasserie',
        'Brunch Spot', 'Coffee Shop', 'Tea House', 'Bakery/Patisserie',
        'Fast Food', 'Food Truck', 'Street Food', 'Food Court',
        'Buffet', 'Cafeteria', 'Diner', 'Gastropub', 'Pizzeria',
        'Steakhouse', 'Seafood Restaurant', 'Vegetarian/Vegan', 'Halal', 'Kosher'
    ],
    'nightlife': [
        'Cocktail Bar', 'Wine Bar', 'Beer Garden', 'Sports Bar',
        'Pub', 'Irish Pub', 'Gastropub', 'Dive Bar', 'Piano Bar',
        'Hotel Bar', 'Tapas Bar', 'Speakeasy', 'Rooftop Bar',
        'Beach Bar', 'Pool Bar', 'Hookah/Shisha Lounge', 'Cigar Bar',
        'Karaoke Bar', 'Comedy Club', 'Jazz Bar', 'Blues Bar'
    ],
    'clubs': [
        'Nightclub', 'Dance Club', 'Beach Club', 'Pool Club',
        'Lounge Club', 'Electronic Music Venue', 'Live Music Club', 'DJ Club',
        'After-Hours Club', 'VIP Club', 'Underground Club', 'Supper Club'
    ],
    'culture': [
        'Art Gallery', 'Museum', 'Theater', 'Cinema',
        'Cultural Center', 'Exhibition Space', 'Performance Venue', 'Library',
        'Opera House', 'Concert Hall', 'Amphitheater', 'Comedy Club',
        'Art Studio', 'Historic Site', 'Monument', 'Planetarium', 'Aquarium'
    ],
    'events': [
        'Concert Hall', 'Events Space', 'Rooftop Venue', 'Private Events',
        'Corporate Events', 'Wedding Venue', 'Conference Center', 'Banquet Hall',
        'Stadium', 'Arena', 'Fairground', 'Park/Garden', 'Boat/Yacht'
    ],
    'activities': [
        'Active & Sport', 'Workshops & Classes', 'Entertainment & Games', 'Wellness & Fitness',
        'Tours & Sightseeing', 'Water Activities', 'Adventure', 'Kids & Family'
    ]
};

export const CATEGORY_SPECIALIZATIONS: Record<string, string[]> = {
    'restaurants': [
        // European
        'Italian', 'French', 'Spanish', 'Greek', 'Mediterranean', 'Portuguese', 'German', 'British', 'Irish', 'Belgian', 'Swiss',
        // Asian
        'Japanese', 'Sushi', 'Ramen', 'Chinese', 'Cantonese', 'Sichuan', 'Dim Sum', 'Thai', 'Vietnamese', 'Korean', 'Korean BBQ', 'Indian', 'Pakistani', 'Indonesian', 'Malaysian', 'Filipino',
        // Middle Eastern & African
        'Moroccan', 'Lebanese', 'Turkish', 'Middle Eastern', 'Persian', 'Egyptian', 'Tunisian', 'Ethiopian', 'West African',
        // American & Latin
        'American', 'Burgers', 'BBQ', 'Steakhouse', 'Cajun/Creole', 'Mexican', 'Tacos', 'Tex-Mex', 'Brazilian', 'Churrascaria', 'Argentinian', 'Peruvian', 'Latin American', 'Caribbean',
        // Specialty & Dietary
        'Seafood', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Organic/Farm-to-Table', 'Fusion', 'Molecular Gastronomy',
        // Breakfast & Sweets
        'Breakfast', 'Brunch', 'Pancakes/Waffles', 'Desserts', 'Ice Cream/Gelato', 'Creperie'
    ],
    'nightlife': [
        // Drinks Focused
        'Craft Cocktails', 'Mixology', 'Wine Selection', 'Craft Beer', 'Microbrewery', 'Imported Beers',
        'Whiskey/Bourbon', 'Gin Specialty', 'Rum Specialty', 'Tequila/Mezcal', 'Vodka', 'Sake', 'Champagne/Sparkling',
        // Atmosphere/Activity
        'Live Music', 'Jazz & Blues', 'Piano', 'Acoustic', 'Karaoke', 'Trivia/Quiz', 'Stand-up Comedy',
        'Sports Screening', 'Billiards/Pool', 'Darts', 'Arcade/Games', 'Board Games',
        'Shisha/Hookah', 'Cigars', 'Outdoor Seating', 'Rooftop View', 'Beachfront'
    ],
    'clubs': [
        // Electronic
        'Techno', 'House', 'Deep House', 'Tech House', 'Progressive House', 'Minimal', 'Trance',
        'EDM', 'Dubstep', 'Drum & Bass', 'Jungle', 'Garage', 'Hardstyle',
        // Urban & Global
        'Hip Hop', 'R&B', 'Rap', 'Trap', 'Grime', 'Afrobeat', 'Amapiano', 'Dancehall', 'Reggaeton', 'Latin Pop', 'Salsa/Bachata',
        // Other
        'Pop/Top 40', 'Disco', 'Funk', 'Soul', 'Rock', 'Indie', 'Remixes/Mashups',
        '80s/90s Retro', 'Commercial', 'Open Format', 'Live DJ Sets', 'Guest Performers'
    ],
    'culture': [
        // Art Forms
        'Contemporary Art', 'Modern Art', 'Classic Art', 'Fine Arts', 'Street Art', 'Sculpture', 'Photography', 'Digital Art',
        // Performance
        'Theater Plays', 'Musicals', 'Opera', 'Ballet', 'Contemporary Dance', 'Orchestra/Symphony', 'Live Concerts', 'Comedy',
        // Knowledge/History
        'History', 'Archaeology', 'Science & Tech', 'Natural History', 'Literature', 'Poetry',
        // Media
        'Indie Cinema', 'Documentary', 'Blockbusters', 'Classic Movies', 'Film Festivals'
    ],
    'events': [
        // Event Types
        'Live Concerts', 'Music Festivals', 'Food Festivals', 'Art Exhibitions',
        'Business Conferences', 'Tech Summits', 'Networking Events', 'Workshops/Seminars',
        'Weddings', 'Private Parties', 'Birthdays', 'Anniversaries',
        'Fashion Shows', 'Product Launches', 'Charity Galas', 'Award Ceremonies',
        'Sports Events', 'Esports Tournaments', 'Pop-up Markets', 'Community Gatherings'
    ],
    'activities': [
        // Active & Fun
        'Karting', 'Bowling', 'Escape Game', 'Laser Tag', 'Paintball', 'Mini Golf', 'Trampoline Park',
        'Ice Skating', 'Roller Skating', 'Axe Throwing', 'VR Experience', 'Gaming/Esports',
        // Classes & Workshops
        'Dance Classes (Salsa/Bachata)', 'Dance Classes (Urban)', 'Cooking Classes', 'Mixology Workshops',
        'Art/Painting Workshops', 'Pottery', 'Language Exchange',
        // Wellness
        'Yoga Session', 'Pilates', 'Meditation', 'Fitness Bootcamp', 'Crossfit', 'Spa Day',
        // Outdoor & Adventure
        'Surf Lessons', 'Hiking', 'Climbing/Bouldering', 'Kayaking', 'Paddleboarding', 'Quad Biking',
        // Culture & Social
        'Wine Tasting', 'Cinema/Screenings', 'Stand-up Comedy', 'Magic Show', 'Guided Tours', 'Boat Trips'
    ]
};

export const CITY_NEIGHBORHOODS: Record<string, string[]> = {
    'Casablanca': ['Maarif', 'Gauthier', 'Racine', 'Anfa', 'Ain Diab', 'Bourgogne', 'Sidi Belyout', 'Belvedere', 'Palmimer', 'CIL', 'Oulfa', 'Sidi Maarouf', 'Bouskoura', 'Dar Bouazza', 'Mohammedia'],
    'Rabat': ['Agdal', 'Hay Riad', 'Souissi', 'Hassan', 'Ocean', 'L\'Oudaya', 'Diour Jamaa', 'Akkari', 'Yacoub El Mansour', 'Temara', 'Harhoura', 'Skhirat'],
    'Marrakech': ['Gueliz', 'Hivernage', 'Medina', 'Palmeraie', 'Agdal', 'Sidi Ghanem', 'Targa', 'Victor Hugo', 'Majorelle', 'Riad Laarous', 'Kasbah'],
    'Tangier': ['City Centre', 'Malabata', 'Marshane', 'Vieille Montagne', 'Medina', 'Iberia', 'California', 'Mandarona', 'Achakar'],
    'Agadir': ['City Centre', 'Talborjt', 'Marina', 'Founty', 'Sonaba', 'Charaf', 'Dakhla', 'Haut Founty', 'Taghazout', 'Tamraght'],
    'Fes': ['Ville Nouvelle', 'Medina', 'Fes El Bali', 'Fes Jdid', 'Route d\'Immouzer', 'Champs de Course'],
};
