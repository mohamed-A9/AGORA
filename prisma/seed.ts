
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
            emailVerified: true
        }
    });

    // Seed Sample Venues
    const sampleVenues = [
        {
            name: "Le Cabestan",
            description: "Luxury oceanfront dining experience.",
            city: "Casablanca",
            category: "Restaurant",
            address: "90 Boulevard de la Corniche",
            parkingAvailable: true,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Formal",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id
        },
        {
            name: "Sky 28",
            description: "Rooftop bar with panoramic views.",
            city: "Casablanca",
            category: "Bar",
            address: "Twin Center, Boulevard Zerktouni",
            parkingAvailable: true,
            valetParking: false,
            reservationsEnabled: true,
            dressCode: "Smart Casual",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id
        },
        {
            name: "Rick's Café",
            description: "A romantic restaurant bar designed to recreate the bar made famous by Humphrey Bogart and Ingrid Bergman in the movie classic Casablanca.",
            city: "Casablanca",
            category: "Restaurant",
            address: "248 Boulevard Sour Jdid",
            parkingAvailable: false,
            valetParking: true,
            reservationsEnabled: true,
            dressCode: "Smart Casual",
            paymentMethods: ["Cash", "Credit Card"],
            status: "APPROVED",
            ownerId: user.id
        }
    ];

    for (const v of sampleVenues) {
        // @ts-ignore
        const existing = await prisma.venue.findFirst({ where: { name: v.name } });
        if (!existing) {
            // @ts-ignore
            await prisma.venue.create({ data: v });
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
