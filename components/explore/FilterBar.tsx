"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useEffect, useMemo } from "react";
import { SlidersHorizontal, MapPin, ChevronDown, Search, X } from "lucide-react";
import { moroccanCities } from "@/lib/constants";
import FilterSidebar from "./FilterSidebar";

// ─── Quick Filter Chips (Smart, contextual) ─────────────────────────
const QUICK_FILTERS: { label: string; icon: string; params: Record<string, string> }[] = [
    { label: "Restaurants", icon: "🍽️", params: { category: "Restaurant" } },
    { label: "Cafés", icon: "☕", params: { category: "Café" } },
    { label: "Nightlife", icon: "🍸", params: { category: "Nightlife & Bars" } },
    { label: "Clubs", icon: "🎧", params: { category: "Clubs & Party" } },
    { label: "Activities", icon: "🎯", params: { category: "Activities & Fun" } },
    { label: "Wellness", icon: "🧖", params: { category: "Wellness & Health" } },
    { label: "Events", icon: "🎟️", params: { category: "Events" } },
];

export default function FilterBar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [cityMenuOpen, setCityMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [q, setQ] = useState("");

    const currentCity = searchParams.get("city") || "All Cities";
    const currentCategory = searchParams.get("category");

    useEffect(() => {
        const urlQ = searchParams.get("q");
        if (urlQ) setQ(urlQ);
    }, [searchParams]);

    // ── Count Active Filters ────────────────────────────────────────
    const activeFilterCount = useMemo(() => {
        let count = 0;
        const arrKeys = ["category", "subcategory", "cuisine", "vibe", "musicStyle", "paymentMethods"];
        arrKeys.forEach(k => {
            const vals = searchParams.getAll(k);
            vals.forEach(v => { count += v.split(",").filter(Boolean).length; });
        });
        const boolKeys = [
            "hasOutdoorSeating", "hasLiveMusic", "hasDJ", "hasRooftop",
            "hasParking", "hasValetParking", "hasWifi", "isPetFriendly",
            "hasShisha", "hasDanceFloor", "isWheelchairAccessible",
            "hasGlutenFreeOptions", "hasSugarFreeOptions", "hasSaltFreeOptions", "hasBabyChairs",
            "SMOKING_ALLOWED", "NO_SMOKING", "DRESS_CODE", "PET_FRIENDLY", "ALCOHOL_SERVED",
            "ALCOHOL_FREE", "RESERVATION_REQUIRED", "TICKETED_ENTRY", "AGE_RESTRICTED",
            "CASH_ONLY", "CARD_PAYMENT", "FREE_ENTRY",
            "BABY_CHAIR", "DISABLED_ACCESS", "PARKING", "VALET", "OUTDOOR_SEATING",
            "WIFI", "POWER_OUTLETS", "AC", "OUTDOOR_SPACE", "PHOTO_FRIENDLY",
            "PRAYER_ROOM", "VIP_AREA", "PRIVATE_ROOM", "SMOKING_AREA", "NON_SMOKING_AREA",
            "LIVE_SPORTS", "ROOFTOP", "SEA_VIEW", "DRIVE_THROUGH", "DELIVERY",
            "TAKEAWAY", "WC", "KIDS_AREA"
        ];
        boolKeys.forEach(k => { if (searchParams.get(k) === "true") count++; });
        return count;
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (q) params.set("q", q);
        else params.delete("q");
        router.push(pathname + "?" + params.toString());
    };

    const getParamArray = (key: string) => {
        const val = searchParams.getAll(key);
        if (val.length > 0) {
            return val.flatMap(v => v.split(",")).filter(Boolean);
        }
        return [];
    };

    const getParamBoolMap = () => {
        const features: any = {};
        [
            "hasOutdoorSeating", "hasLiveMusic", "hasDJ", "hasRooftop",
            "hasParking", "hasValetParking", "hasWifi", "isPetFriendly",
            "hasShisha", "hasDanceFloor", "isWheelchairAccessible",
            "hasGlutenFreeOptions", "hasSugarFreeOptions", "hasSaltFreeOptions", "hasBabyChairs",
            // Taxonomy codes
            "SMOKING_ALLOWED", "NO_SMOKING", "DRESS_CODE", "PET_FRIENDLY", "ALCOHOL_SERVED",
            "ALCOHOL_FREE", "RESERVATION_REQUIRED", "TICKETED_ENTRY", "AGE_RESTRICTED",
            "CASH_ONLY", "CARD_PAYMENT", "FREE_ENTRY",
            "BABY_CHAIR", "DISABLED_ACCESS", "PARKING", "VALET", "OUTDOOR_SEATING",
            "WIFI", "POWER_OUTLETS", "AC", "OUTDOOR_SPACE", "PHOTO_FRIENDLY",
            "PRAYER_ROOM", "VIP_AREA", "PRIVATE_ROOM", "SMOKING_AREA", "NON_SMOKING_AREA",
            "LIVE_SPORTS", "ROOFTOP", "SEA_VIEW", "DRIVE_THROUGH", "DELIVERY",
            "TAKEAWAY", "WC", "KIDS_AREA"
        ].forEach(k => {
            if (searchParams.get(k) === "true") features[k] = true;
        });
        return features;
    };

    const currentFilters = {
        city: currentCity,
        category: getParamArray("category"),
        subcategory: getParamArray("subcategory"),
        specialization: getParamArray("specialization"),
        ambiance: getParamArray("vibe"),
        cuisine: getParamArray("cuisine"),
        musicStyle: getParamArray("musicStyle"),
        paymentMethods: getParamArray("paymentMethods"),
        features: getParamBoolMap(),
    };

    const changeCity = (city: string) => {
        setCityMenuOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        if (city === "All Cities") {
            params.delete("city");
        } else {
            params.set("city", city);
        }
        router.push(pathname + "?" + params.toString());
    };

    const applyQuickFilter = (params: Record<string, string>) => {
        const urlParams = new URLSearchParams(searchParams.toString());
        // Toggle: if already active, remove it
        const key = Object.keys(params)[0];
        const value = params[key];
        const current = urlParams.getAll(key).flatMap(v => v.split(",")).filter(Boolean);
        if (current.includes(value)) {
            // Remove
            urlParams.delete(key);
            const remaining = current.filter(v => v !== value);
            remaining.forEach(v => urlParams.append(key, v));
        } else {
            urlParams.append(key, value);
        }
        router.push(pathname + "?" + urlParams.toString());
    };

    const isQuickFilterActive = (params: Record<string, string>) => {
        const key = Object.keys(params)[0];
        const value = params[key];
        const current = searchParams.getAll(key).flatMap(v => v.split(",")).filter(Boolean);
        return current.includes(value);
    };

    const applySidebarFilters = (newFilters: any) => {
        const params = new URLSearchParams();
        if (newFilters.city && newFilters.city !== "All Cities") params.set("city", newFilters.city);
        if (q) params.set("q", q);
        const arrayKeys = ["category", "subcategory", "specialization", "ambiance", "cuisine", "musicStyle", "paymentMethods"];
        arrayKeys.forEach(k => {
            const paramKey = k === "ambiance" ? "vibe" : k;
            const val = newFilters[k];
            if (Array.isArray(val) && val.length > 0) {
                val.forEach(v => params.append(paramKey, v));
            } else if (typeof val === "string" && val) {
                params.set(paramKey, val);
            }
        });
        Object.entries(newFilters.features || {}).forEach(([k, v]) => {
            if (v) params.set(k, "true");
        });
        router.push(pathname + "?" + params.toString());
        setIsSidebarOpen(false);
    };

    const clearAllFilters = () => {
        setQ("");
        router.push(pathname);
    };

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isSidebarOpen]);

    // Close city menu on outside click
    useEffect(() => {
        if (!cityMenuOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest("[data-city-menu]")) setCityMenuOpen(false);
        };
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [cityMenuOpen]);

    return (
        <>
            {/* ─── Sticky Bar ───────────────────────────────────────── */}
            <div className="sticky top-[56px] md:top-[80px] z-40 bg-zinc-950/80 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-7xl mx-auto">

                    {/* Row 1: City + Search + Filters Button */}
                    <div className="flex items-center gap-2 px-3 md:px-8 py-2">

                        {/* City Selector */}
                        <div className="relative flex-shrink-0" data-city-menu>
                            <button
                                onClick={() => setCityMenuOpen(!cityMenuOpen)}
                                className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors group"
                            >
                                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/8 group-hover:bg-white/10 transition-colors">
                                    <MapPin size={12} className="text-white/60" />
                                </div>
                                <span className="font-semibold text-xs md:text-sm tracking-tight max-w-[80px] md:max-w-none truncate">
                                    {currentCity}
                                </span>
                                <ChevronDown size={12} className="text-white/30" />
                            </button>

                            {cityMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-950/95 backdrop-blur-2xl border border-white/8 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-1 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                        <button
                                            onClick={() => changeCity("All Cities")}
                                            className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all ${currentCity === "All Cities"
                                                    ? "bg-white/8 text-white font-bold"
                                                    : "text-white/50 hover:bg-white/5 hover:text-white"
                                                }`}
                                        >
                                            All Cities
                                        </button>
                                        {moroccanCities.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => changeCity(c)}
                                                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all ${currentCity === c
                                                        ? "bg-white/8 text-white font-bold"
                                                        : "text-white/50 hover:bg-white/5 hover:text-white"
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 min-w-0">
                            <div className="relative flex items-center bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5 transition-all focus-within:border-white/15 focus-within:bg-white/[0.05]">
                                <Search size={14} className="text-white/25 flex-shrink-0" />
                                <input
                                    value={q}
                                    onChange={e => setQ(e.target.value)}
                                    placeholder={
                                        currentCategory === "Café" ? "Coffee, brunch, coworking..." :
                                            currentCategory === "Restaurant" ? "Sushi, pizza, romantic..." :
                                                currentCategory === "Nightlife & Bars" ? "Cocktails, rooftop, live music..." :
                                                    currentCategory === "Clubs & Party" ? "Techno, beach club, pool party..." :
                                                        currentCategory === "Events" ? "Concerts, festivals, shows..." :
                                                            currentCategory === "Activities & Fun" ? "Bowling, karting, surfing..." :
                                                                currentCategory === "Wellness & Health" ? "Hammam, spa, yoga..." :
                                                                    "Search venues, cuisines, vibes..."
                                    }
                                    className="w-full bg-transparent border-none outline-none text-white px-2.5 placeholder:text-zinc-600 text-sm h-full text-ellipsis"
                                />
                                {q && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQ("");
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.delete("q");
                                            router.push(pathname + "?" + params.toString());
                                        }}
                                        className="p-0.5 hover:bg-white/10 rounded-md text-white/30 hover:text-white transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Filters Button */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex-shrink-0 flex items-center gap-1.5 bg-white/5 border border-white/8 text-white/70 hover:bg-white/10 hover:text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative"
                        >
                            <SlidersHorizontal size={14} />
                            <span className="hidden sm:inline">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white shadow-lg shadow-indigo-500/30">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Row 2: Quick Filter Chips (Horizontal Scroll) */}
                    <div className="flex items-center gap-1.5 px-3 md:px-8 pb-2.5 overflow-x-auto scrollbar-none">
                        {QUICK_FILTERS.map(f => {
                            const active = isQuickFilterActive(f.params);
                            return (
                                <button
                                    key={f.label}
                                    onClick={() => applyQuickFilter(f.params)}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${active
                                            ? "bg-white text-black border-white font-semibold shadow-sm"
                                            : "bg-transparent border-white/8 text-white/40 hover:border-white/15 hover:text-white/70 hover:bg-white/[0.03]"
                                        }`}
                                >
                                    <span className="text-[13px]">{f.icon}</span>
                                    {f.label}
                                </button>
                            );
                        })}

                        {/* Active filter tags */}
                        {activeFilterCount > 0 && (
                            <>
                                <div className="w-px h-4 bg-white/8 flex-shrink-0 mx-1" />
                                <button
                                    onClick={clearAllFilters}
                                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                                >
                                    <X size={10} />
                                    Clear all
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Sidebar Overlay ────────────────────────────────── */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="relative w-full max-w-md h-[100dvh] bg-zinc-950 shadow-2xl border-l border-white/8 animate-in slide-in-from-right duration-400 ease-out">
                        <FilterSidebar
                            filters={currentFilters}
                            setFilters={applySidebarFilters}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
