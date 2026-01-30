"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { SlidersHorizontal, MapPin, ChevronDown, Search } from "lucide-react";
import { moroccanCities } from "@/lib/constants";
import FilterSidebar from "./FilterSidebar";

const FILTERS = [
    { label: "All", key: "all" },
    { label: "Restaurants", key: "category", value: "restaurants" },
    { label: "Nightlife", key: "category", value: "nightlife" },
    { label: "Events", key: "date", value: new Date().toISOString().split('T')[0] },
    { label: "Activities", key: "category", value: "activities" },
    { label: "Gluten Free", key: "hasGlutenFreeOptions", value: "true" },
    { label: "Sugar Free", key: "hasSugarFreeOptions", value: "true" },
    { label: "Healthy", key: "specialization", value: "Healthy" },
    { label: "Chill", key: "vibe", value: "chill" },
    { label: "Party", key: "vibe", value: "party" },
];

export default function FilterBar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [cityMenuOpen, setCityMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [q, setQ] = useState("");

    const currentCity = searchParams.get("city") || "Casablanca";
    const currentCategory = searchParams.get("category");

    useEffect(() => {
        const urlQ = searchParams.get("q");
        if (urlQ) setQ(urlQ);
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
            const flat = val.flatMap(v => v.split(','));
            return flat.filter(Boolean);
        }
        return [];
    };

    const getParamBoolMap = () => {
        const features: any = {};
        [
            "hasOutdoorSeating", "hasLiveMusic", "hasDJ", "hasRooftop",
            "hasParking", "hasValetParking", "hasWifi", "isPetFriendly",
            "hasShisha", "hasDanceFloor", "isWheelchairAccessible",
            "hasGlutenFreeOptions", "hasSugarFreeOptions", "hasSaltFreeOptions", "hasBabyChairs"
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
        features: getParamBoolMap()
    };

    const changeCity = (city: string) => {
        setCityMenuOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set("city", city);
        router.push(pathname + "?" + params.toString());
    }

    const applySidebarFilters = (newFilters: any) => {
        const params = new URLSearchParams();
        if (newFilters.city) params.set("city", newFilters.city);
        if (q) params.set("q", q);
        const arrayKeys = ["category", "subcategory", "specialization", "ambiance", "cuisine", "musicStyle", "paymentMethods"];
        arrayKeys.forEach(k => {
            const paramKey = k === "ambiance" ? "vibe" : k;
            const val = newFilters[k];
            if (Array.isArray(val) && val.length > 0) {
                val.forEach(v => params.append(paramKey, v));
            } else if (typeof val === 'string' && val) {
                params.set(paramKey, val);
            }
        });
        Object.entries(newFilters.features || {}).forEach(([k, v]) => {
            if (v) params.set(k, "true");
        });
        router.push(pathname + "?" + params.toString());
        setIsSidebarOpen(false);
    }

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isSidebarOpen]);

    return (
        <>
            {/* Header / Filter Bar - Sticky to stack below Header */}
            <div className="sticky top-[56px] md:top-[80px] z-40 py-2 transition-all duration-300 bg-transparent backdrop-blur-xl border-b border-white/5">
                <div className="relative max-w-7xl mx-auto md:px-8">

                    {/* FLEX CONTAINER: Column on Mobile, Row on Desktop */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between w-full">

                        {/* ROW 1 (Mobile): City + Filters */}
                        <div className="flex items-center justify-between w-full md:w-auto px-3 md:px-0 z-20">
                            {/* City Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setCityMenuOpen(!cityMenuOpen)}
                                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:bg-white/20">
                                        <MapPin size={14} className="text-white" />
                                    </div>
                                    <span className="font-bold text-sm md:text-lg tracking-tight">{currentCity}</span>
                                    <ChevronDown size={14} className="text-white/50" />
                                </button>

                                {cityMenuOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-1 space-y-0.5">
                                            {moroccanCities.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => changeCity(c)}
                                                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all ${currentCity === c
                                                        ? "bg-white/10 text-white font-bold"
                                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                                        }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Filter Button (Mobile: Right side of top row) */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="group relative"
                                >
                                    <div className="flex items-center gap-2 bg-white/10 border border-white/10 text-white hover:bg-white/20 px-3 py-2 rounded-full font-medium text-sm transition-all">
                                        <SlidersHorizontal size={16} />
                                        <span>Filters</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* ROW 2 (Mobile) / CENTER (Desktop): Search Bar */}
                        <form onSubmit={handleSearch} className="w-full px-1 md:px-0 md:flex-1 md:mx-6 md:order-2 z-10">
                            <div className="relative group w-full">
                                <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-full px-3 py-3 shadow-lg transition-all focus-within:border-white/20 focus-within:bg-white/10">
                                    <Search size={18} className="text-white/40 ml-1 flex-shrink-0" />
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder={
                                            currentCategory === "Café" ? "Search for specialty coffee, brunch, coworking..." :
                                                currentCategory === "Restaurant" ? "Search for cuisines, sushi, pizza, romantic spots..." :
                                                    currentCategory === "Nightlife & Bars" ? "Search for cocktails, rooftops, wine, live music..." :
                                                        currentCategory === "Clubs & Party" ? "Search for beach clubs, techno, pool parties..." :
                                                            currentCategory === "Events" ? "Search for concerts, festivals, shows..." :
                                                                currentCategory === "Activities & Fun" ? "Search for bowling, karting, surfing, city tours..." :
                                                                    currentCategory === "Wellness & Health" ? "Search for hammam, massage, yoga, gym..." :
                                                                        "Search anything anywhere… e.g. Sushi, DJ, Hammam, Rooftop"
                                        }
                                        className="w-full bg-transparent border-none outline-none text-white px-3 placeholder:text-zinc-500 text-sm md:text-base h-full text-ellipsis"
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
                                            className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                                        >
                                            <span className="text-[10px] font-bold">✕</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* DESKTOP ONLY: Filter Button (Right side) */}
                        <div className="hidden md:block md:order-3 md:flex-shrink-0 z-20">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="group relative"
                            >
                                <div className="flex items-center gap-2 bg-white/10 border border-white/10 text-white hover:bg-white/20 px-5 py-3 rounded-full font-medium text-sm transition-all">
                                    <SlidersHorizontal size={16} />
                                    <span>Filters</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    {/* Sidebar Drawer */}
                    <div className="relative w-full max-w-md h-[100dvh] bg-zinc-950 shadow-2xl border-l border-white/10 animate-in slide-in-from-right duration-500 ease-out">
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
