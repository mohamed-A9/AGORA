"use server";

import { prisma } from "@/lib/prisma";
import { MainCategory, Prisma } from "@prisma/client";
import { TAXONOMY } from "@/lib/taxonomy";

// Helper to ensure array
function toArray(val: string | string[] | undefined): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(",").filter((v) => v.length > 0);
}

// Map UI Category strings to DB Enum MainCategory
function mapCategoryToEnum(cat: string): MainCategory | undefined {
    // UI sends "Restaurant", "Club", etc. from constants.ts OR "Restaurant" label from TAXONOMY
    // Schema has: CAFE, RESTAURANT, NIGHTLIFE_BARS, CLUBS_PARTY, EVENTS, ACTIVITIES_FUN
    const map: Record<string, MainCategory> = {
        "restaurant": "RESTAURANT",
        "cafe": "CAFE",
        "café": "CAFE",
        "club": "CLUBS_PARTY",
        "clubs": "CLUBS_PARTY",
        "nightlife": "NIGHTLIFE_BARS",
        "bar": "NIGHTLIFE_BARS",
        "lounge": "NIGHTLIFE_BARS",
        "rooftop": "NIGHTLIFE_BARS", // Approximation
        "beach club": "CLUBS_PARTY",
        "events": "EVENTS",
        "activities": "ACTIVITIES_FUN",
        "activity": "ACTIVITIES_FUN",
        "fun": "ACTIVITIES_FUN",
        // TAXONOMY Labels
        "nightlife and bars": "NIGHTLIFE_BARS",
        "nightlife & bars": "NIGHTLIFE_BARS",
        "clubs & party": "CLUBS_PARTY",
        "clubs and party": "CLUBS_PARTY",
        "activities & fun": "ACTIVITIES_FUN",
        "activities and fun": "ACTIVITIES_FUN",
        "wellness & health": "WELLNESS_HEALTH",
        "wellness and health": "WELLNESS_HEALTH",
        "wellness": "WELLNESS_HEALTH",
        "health": "WELLNESS_HEALTH"
    };

    // Normalize input to handle potential encoding weirdness if not decoded by framework?
    // NextJS usually decodes. 
    // Just simple lower case check.
    const normalized = cat.toLowerCase().trim();
    return map[normalized];
}

// Map Feature Keys to DB Code lookups (Legacy + Specifics)
const FEATURE_MAP: Record<string, { type: 'facility' | 'policy' | 'music', code: string }> = {
    "hasOutdoorSeating": { type: 'facility', code: "OUTDOOR_SEATING" },
    "hasValetParking": { type: 'facility', code: "VALET" },
    "hasParking": { type: 'facility', code: "PARKING" },
    "hasWifi": { type: 'facility', code: "WIFI" },
    "hasRooftop": { type: 'facility', code: "ROOFTOP" },
    "hasAC": { type: 'facility', code: "AC" },
    "hasTV": { type: 'facility', code: "TV" },
    "isPetFriendly": { type: 'policy', code: "PET_FRIENDLY" },
    "hasLiveMusic": { type: 'music', code: "Live Band" },
    "hasDJ": { type: 'music', code: "Techno" },
    // Legacy maps if needed
};

const VALID_FACILITIES = new Set(TAXONOMY.FACILITIES.map(f => f.code));
const VALID_POLICIES = new Set(TAXONOMY.POLICIES.map(p => p.code));

const SYNONYMS: Record<string, string[]> = {
    "chicha": ["shisha", "hookah", "nargile"],
    "shisha": ["chicha", "hookah"],
    "shich": ["chicha", "shisha"],
    "hamam": ["hammam", "spa", "massage", "wellness"],
    "hammam": ["hamam", "spa", "massage"],
    "massage": ["spa", "hammam", "wellness"],
    "boite": ["club", "nightclub", "disco"],
    "club": ["boite", "nightclub", "party"],
    "danse": ["dance", "club"],
    "piscine": ["pool", "swimming"],
    "pool": ["piscine"],
    "cafe": ["coffee", "café"],
    "café": ["coffee", "cafe"],
    "food": ["restaurant", "manger"],
    "manger": ["food", "restaurant"],
    "sushi": ["japanese", "japonais", "asian"],
};

function expandSearchQuery(q: string): string[] {
    const lower = q.toLowerCase().trim();
    const terms = new Set([lower]);

    // Check direct synonyms
    if (SYNONYMS[lower]) {
        SYNONYMS[lower].forEach(t => terms.add(t));
    }

    // Also minimal fuzzy check for common typos if length > 3
    // (Very basic implementation: check if key is substring or vice versa)
    /* 
       A true Levenshtein would be better but expensive here.
       Rely on the map for now.
    */

    return Array.from(terms);
}

import { cleanupPastEvents } from "./event";

export async function getExploreData(searchParams: { [key: string]: string | string[] | undefined }) {
    try {
        // Automatically cleanup expired events when someone visits explore
        // This keeps the database fresh as requested by the user.
        await cleanupPastEvents();
        const {
            city,
            q,
            category,
            subcategory,
            cuisine,
            ambiance,
            musicStyle,
            // features are dynamic keys
        } = searchParams;

        const where: Prisma.VenueWhereInput = {
            isActive: true, // Show only active
        };

        // 1. City
        if (city && typeof city === "string") {
            where.city = { name: { equals: city, mode: "insensitive" } };
        }

        // 2. Search (Enhanced with Synonyms & Multi-field)
        if (q && typeof q === "string") {
            const searchTerms = expandSearchQuery(q);

            // Construct a massive OR clause
            // match ANY of the terms in ANY of the fields
            where.OR = searchTerms.flatMap(term => [
                { name: { contains: term, mode: "insensitive" } },
                { description: { contains: term, mode: "insensitive" } },
                {
                    subcategories: {
                        some: {
                            subcategory: {
                                name: { contains: term, mode: "insensitive" }
                            }
                        }
                    }
                },
                {
                    cuisines: {
                        some: {
                            cuisine: {
                                name: { contains: term, mode: "insensitive" }
                            }
                        }
                    }
                },
                {
                    vibes: {
                        some: {
                            vibe: {
                                name: { contains: term, mode: "insensitive" }
                            }
                        }
                    }
                }
            ]);
        }

        // 3. Category
        const categories = toArray(category);
        if (categories.length > 0) {
            const enumCats: MainCategory[] = [];
            categories.forEach(c => {
                const mapped = mapCategoryToEnum(c);
                if (mapped) enumCats.push(mapped);
            });

            // If we found mapped enums, filter by them
            if (enumCats.length > 0) {
                where.mainCategory = { in: enumCats };
            }
        }

        // 4. Subcategories
        const subcats = toArray(subcategory);
        if (subcats.length > 0) {
            where.subcategories = { some: { subcategory: { name: { in: subcats, mode: "insensitive" } } } };
        }

        // 5. Cuisines
        const cuisines = toArray(cuisine);
        if (cuisines.length > 0) {
            where.cuisines = { some: { cuisine: { name: { in: cuisines, mode: "insensitive" } } } };
        }

        // 6. Ambiances (Vibes)
        const vibes = toArray(ambiance);
        if (vibes.length > 0) {
            where.vibes = { some: { vibe: { name: { in: vibes, mode: "insensitive" } } } };
        }

        // 7. Music
        const musics = toArray(musicStyle);
        if (musics.length > 0) {
            where.musicTypes = { some: { musicType: { name: { in: musics, mode: "insensitive" } } } };
        }

        // 8. Features (Boolean params)
        const featureConditions: Prisma.VenueWhereInput[] = [];
        Object.entries(searchParams).forEach(([key, val]) => {
            if (val === 'true') {
                // Check Legacy Map
                if (FEATURE_MAP[key]) {
                    const mapping = FEATURE_MAP[key];
                    if (mapping.type === 'facility') {
                        featureConditions.push({ facilities: { some: { facility: { code: mapping.code } } } });
                    } else if (mapping.type === 'policy') {
                        featureConditions.push({ policies: { some: { policy: { code: mapping.code } } } });
                    } else if (mapping.type === 'music') {
                        featureConditions.push({ musicTypes: { some: { musicType: { name: { equals: mapping.code, mode: "insensitive" } } } } });
                    }
                }
                // Check Dynamic Sets
                else if (VALID_FACILITIES.has(key)) {
                    featureConditions.push({ facilities: { some: { facility: { code: key } } } });
                }
                else if (VALID_POLICIES.has(key)) {
                    featureConditions.push({ policies: { some: { policy: { code: key } } } });
                }
            }
        });
        if (featureConditions.length > 0) {
            where.AND = featureConditions;
        }

        // 9. Fetch
        const venues = await prisma.venue.findMany({
            where,
            include: {
                city: true,
                subcategories: { include: { subcategory: true } },
                cuisines: { include: { cuisine: true } },
                vibes: { include: { vibe: true } },
                musicTypes: { include: { musicType: true } },
                policies: { include: { policy: true } },
                facilities: { include: { facility: true } },
                tags: { include: { tag: true } },
                // Simple media array for cards
                gallery: { take: 5, orderBy: { sortOrder: 'asc' } }
            },
            orderBy: {
                rating: 'desc'
            },
            take: 200
        });

        const isFiltered = Object.keys(searchParams).length > 0;

        if (!isFiltered) {
            // Discovery Mode
            return {
                mode: "discovery",
                sections: [
                    { title: "Top Picks", items: venues.slice(0, 4) },
                    { title: "Trending", items: venues.slice(4, 8) }
                ]
            }
        }

        return {
            mode: "results",
            items: venues
        };

    } catch (error) {
        console.error("Error fetching explore data:", error);
        return { mode: "error", items: [] };
    }
}
