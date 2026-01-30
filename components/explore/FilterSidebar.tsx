"use client";

import { X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { moroccanCities } from "@/lib/constants";
import { TAXONOMY } from "@/lib/taxonomy";

interface FilterSidebarProps {
    filters: any;
    setFilters: (f: any) => void;
    className?: string;
    onClose?: () => void;
}

export default function FilterSidebar({ filters, setFilters, className = "", onClose }: FilterSidebarProps) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [featuresOpen, setFeaturesOpen] = useState(false); // For Policies
    const [showAllCuisines, setShowAllCuisines] = useState(false);
    const [showAllTypes, setShowAllTypes] = useState(false);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const update = (key: string, val: any) => {
        setLocalFilters((prev: any) => ({ ...prev, [key]: val }));
    };

    // Generic multi-select toggle
    const toggleArrayItem = (key: string, item: string) => {
        setLocalFilters((prev: any) => {
            let current = prev[key];
            if (typeof current === 'string') current = [current];
            if (!Array.isArray(current)) current = [];

            const normalize = (s: string) => s.toLowerCase();

            if (current.some((i: string) => normalize(i) === normalize(item))) {
                return { ...prev, [key]: current.filter((i: string) => normalize(i) !== normalize(item)) };
            } else {
                return { ...prev, [key]: [...current, item] };
            }
        });
    };

    const getArray = (key: string): string[] => {
        const val = localFilters[key];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.length > 0) return [val];
        return [];
    }

    // Toggle Booleans (Policies/Features)
    const toggleFeature = (featureKey: string) => {
        setLocalFilters((prev: any) => {
            const currentFeatures = prev.features || {};
            return {
                ...prev,
                features: {
                    ...currentFeatures,
                    [featureKey]: !currentFeatures[featureKey]
                }
            };
        });
    }

    const apply = () => {
        setFilters(localFilters);
        if (onClose) onClose();
    };

    const clear = () => {
        const empty = {
            city: localFilters.city,
            category: [],
            subcategory: [],
            ambiance: [], // vibe
            musicStyle: [],
            features: {},
            cuisine: []
        };
        setLocalFilters(empty);
        setFilters(empty);
    };

    // --- Dynamic Data Helpers ---

    // 1. Get relevant Subcategories based on Selected Category
    const selectedCats = getArray("category");
    let relevantSubcats: string[] = [];

    if (selectedCats.length > 0) {
        // Find keys in TAXONOMY.SUBCATEGORIES matching selected labels
        // UI sends labels like "Restaurant", Taxonomy keys are "RESTAURANT"
        // Need to map Label -> Value (ENUM)
        // Normalize helper
        const normalize = (s: string) => s.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, ' ');

        selectedCats.forEach(label => {
            // Try exact match first
            let entry = TAXONOMY.CATEGORIES.find(c => c.label.toLowerCase() === label.toLowerCase());

            // If not found, try normalized match (handling ' & ' vs ' and ' vs encoded)
            if (!entry) {
                const normLabel = normalize(label);
                entry = TAXONOMY.CATEGORIES.find(c => normalize(c.label) === normLabel);
            }

            // Fallback: Partial Match (e.g. "Clubs" -> "Clubs & Party")
            if (!entry) {
                entry = TAXONOMY.CATEGORIES.find(c => {
                    // Check if 'Clubs' is in 'Clubs & Party'
                    // Or precise known keys
                    if (label.toLowerCase().includes("club") && c.value === "CLUBS_PARTY") return true;
                    if (label.toLowerCase().includes("activities") && c.value === "ACTIVITIES_FUN") return true;
                    if (label.toLowerCase().includes("activity") && c.value === "ACTIVITIES_FUN") return true;
                    return false;
                });
            }

            if (entry) {
                const key = entry.value as keyof typeof TAXONOMY.SUBCATEGORIES;
                if (TAXONOMY.SUBCATEGORIES[key]) {
                    relevantSubcats.push(...TAXONOMY.SUBCATEGORIES[key]);
                }
            }
        });
    } else {
        // Default: Show Activities & Fun + Nightlife basics? Or just Activities?
        // User requested "Extended Maximum". Let's show a mix or just Activities for discovery.
        // Actually, listing ALL is too much (100+).
        // Let's show "Activities & Fun" by default if nothing selected, as that's often what people browse type-wise.
        relevantSubcats = TAXONOMY.SUBCATEGORIES.ACTIVITIES_FUN;
    }
    // Dedup
    relevantSubcats = Array.from(new Set(relevantSubcats));

    return (
        <div className={`flex flex-col h-full bg-black/40 backdrop-blur-3xl border-r border-white/5 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-transparent sticky top-0 z-10">
                <h2 className="text-lg font-bold text-white tracking-tight">Filters</h2>
                {onClose && (
                    <button onClick={onClose} className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                {/* 1. CITY */}
                <div className="space-y-4 pt-4">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">City</label>
                    <div className="relative">
                        <select
                            value={localFilters.city}
                            onChange={(e) => update("city", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                        >
                            <option value="" disabled>Select a city</option>
                            {moroccanCities.map(c => (
                                <option key={c} value={c} className="bg-zinc-900">{c}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* 2. MAIN CATEGORY */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {TAXONOMY.CATEGORIES.map(c => {
                            const isSelected = getArray("category").includes(c.label);
                            return (
                                <button
                                    key={c.value}
                                    onClick={() => toggleArrayItem("category", c.label)} // Send Label "Restaurant"
                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 flex items-center gap-2 ${isSelected
                                        ? "bg-white text-black border-white shadow-lg shadow-white/10 transform scale-105"
                                        : "bg-transparent border-white/10 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <span>{c.icon}</span>
                                    {c.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 3. SUB CATEGORIES (Type / Activity) */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
                        {selectedCats.length > 0 ? "Venue Type" : "Activities & Entertainment"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {(showAllTypes ? relevantSubcats : relevantSubcats.slice(0, 12)).map(t => {
                            const isSelected = getArray("subcategory").includes(t);
                            return (
                                <button
                                    key={t}
                                    onClick={() => toggleArrayItem("subcategory", t)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${isSelected
                                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
                                        : "bg-transparent border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                                        }`}
                                >
                                    {t}
                                </button>
                            )
                        })}
                        {relevantSubcats.length > 12 && !showAllTypes && (
                            <button onClick={() => setShowAllTypes(true)} className="text-xs text-white/40 hover:text-white underline px-2">
                                + {relevantSubcats.length - 12} more
                            </button>
                        )}
                        {showAllTypes && (
                            <button onClick={() => setShowAllTypes(false)} className="text-xs text-white/40 hover:text-white underline px-2">
                                Show Less
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. CUISINES (Conditionally Rendered) */}
                {selectedCats.some(c => ["Restaurant", "Café"].includes(c)) && (
                    <div className="space-y-4 animate-in slide-in-from-left-2 duration-300">
                        <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Cuisine</label>
                        <div className="flex flex-wrap gap-2">
                            {(showAllCuisines ? TAXONOMY.CUISINES : TAXONOMY.CUISINES.slice(0, 10)).map(c => {
                                const isSelected = getArray("cuisine").includes(c);
                                return (
                                    <button
                                        key={c}
                                        onClick={() => toggleArrayItem("cuisine", c)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${isSelected
                                            ? "bg-orange-500/20 border-orange-500/50 text-orange-200"
                                            : "bg-transparent border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                                            }`}
                                    >
                                        {c}
                                    </button>
                                )
                            })}
                            {TAXONOMY.CUISINES.length > 10 && !showAllCuisines && (
                                <button onClick={() => setShowAllCuisines(true)} className="text-xs text-white/40 hover:text-white underline px-2">
                                    + {TAXONOMY.CUISINES.length - 10} more
                                </button>
                            )}
                            {showAllCuisines && (
                                <button onClick={() => setShowAllCuisines(false)} className="text-xs text-white/40 hover:text-white underline px-2">
                                    Show Less
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. VIBE & ATMOSPHERE */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Vibe & Atmosphere</label>
                    <div className="flex flex-wrap gap-2">
                        {TAXONOMY.VIBES.map(a => {
                            const isSelected = getArray("ambiance").includes(a);
                            return (
                                <button
                                    key={a}
                                    onClick={() => toggleArrayItem("ambiance", a)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${isSelected
                                        ? "bg-purple-500/20 border-purple-500/50 text-purple-200"
                                        : "bg-transparent border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                                        }`}
                                >
                                    {a}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 6. MUSIC (Conditionally Rendered) */}
                {(selectedCats.length === 0 || selectedCats.some(c => {
                    const l = c.toLowerCase();
                    return l.includes("nightlife") || l.includes("club") || l.includes("event");
                })) && (
                        <div className="space-y-4 animate-in slide-in-from-left-2 duration-300">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Music</label>
                            <div className="flex flex-wrap gap-2">
                                {TAXONOMY.MUSIC_TYPES.slice(0, 15).map(m => {
                                    const isSelected = getArray("musicStyle").includes(m);
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => toggleArrayItem("musicStyle", m)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${isSelected
                                                ? "bg-blue-500/20 border-blue-500/50 text-blue-200"
                                                : "bg-transparent border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                {/* 7. POLICIES & FACILITIES (Collapsible) */}
                <div className="pt-4 border-t border-white/5">
                    <button
                        onClick={() => setFeaturesOpen(!featuresOpen)}
                        className="w-full flex items-center justify-between text-left group py-2"
                    >
                        <label className="text-xs font-bold text-white/50 uppercase tracking-widest cursor-pointer group-hover:text-white/70 transition-colors">
                            Policies & Facilities
                        </label>
                        {featuresOpen ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                    </button>

                    {featuresOpen && (
                        <div className="grid grid-cols-2 gap-3 mt-4 animate-in slide-in-from-top-2 duration-200">
                            {[...TAXONOMY.POLICIES, ...TAXONOMY.FACILITIES].map(({ label, code, categories }) => {
                                // Dynamic Visibility Check
                                const shouldShow = () => {
                                    if (selectedCats.length === 0) return true; // Show all in discovery
                                    if (!categories) return true; // Global item
                                    // Check normalized intersection
                                    const normalize = (s: string) => s.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, ' ');
                                    return categories.some(cat =>
                                        selectedCats.some(sel => normalize(sel) === normalize(cat))
                                    );
                                };

                                if (!shouldShow()) return null;

                                const isChecked = localFilters.features?.[code];
                                return (
                                    <label key={code} className="flex items-center gap-3 cursor-pointer group select-none">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${isChecked
                                            ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-900/20"
                                            : "border-white/10 bg-white/5 group-hover:border-white/30"
                                            }`}>
                                            {isChecked && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className={`text-sm transition-colors ${isChecked ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"}`}>{label}</span>
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="h-32" />
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/5 flex gap-3 bg-transparent z-20">
                <button
                    onClick={clear}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all active:scale-[0.98]"
                >
                    Reset All
                </button>
                <button
                    onClick={apply}
                    className="flex-[2] py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 active:scale-[0.98]"
                >
                    Show Results
                </button>
            </div>
        </div>
    );
}
