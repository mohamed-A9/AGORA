
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
    "Moroccan", "Italian", "French", "Japanese", "Lebanese",
    "Mediterranean", "Asian Fusion", "Steakhouse", "Seafood", "International",
    "Sushi", "Tapas", "Burgers", "Pizza", "Fine Dining", "Thai"
];

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
        'Brunch Spot', 'Coffee Shop', 'Tea House', 'Bakery/Patisserie', 'Food Court'
    ],
    'nightlife': [
        'Cocktail Bar', 'Wine Bar', 'Beer Garden', 'Sports Bar',
        'Pub', 'Dive Bar', 'Piano Bar', 'Hotel Bar', 'Tapas Bar'
    ],
    'clubs': [
        'Nightclub', 'Dance Club', 'Beach Club', 'Pool Club',
        'Lounge Club', 'Electronic Music Venue', 'Live Music Club', 'DJ Club'
    ],
    'culture': [
        'Art Gallery', 'Museum', 'Theater', 'Cinema',
        'Cultural Center', 'Exhibition Space', 'Performance Venue', 'Library'
    ],
    'events': [
        'Concert Hall', 'Events Space', 'Rooftop Venue', 'Private Events',
        'Corporate Events', 'Wedding Venue', 'Conference Center', 'Banquet Hall'
    ]
};

export const CATEGORY_SPECIALIZATIONS: Record<string, string[]> = {
    'restaurants': [
        'Italian', 'French', 'Japanese', 'Chinese', 'Thai', 'Indian',
        'Moroccan', 'Lebanese', 'Mediterranean', 'Spanish', 'Mexican',
        'American', 'Korean', 'Vietnamese', 'Greek', 'Turkish',
        'Fusion', 'Vegan/Vegetarian', 'Seafood', 'Steakhouse', 'BBQ',
        'Sushi', 'Pizza', 'Burgers', 'Tapas', 'Fine Dining', 'Breakfast/Brunch'
    ],
    'nightlife': [
        'Craft Beer', 'Wine Selection', 'Cocktail Specialties', 'Whiskey Bar',
        'Gin Bar', 'Tequila/Mezcal', 'Champagne Bar', 'Sake Bar',
        'Irish Pub', 'Sports Bar', 'Live Music', 'DJ Sets', 'Karaoke'
    ],
    'clubs': [
        'Techno', 'House', 'Hip Hop', 'R&B', 'Reggaeton', 'EDM',
        'Trance', 'Drum & Bass', 'Afrobeat', 'Latin', 'Commercial',
        'Underground', 'Open Format', 'Live Performances'
    ],
    'culture': [
        'Contemporary Art', 'Classical Art', 'Modern Art', 'Photography',
        'Sculpture', 'Performance Art', 'Theater', 'Dance', 'Opera',
        'Cinema', 'Literature', 'History', 'Science', 'Interactive'
    ],
    'events': [
        'Concerts', 'Conferences', 'Weddings', 'Corporate Events',
        'Private Parties', 'Exhibitions', 'Workshops', 'Seminars',
        'Product Launches', 'Networking Events', 'Festivals', 'Galas'
    ]
};
