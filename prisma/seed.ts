
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// --- TAXONOMY ---
const venueTypes = [
    // RESTAURANTS & CAFÉS
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'restaurant',
        subcategory_name_en: 'Restaurant',
        subcategory_name_fr: 'Restaurant',
        subcategory_name_ar: 'مطعم',
        icon: 'utensils'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'fine_dining',
        subcategory_name_en: 'Fine Dining',
        subcategory_name_fr: 'Cuisine Raffinée',
        subcategory_name_ar: 'طعام فاخر',
        icon: 'utensils-crossed'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'cafe',
        subcategory_name_en: 'Café',
        subcategory_name_fr: 'Café',
        subcategory_name_ar: 'مقهى',
        icon: 'coffee'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'coffee_shop',
        subcategory_name_en: 'Coffee Shop',
        subcategory_name_fr: 'Coffee Shop',
        subcategory_name_ar: 'متجر قهوة',
        icon: 'coffee'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'fast_food',
        subcategory_name_en: 'Fast Food',
        subcategory_name_fr: 'Restauration Rapide',
        subcategory_name_ar: 'وجبات سريعة',
        icon: 'beef'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'street_food',
        subcategory_name_en: 'Street Food',
        subcategory_name_fr: 'Street Food',
        subcategory_name_ar: 'أكل الشارع',
        icon: 'sandwich'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'bakery',
        subcategory_name_en: 'Bakery',
        subcategory_name_fr: 'Boulangerie',
        subcategory_name_ar: 'مخبز',
        icon: 'croissant'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'dessert_bar',
        subcategory_name_en: 'Dessert Bar',
        subcategory_name_fr: 'Bar à Desserts',
        subcategory_name_ar: 'حلويات',
        icon: 'cake-slice'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'ice_cream',
        subcategory_name_en: 'Ice Cream',
        subcategory_name_fr: 'Glacier',
        subcategory_name_ar: 'آيس كريم',
        icon: 'ice-cream'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'pizzeria',
        subcategory_name_en: 'Pizzeria',
        subcategory_name_fr: 'Pizzeria',
        subcategory_name_ar: 'بيتزا',
        icon: 'pizza'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'sushi',
        subcategory_name_en: 'Sushi',
        subcategory_name_fr: 'Sushi',
        subcategory_name_ar: 'سوشي',
        icon: 'fish'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'vegan',
        subcategory_name_en: 'Vegan',
        subcategory_name_fr: 'Végétalien',
        subcategory_name_ar: 'نباتي',
        icon: 'leaf'
    },
    {
        category_code: 'restaurants',
        category_name_en: 'Restaurants & Cafés',
        category_name_fr: 'Restaurants & Cafés',
        category_name_ar: 'مطاعم ومقاهي',
        subcategory_code: 'halal',
        subcategory_name_en: 'Halal',
        subcategory_name_fr: 'Halal',
        subcategory_name_ar: 'حلال',
        icon: 'check-circle'
    },
    // NIGHTLIFE & BARS
    {
        category_code: 'nightlife',
        category_name_en: 'Nightlife & Bars',
        category_name_fr: 'Vie Nocturne & Bars',
        category_name_ar: 'حياة الليل والبارات',
        subcategory_code: 'bar',
        subcategory_name_en: 'Bar',
        subcategory_name_fr: 'Bar',
        subcategory_name_ar: 'بار',
        icon: 'martini'
    },
    {
        category_code: 'nightlife',
        category_name_en: 'Nightlife & Bars',
        category_name_fr: 'Vie Nocturne & Bars',
        category_name_ar: 'حياة الليل والبارات',
        subcategory_code: 'pub',
        subcategory_name_en: 'Pub',
        subcategory_name_fr: 'Pub',
        subcategory_name_ar: 'حانة',
        icon: 'beer'
    },
    {
        category_code: 'nightlife',
        category_name_en: 'Nightlife & Bars',
        category_name_fr: 'Vie Nocturne & Bars',
        category_name_ar: 'حياة الليل والبارات',
        subcategory_code: 'cocktail_bar',
        subcategory_name_en: 'Cocktail Bar',
        subcategory_name_fr: 'Bar à Cocktails',
        subcategory_name_ar: 'بار كوكتيل',
        icon: 'glass-water'
    },
    {
        category_code: 'nightlife',
        category_name_en: 'Nightlife & Bars',
        category_name_fr: 'Vie Nocturne & Bars',
        category_name_ar: 'حياة الليل والبارات',
        subcategory_code: 'lounge',
        subcategory_name_en: 'Lounge',
        subcategory_name_fr: 'Lounge',
        subcategory_name_ar: 'صالة',
        icon: 'armchair'
    },
    {
        category_code: 'nightlife',
        category_name_en: 'Nightlife & Bars',
        category_name_fr: 'Vie Nocturne & Bars',
        category_name_ar: 'حياة الليل والبارات',
        subcategory_code: 'rooftop',
        subcategory_name_en: 'Rooftop',
        subcategory_name_fr: 'Rooftop',
        subcategory_name_ar: 'سطح',
        icon: 'building-2'
    },
    {
        category_code: 'nightlife',
        category_name_en: 'Nightlife & Bars',
        category_name_fr: 'Vie Nocturne & Bars',
        category_name_ar: 'حياة الليل والبارات',
        subcategory_code: 'wine_bar',
        subcategory_name_en: 'Wine Bar',
        subcategory_name_fr: 'Bar à Vin',
        subcategory_name_ar: 'بار نبيذ',
        icon: 'wine'
    },
    {
        category_code: 'nightlife',
        category_name_en: 'Nightlife & Bars',
        category_name_fr: 'Vie Nocturne & Bars',
        category_name_ar: 'حياة الليل والبارات',
        subcategory_code: 'beach_bar',
        subcategory_name_en: 'Beach Bar',
        subcategory_name_fr: 'Bar de Plage',
        subcategory_name_ar: 'بار شاطئ',
        icon: 'palmtree'
    },
    {
        category_code: 'nightlife',
        category_name_en: 'Nightlife & Bars',
        category_name_fr: 'Vie Nocturne & Bars',
        category_name_ar: 'حياة الليل والبارات',
        subcategory_code: 'shisha',
        subcategory_name_en: 'Shisha Lounge',
        subcategory_name_fr: 'Salon Shisha',
        subcategory_name_ar: 'شيشة',
        icon: 'cloud'
    },
    {
        category_code: 'nightlife',
        category_name_en: 'Nightlife & Bars',
        category_name_fr: 'Vie Nocturne & Bars',
        category_name_ar: 'حياة الليل والبارات',
        subcategory_code: 'speakeasy',
        subcategory_name_en: 'Speakeasy',
        subcategory_name_fr: 'Speakeasy',
        subcategory_name_ar: 'بار سري',
        icon: 'key'
    },
    // CLUBS & PARTY
    {
        category_code: 'clubs',
        category_name_en: 'Clubs & Party',
        category_name_fr: 'Clubs & Fêtes',
        category_name_ar: 'نادي وحفلات',
        subcategory_code: 'nightclub',
        subcategory_name_en: 'Nightclub',
        subcategory_name_fr: 'Boîte de Nuit',
        subcategory_name_ar: 'ملهى ليلي',
        icon: 'disc'
    },
    {
        category_code: 'clubs',
        category_name_en: 'Clubs & Party',
        category_name_fr: 'Clubs & Fêtes',
        category_name_ar: 'نادي وحفلات',
        subcategory_code: 'club',
        subcategory_name_en: 'Club',
        subcategory_name_fr: 'Club',
        subcategory_name_ar: 'نادي',
        icon: 'speaker'
    },
    {
        category_code: 'clubs',
        category_name_en: 'Clubs & Party',
        category_name_fr: 'Clubs & Fêtes',
        category_name_ar: 'نادي وحفلات',
        subcategory_code: 'techno_club',
        subcategory_name_en: 'Techno Club',
        subcategory_name_fr: 'Club Techno',
        subcategory_name_ar: 'نادي تكنو',
        icon: 'zap'
    },
    {
        category_code: 'clubs',
        category_name_en: 'Clubs & Party',
        category_name_fr: 'Clubs & Fêtes',
        category_name_ar: 'نادي وحفلات',
        subcategory_code: 'disco',
        subcategory_name_en: 'Disco',
        subcategory_name_fr: 'Disco',
        subcategory_name_ar: 'ديسكو',
        icon: 'sparkles'
    },
    {
        category_code: 'clubs',
        category_name_en: 'Clubs & Party',
        category_name_fr: 'Clubs & Fêtes',
        category_name_ar: 'نادي وحفلات',
        subcategory_code: 'open_air',
        subcategory_name_en: 'Open Air',
        subcategory_name_fr: 'Plein Air',
        subcategory_name_ar: 'هواء طلق',
        icon: 'sun'
    },
    {
        category_code: 'clubs',
        category_name_en: 'Clubs & Party',
        category_name_fr: 'Clubs & Fêtes',
        category_name_ar: 'نادي وحفلات',
        subcategory_code: 'after_party',
        subcategory_name_en: 'After Party',
        subcategory_name_fr: 'After Party',
        subcategory_name_ar: 'حفلة بعدية',
        icon: 'moon'
    },
    {
        category_code: 'clubs',
        category_name_en: 'Clubs & Party',
        category_name_fr: 'Clubs & Fêtes',
        category_name_ar: 'نادي وحفلات',
        subcategory_code: 'vip_club',
        subcategory_name_en: 'VIP Club',
        subcategory_name_fr: 'Club VIP',
        subcategory_name_ar: 'نادي كبار الشخصيات',
        icon: 'crown'
    },
    // EVENTS & LIVE
    {
        category_code: 'events',
        category_name_en: 'Events & Live',
        category_name_fr: 'Événements & Live',
        category_name_ar: 'فعاليات ومباشر',
        subcategory_code: 'event_venue',
        subcategory_name_en: 'Event Venue',
        subcategory_name_fr: 'Lieu d\'Événement',
        subcategory_name_ar: 'مكان الفعالية',
        icon: 'calendar'
    },
    {
        category_code: 'events',
        category_name_en: 'Events & Live',
        category_name_fr: 'Événements & Live',
        category_name_ar: 'فعاليات ومباشر',
        subcategory_code: 'concert',
        subcategory_name_en: 'Concert',
        subcategory_name_fr: 'Concert',
        subcategory_name_ar: 'حفلة موسيقية',
        icon: 'mic-2'
    },
    {
        category_code: 'events',
        category_name_en: 'Events & Live',
        category_name_fr: 'Événements & Live',
        category_name_ar: 'فعاليات ومباشر',
        subcategory_code: 'festival',
        subcategory_name_en: 'Festival',
        subcategory_name_fr: 'Festival',
        subcategory_name_ar: 'مهرجان',
        icon: 'party-popper'
    },
    {
        category_code: 'events',
        category_name_en: 'Events & Live',
        category_name_fr: 'Événements & Live',
        category_name_ar: 'فعاليات ومباشر',
        subcategory_code: 'dj_event',
        subcategory_name_en: 'DJ Event',
        subcategory_name_fr: 'Soirée DJ',
        subcategory_name_ar: 'حدث دي جي',
        icon: 'headphones'
    },
    {
        category_code: 'events',
        category_name_en: 'Events & Live',
        category_name_fr: 'Événements & Live',
        category_name_ar: 'فعاليات ومباشر',
        subcategory_code: 'live_music',
        subcategory_name_en: 'Live Music',
        subcategory_name_fr: 'Musique Live',
        subcategory_name_ar: 'موسيقى حية',
        icon: 'music'
    },
    {
        category_code: 'events',
        category_name_en: 'Events & Live',
        category_name_fr: 'Événements & Live',
        category_name_ar: 'فعاليات ومباشر',
        subcategory_code: 'comedy',
        subcategory_name_en: 'Comedy',
        subcategory_name_fr: 'Comédie',
        subcategory_name_ar: 'كوميديا',
        icon: 'laugh'
    },
    {
        category_code: 'events',
        category_name_en: 'Events & Live',
        category_name_fr: 'Événements & Live',
        category_name_ar: 'فعاليات ومباشر',
        subcategory_code: 'theater',
        subcategory_name_en: 'Theater',
        subcategory_name_fr: 'Théâtre',
        subcategory_name_ar: 'مسرح',
        icon: 'theater'
    },
    {
        category_code: 'events',
        category_name_en: 'Events & Live',
        category_name_fr: 'Événements & Live',
        category_name_ar: 'فعاليات ومباشر',
        subcategory_code: 'exhibition',
        subcategory_name_en: 'Exhibition',
        subcategory_name_fr: 'Exposition',
        subcategory_name_ar: 'معرض',
        icon: 'image'
    },
    {
        category_code: 'events',
        category_name_en: 'Events & Live',
        category_name_fr: 'Événements & Live',
        category_name_ar: 'فعاليات ومباشر',
        subcategory_code: 'private_event',
        subcategory_name_en: 'Private Event',
        subcategory_name_fr: 'Événement Privé',
        subcategory_name_ar: 'حدث خاص',
        icon: 'lock'
    }
]

// --- DYNAMIC FIELDS DEFINITIONS ---
const commonNightlifeFields = [
    {
        field_key: 'ambiance',
        field_type: 'single_select',
        label_en: 'Ambiance',
        label_fr: 'Ambiance',
        label_ar: 'الأجواء',
        required: true,
        options: [
            { value: 'chill', label_en: 'Chill', label_fr: 'Détendu', label_ar: 'هادئ' },
            { value: 'party', label_en: 'Party', label_fr: 'Fête', label_ar: 'حفلة' },
            { value: 'luxury', label_en: 'Luxury', label_fr: 'Luxe', label_ar: 'فاخر' },
            { value: 'underground', label_en: 'Underground', label_fr: 'Underground', label_ar: 'أندر جراوند' },
            { value: 'live', label_en: 'Live Performance', label_fr: 'Performance Live', label_ar: 'عروض حية' },
            { value: 'romantic', label_en: 'Romantic', label_fr: 'Romantique', label_ar: 'رومانسي' }
        ],
        sort_order: 1
    },
    {
        field_key: 'music_genres',
        field_type: 'multi_select',
        label_en: 'Music Genres',
        label_fr: 'Genres Musicaux',
        label_ar: 'أنواع الموسيقى',
        required: true,
        options: [
            { value: 'techno', label_en: 'Techno', label_fr: 'Techno', label_ar: 'تكنو' },
            { value: 'house', label_en: 'House', label_fr: 'House', label_ar: 'هاوس' },
            { value: 'afro_house', label_en: 'Afro House', label_fr: 'Afro House', label_ar: 'أفرو هاوس' },
            { value: 'hip_hop', label_en: 'Hip-Hop', label_fr: 'Hip-Hop', label_ar: 'هيب هوب' },
            { value: 'rnb', label_en: 'R&B', label_fr: 'RnB', label_ar: 'آر أند بي' },
            { value: 'commercial', label_en: 'Commercial', label_fr: 'Commercial', label_ar: 'تجاري' },
            { value: 'live_band', label_en: 'Live Band', label_fr: 'Groupe Live', label_ar: 'فرقة حية' },
            { value: 'dj', label_en: 'DJ Set', label_fr: 'Set DJ', label_ar: 'دي جي' }
        ],
        sort_order: 2
    },
    {
        field_key: 'sound_level',
        field_type: 'single_select',
        label_en: 'Sound Level',
        label_fr: 'Niveau Sonore',
        label_ar: 'مستوى الصوت',
        required: true,
        options: [
            { value: 'low', label_en: 'Low (Conversation)', label_fr: 'Faible (Conversation)', label_ar: 'منخفض' },
            { value: 'medium', label_en: 'Medium', label_fr: 'Moyen', label_ar: 'متوسط' },
            { value: 'loud', label_en: 'Loud (Party)', label_fr: 'Fort (Fête)', label_ar: 'صاخب' }
        ],
        sort_order: 3
    },
    {
        field_key: 'table_booking',
        field_type: 'boolean',
        label_en: 'Table Booking Available',
        label_fr: 'Réservation de Table',
        label_ar: 'حجز الطاولات متاح',
        required: false,
        options: [],
        sort_order: 4
    },
    {
        field_key: 'vip_area',
        field_type: 'boolean',
        label_en: 'VIP Area',
        label_fr: 'Zone VIP',
        label_ar: 'منطقة كبار الشخصيات',
        required: false,
        options: [],
        sort_order: 5
    },
    {
        field_key: 'dress_code',
        field_type: 'single_select',
        label_en: 'Dress Code',
        label_fr: 'Code Vestimentaire',
        label_ar: 'قواعد اللباس',
        required: false,
        options: [
            { value: 'casual', label_en: 'Casual', label_fr: 'Décontracté', label_ar: 'غير رسمي' },
            { value: 'smart_casual', label_en: 'Smart Casual', label_fr: 'Chic Décontracté', label_ar: 'أنيق غير رسمي' },
            { value: 'formal', label_en: 'Formal / Elegant', label_fr: 'Formel / Élégant', label_ar: 'رسمي / أنيق' }
        ],
        sort_order: 6
    },
    {
        field_key: 'minimum_spend',
        field_type: 'number',
        label_en: 'Minimum Spend (MAD)',
        label_fr: 'Dépense Minimum (MAD)',
        label_ar: 'الحد الأدنى للإنفاق',
        required: false,
        options: [],
        sort_order: 7
    },
    {
        field_key: 'age_restriction',
        field_type: 'number',
        label_en: 'Age Restriction (+)',
        label_fr: 'Restriction d\'Âge (+)',
        label_ar: 'السن المسموح به (+)',
        required: false,
        options: [],
        sort_order: 8
    }
]

const commonRestaurantFields = [
    {
        field_key: 'cuisine_types',
        field_type: 'multi_select',
        label_en: 'Cuisine Types',
        label_fr: 'Types de Cuisine',
        label_ar: 'أنواع المأكولات',
        required: true,
        options: [
            { value: 'moroccan', label_en: 'Moroccan', label_fr: 'Marocaine', label_ar: 'مغربي' },
            { value: 'italian', label_en: 'Italian', label_fr: 'Italienne', label_ar: 'إيطالي' },
            { value: 'japanese', label_en: 'Japanese', label_fr: 'Japonaise', label_ar: 'ياباني' },
            { value: 'french', label_en: 'French', label_fr: 'Française', label_ar: 'فرنسي' },
            { value: 'mediterranean', label_en: 'Mediterranean', label_fr: 'Méditerranéenne', label_ar: 'متوسطي' },
            { value: 'international', label_en: 'International', label_fr: 'Internationale', label_ar: 'عالمي' },
            { value: 'gluten_free', label_en: 'Gluten Free', label_fr: 'Sans Gluten', label_ar: 'خالي من الغلوتين' },
            { value: 'healthy', label_en: 'Healthy', label_fr: 'Sain', label_ar: 'صحي' },
            { value: 'traditional', label_en: 'Traditional', label_fr: 'Traditionnel', label_ar: 'تقليدي' }
        ],
        sort_order: 1
    },
    {
        field_key: 'price_range',
        field_type: 'single_select',
        label_en: 'Price Range',
        label_fr: 'Gamme de Prix',
        label_ar: 'نطاق الأسعار',
        required: true,
        options: [
            { value: 'cheap', label_en: '$ (Cheap)', label_fr: '€ (Abordable)', label_ar: 'رخيص' },
            { value: 'moderate', label_en: '$$ (Moderate)', label_fr: '€€ (Modéré)', label_ar: 'متوسط' },
            { value: 'expensive', label_en: '$$$ (Expensive)', label_fr: '€€€ (Cher)', label_ar: 'غالي' },
            { value: 'luxury', label_en: '$$$$ (Luxury)', label_fr: '€€€€ (Luxe)', label_ar: 'فاخر' }
        ],
        sort_order: 2
    },
    {
        field_key: 'delivery',
        field_type: 'boolean',
        label_en: 'Delivery Available',
        label_fr: 'Livraison Disponible',
        label_ar: 'توصيل متاح',
        required: false,
        options: [],
        sort_order: 3
    },
    {
        field_key: 'takeaway',
        field_type: 'boolean',
        label_en: 'Takeaway Available',
        label_fr: 'À Emporter',
        label_ar: 'محلي',
        required: false,
        options: [],
        sort_order: 4
    },
    {
        field_key: 'outdoor_seating',
        field_type: 'boolean',
        label_en: 'Outdoor Seating',
        label_fr: 'Terrasse',
        label_ar: 'جلسة خارجية',
        required: false,
        options: [],
        sort_order: 5
    },
    {
        field_key: 'halal',
        field_type: 'boolean',
        label_en: 'Halal',
        label_fr: 'Halal',
        label_ar: 'حلال',
        required: false,
        options: [],
        sort_order: 6
    },
    {
        field_key: 'vegetarian',
        field_type: 'boolean',
        label_en: 'Vegetarian Options',
        label_fr: 'Options Végétariennes',
        label_ar: 'خيارات نباتية',
        required: false,
        options: [],
        sort_order: 7
    },
    {
        field_key: 'family_friendly',
        field_type: 'boolean',
        label_en: 'Family Friendly',
        label_fr: 'Familial',
        label_ar: 'مناسب للعائلات',
        required: false,
        options: [],
        sort_order: 8
    }
]

const commonEventsFields = [
    {
        field_key: 'max_capacity',
        field_type: 'number',
        label_en: 'Max Capacity',
        label_fr: 'Capacité Max',
        label_ar: 'السعة القصوى',
        required: true,
        options: [],
        sort_order: 1
    },
    {
        field_key: 'indoor_outdoor',
        field_type: 'single_select',
        label_en: 'Setting',
        label_fr: 'Cadre',
        label_ar: 'الإطار',
        required: true,
        options: [
            { value: 'indoor', label_en: 'Indoor', label_fr: 'Intérieur', label_ar: 'داخلي' },
            { value: 'outdoor', label_en: 'Outdoor', label_fr: 'Extérieur', label_ar: 'خارجي' },
            { value: 'both', label_en: 'Both', label_fr: 'Les deux', label_ar: 'كلاهما' }
        ],
        sort_order: 2
    },
    {
        field_key: 'ticketing_supported',
        field_type: 'boolean',
        label_en: 'Ticketing Supported',
        label_fr: 'Billetterie Disponible',
        label_ar: 'دعم التذاكر',
        required: false,
        options: [],
        sort_order: 3
    }
]

const commonTheaterFields = [
    {
        field_key: 'seating_capacity',
        field_type: 'number',
        label_en: 'Seating Capacity',
        label_fr: 'Capacité Assise',
        label_ar: 'سعة المقاعد',
        required: true,
        options: [],
        sort_order: 1
    },
    {
        field_key: 'stage_available',
        field_type: 'boolean',
        label_en: 'Stage Available',
        label_fr: 'Scène Disponible',
        label_ar: 'مسرح متاح',
        required: false,
        options: [],
        sort_order: 2
    },
    {
        field_key: 'accessible',
        field_type: 'boolean',
        label_en: 'Wheelchair Accessible',
        label_fr: 'Accès Fauteuil Roulant',
        label_ar: 'متاح للكراسي المتحركة',
        required: false,
        options: [],
        sort_order: 3
    }
]

const theaterFields = [
    {
        field_key: 'seating_capacity',
        field_type: 'number',
        label_en: 'Seating Capacity',
        label_fr: 'Capacité Assise',
        label_ar: 'سعة الجلوس',
        required: true,
        options: [],
        sort_order: 1
    },
    {
        field_key: 'stage_available',
        field_type: 'boolean',
        label_en: 'Stage Available',
        label_fr: 'Scène Disponible',
        label_ar: 'مسرح متاح',
        required: true,
        options: [],
        sort_order: 2
    },
    {
        field_key: 'sound_system',
        field_type: 'boolean',
        label_en: 'Professional Sound System',
        label_fr: 'Système Sonore Pro',
        label_ar: 'نظام صوتي احترافي',
        required: true,
        options: [],
        sort_order: 3
    },
    {
        field_key: 'lighting_system',
        field_type: 'boolean',
        label_en: 'Professional Lighting',
        label_fr: 'Éclairage Pro',
        label_ar: 'إضاءة احترافية',
        required: true,
        options: [],
        sort_order: 4
    }
]

const eventVenueFields = [
    {
        field_key: 'max_capacity',
        field_type: 'number',
        label_en: 'Max Capacity',
        label_fr: 'Capacité Max',
        label_ar: 'أقصى سعة',
        required: true,
        options: [],
        sort_order: 1
    },
    {
        field_key: 'indoor_outdoor',
        field_type: 'single_select',
        label_en: 'Indoor / Outdoor',
        label_fr: 'Intérieur / Extérieur',
        label_ar: 'داخل / خارج',
        required: true,
        options: [
            { value: 'indoor', label_en: 'Indoor Only', label_fr: 'Intérieur Uniquement', label_ar: 'داخل فقط' },
            { value: 'outdoor', label_en: 'Outdoor Only', label_fr: 'Extérieur Uniquement', label_ar: 'خارج فقط' },
            { value: 'both', label_en: 'Both', label_fr: 'Les Deux', label_ar: 'كلاهما' }
        ],
        sort_order: 2
    },
    {
        field_key: 'stage_available',
        field_type: 'boolean',
        label_en: 'Stage Available',
        label_fr: 'Scène Disponible',
        label_ar: 'مسرح متاح',
        required: false,
        options: [],
        sort_order: 3
    },
    {
        field_key: 'ticketing_supported',
        field_type: 'boolean',
        label_en: 'Ticketing Supported',
        label_fr: 'Billetterie Supportée',
        label_ar: 'دعم التذاكر',
        required: false,
        options: [],
        sort_order: 4
    }
]


async function main() {
    console.log('🌱 Start seeding venue taxonomy & fields...')

    // 1. Seed Venue Types
    for (const type of venueTypes) {
        const upsertedType = await prisma.venueType.upsert({
            where: {
                category_code_subcategory_code: {
                    category_code: type.category_code,
                    subcategory_code: type.subcategory_code
                }
            },
            update: type,
            create: type,
        })
        console.log(`  Upserted type: ${upsertedType.subcategory_name_en}`)
    }

    // 2. Helper to seed fields
    const seedFieldsForSubcategories = async (subcodes: string[], fields: any[]) => {
        for (const subcode of subcodes) {
            for (const field of fields) {
                await prisma.venueTypeField.upsert({
                    where: {
                        subcategory_code_field_key: {
                            subcategory_code: subcode,
                            field_key: field.field_key
                        }
                    },
                    update: { ...field, subcategory_code: subcode }, // Ensure subcode is updated/set
                    create: { ...field, subcategory_code: subcode },
                })
            }
            console.log(`  > Upserted ${fields.length} fields for ${subcode}`)
        }
    }

    // 3. Apple Rules
    // A) NIGHTLIFE & CLUBS
    const nightlifeSubcodes = [
        'nightclub', 'club', 'techno_club', 'disco', 'open_air', 'after_party', 'vip_club',
        'bar', 'pub', 'cocktail_bar', 'lounge', 'rooftop', 'wine_bar', 'beach_bar', 'shisha', 'speakeasy'
    ]
    await seedFieldsForSubcategories(nightlifeSubcodes, commonNightlifeFields)

    // B) RESTAURANTS
    const restaurantSubcodes = [
        'restaurant', 'fine_dining', 'cafe', 'coffee_shop', 'fast_food',
        'street_food', 'bakery', 'dessert_bar', 'ice_cream', 'pizzeria',
        'sushi', 'vegan', 'halal'
    ]
    await seedFieldsForSubcategories(restaurantSubcodes, commonRestaurantFields)

    // C) THEATER / CULTURE
    // Using the previously defined (or default) 'theaterFields' which we assume are now correct or we will stick to what is there if my previous edit failed to add new ones.
    // Actually, I will point to 'theaterFields' which is existing in the file.
    await seedFieldsForSubcategories(['theater', 'exhibition', 'museum'], theaterFields)

    // D) EVENTS / LIVE
    const eventSubcodes = ['event_venue', 'concert', 'festival', 'live_music', 'dj_event', 'comedy', 'private_event']
    await seedFieldsForSubcategories(eventSubcodes, eventVenueFields)

    // Specific Overrides: Add Music Genres to Music Events
    const musicEventSubcodes = ['concert', 'live_music', 'dj_event', 'festival']
    const musicField = commonNightlifeFields.find(f => f.field_key === 'music_genres')
    if (musicField) {
        await seedFieldsForSubcategories(musicEventSubcodes, [musicField])
    }

    // Seed sample user
    const user = await prisma.user.upsert({
        where: { email: 'demo@agora.com' },
        update: {},
        create: {
            email: 'demo@agora.com',
            name: 'Demo Business',
            role: 'BUSINESS',
            password: 'password123', // In real app this should be hashed
            emailVerified: new Date()
        }
    });

    // Seed Sample Venues with Images
    const sampleVenues = [
        // --- RESTAURANTS (FINE DINING & CASUAL) ---
        {
            name: "Le Cabestan",
            description: "An iconic oceanfront dining experience offering breathtaking views of the Atlantic. Specializing in fresh seafood and Mediterranean classics with a modern twist.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'fine_dining' } }))?.id,
            address: "90 Boulevard de la Corniche, Phare d'El Hank",
            phone: "+212 522 391 190",
            whatsapp: "+212 600 000 001",
            website: "https://le-cabestan.ma",
            instagram: "@lecabestan",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Formal",
            priceRange: "luxury",
            paymentMethods: ["Cash", "Credit Card", "Amex"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "Rick's Café",
            description: "Step into the movie classic 'Casablanca'. A romantic restaurant bar filled with architectural details, brass lighting, and a live pianist playing 'As Time Goes By'.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'restaurant' } }))?.id,
            address: "248 Boulevard Sour Jdid",
            phone: "+212 522 274 207",
            whatsapp: "+212 661 111 222",
            website: "https://rickscafe.ma",
            instagram: "@rickscafecasablanca",
            parkingAvailable: false,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Smart Casual",
            priceRange: "expensive",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "Iloli",
            description: "Casablanca's premier upscale Japanese restaurant. Combining traditional techniques with modern flair. Famous for its Black Cod and Wagyu beef.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'sushi' } }))?.id,
            address: "33 Rue Najib Mahfoud, Gauthier",
            phone: "+212 522 476 617",
            whatsapp: "+212 662 333 444",
            website: "https://iloli-casablanca.com",
            instagram: "@iloli.casablanca",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Smart Casual",
            priceRange: "luxury",
            paymentMethods: ["Cash", "Credit Card", "Amex"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1617196019294-dcce4779bcb7?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "La Bodega",
            description: "A vibrant Spanish tapas bar and restaurant. Known for its lively salsa nights, paella, and sangria. A true fiesta in the heart of the city.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'restaurant' } }))?.id,
            address: "129 Boulevard Ben Abdellah",
            phone: "+212 522 541 842",
            instagram: "@labodegacasa",
            parkingAvailable: false,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Casual",
            priceRange: "moderate",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1515443961218-a51367888e4b?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1536392706979-7f5624da85ca?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "Dar Dada",
            description: "Experience the magic of authentic Moroccan cuisine in a beautifully restored Riad setting. Couscous, Tagines, and Pastilla prepared with love.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'restaurant' } }))?.id,
            address: "37 Rue El Araar",
            phone: "+212 522 222 333",
            instagram: "@dardadacasablanca",
            parkingAvailable: false,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Smart Casual",
            priceRange: "moderate",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1539755530862-00f623c00f52?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1590408542034-7117e34cd369?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "NKOA",
            description: "A fusion culinary journey blending African, Asian, and South American flavors. Trendy atmosphere and creative cocktails.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'fine_dining' } }))?.id,
            address: "19 Rue Abou Kacem Echabbi",
            phone: "+212 522 999 111",
            instagram: "@nkoacasablanca",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Smart Casual",
            priceRange: "expensive",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "Le Petit Rocher",
            description: "Restaurant and lounge bar literally on the rocks by the sea. Stunning sunset views, lighthouse backdrop, and international cuisine.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'restaurant' } }))?.id,
            address: "Complexe au Petit Rocher, Corniche",
            phone: "+212 522 362 626",
            website: "https://lepetitrocher.ma",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Smart Casual",
            priceRange: "expensive",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1615719413546-198b25453f85?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1578474843222-9593bc88d8b0?q=80&w=1000&auto=format&fit=crop"
            ]
        },

        // --- NIGHTLIFE (CLUBS, BARS, PUBS) ---
        {
            name: "Maison B",
            description: "Chic club and restaurant. The place to see and be seen in Casablanca. Hosting international DJs and themed parties.",
            city: "Casablanca",
            category: "Clubs",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'nightclub' } }))?.id,
            address: "5 Rue de la Mer d'Adria",
            phone: "+212 698 999 444",
            instagram: "@maisonbcasablanca",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Formal",
            priceRange: "expensive",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1570872626485-d8ffea69f463?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "Sky 28",
            description: "The highest rooftop bar in the city. Sip on signature cocktails while watching the sunset over the skyline. Vibrant atmosphere with localized DJ sets.",
            city: "Casablanca",
            category: "Bar",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'rooftop' } }))?.id,
            address: "Twin Center, Boulevard Zerktouni",
            phone: "+212 522 958 980",
            instagram: "@sky28casablanca",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Smart Casual",
            priceRange: "expensive",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1571624436279-b272aff75a7e?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "The Vault",
            description: "An exclusive underground techno club for electronic music enthusiasts. World-class sound system and immersive light shows.",
            city: "Casablanca",
            category: "Clubs",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'techno_club' } }))?.id,
            address: "45 Rue de la Liberté, Sous-sol",
            phone: "+212 522 111 222",
            instagram: "@thevault_club",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Casual / Party",
            priceRange: "moderate",
            paymentMethods: ["Cash"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1574391884720-385e6e288793?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "Le Kimmy'z",
            description: "French bistro by day, lively party bar by night. Great food, great music, and a fantastic crowd. The perfect spot for dinner and dancing.",
            city: "Casablanca",
            category: "Bar",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'pub' } }))?.id,
            address: "Rue Najib Mahfoud",
            phone: "+212 522 270 200",
            instagram: "@lekimmyz",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Smart Casual",
            priceRange: "moderate",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1582106245687-cbb4e330d632?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "O'Malleys Irish Pub",
            description: "The most authentic Irish pub in town. Live sports, Guinness on tap, and a friendly atmosphere. Perfect for after-work drinks.",
            city: "Casablanca",
            category: "Bar",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'pub' } }))?.id,
            address: "22 Rue des Irlandais",
            phone: "+212 522 333 444",
            website: "https://omalleys.ma",
            instagram: "@omalleys_casa",
            parkingAvailable: false,
            valetParking: false,
            reservationsEnabled: false,
            dressCode: "Casual",
            priceRange: "cheap",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1585516499834-8c823eb52C28?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "La Java",
            description: "A legendary spot in Casablanca. Casual dining, live music, and a relaxed garden atmosphere. Ideal for a laid-back evening.",
            city: "Casablanca",
            category: "Bar",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'bar' } }))?.id,
            address: "Boulevard Abdellatif Ben Kaddour",
            phone: "+212 522 123 456",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Casual",
            priceRange: "moderate",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1532635224-cf024e66d122?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1438907046657-4ae137eb8c5e?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1584225065152-4a1454aa3d42?q=80&w=1000&auto=format&fit=crop"
            ]
        },

        // --- CAFES & BAKERIES ---
        {
            name: "Bondi Coffee Kitchen",
            description: "Australian-inspired cafe serving specialty coffee, healthy brunches, and delicious smoothies. A hipster haven in the city.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'coffee_shop' } }))?.id,
            address: "31 Rue Sebou, Gauthier",
            phone: "+212 522 470 546",
            instagram: "@bondicoffeekitchen",
            parkingAvailable: false,
            valetParking: false,
            reservationsEnabled: false,
            dressCode: "Casual",
            priceRange: "moderate",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "Paul - Villa Zevaco",
            description: "Located in a stunning heritage villa. Paul offers traditional French breads, pastries, and a full bistro menu in a beautiful garden setting.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'bakery' } }))?.id,
            address: "Boulevard d'Anfa",
            phone: "+212 522 366 000",
            website: "https://paul.ma",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Casual",
            priceRange: "moderate",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "% Arabica",
            description: "Kyoto-based specialty coffee shop. Minimalist design, world-class beans, and the perfect espresso. See the world through coffee.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'coffee_shop' } }))?.id,
            address: "Morocco Mall",
            phone: "+212 522 999 555",
            instagram: "@arabica.morocco",
            parkingAvailable: true,
            valetParking: false,
            reservationsEnabled: false,
            dressCode: "Casual",
            priceRange: "moderate",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1445116572660-d38f22299d51?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1507133750069-775b0f0a6e2e?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            name: "L'Atelier 21",
            description: "Art gallery and cafe. A cultural hub where you can enjoy fine coffee while admiring contemporary Moroccan art.",
            city: "Casablanca",
            category: "Restaurant",
            venueTypeId: (await prisma.venueType.findFirst({ where: { subcategory_code: 'cafe' } }))?.id,
            address: "21 Rue Abou Mahassine Arrouyani",
            phone: "+212 522 981 785",
            parkingAvailable: false,
            valetParking: false,
            reservationsEnabled: false,
            dressCode: "Smart Casual",
            priceRange: "moderate",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id,
            images: [
                "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop"
            ]
        }
    ];

    for (const v of sampleVenues) {
        // Separate images and dynamic fields from the rest of the venue data
        // @ts-ignore
        const { images, priceRange, ...venueData } = v;

        // @ts-ignore
        const existing = await prisma.venue.findFirst({ where: { name: venueData.name } });

        if (!existing) {
            // @ts-ignore
            const createdVenue = await prisma.venue.create({ data: venueData });
            console.log(` Created venue: ${createdVenue.name}`);

            // Create Media for images
            if (images && images.length > 0) {
                for (const imageUrl of images) {
                    await prisma.media.create({
                        data: {
                            url: imageUrl,
                            type: 'image',
                            venueId: createdVenue.id
                        }
                    });
                }
                console.log(`   > Added ${images.length} images`);
            }

            // Handle Dynamic Attribute: Price Range
            if (priceRange) {
                await prisma.venueAttribute.create({
                    data: {
                        venueId: createdVenue.id,
                        field_key: 'price_range',
                        value_json: priceRange
                    }
                });
            }

        } else {
            console.log(` Skipped existing venue: ${existing.name}`);
        }
    }

    console.log('✅ Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
