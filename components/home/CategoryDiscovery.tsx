"use client";

import Link from "next/link";
import { TAXONOMY } from "@/lib/taxonomy";

// Map colors to categories to maintain the "Vibe" aesthetic
const CATEGORY_STYLES: Record<string, string> = {
    "CAFE": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "RESTAURANT": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "NIGHTLIFE_BARS": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "CLUBS_PARTY": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "EVENTS": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "ACTIVITIES_FUN": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "WELLNESS_HEALTH": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function CategoryDiscovery() {
    return (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                    Find Your Perfect Vibe
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                    From intimate dinners to high-energy nights, discovery starts with a choice.
                </p>
            </div>

            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 md:gap-6">
                {TAXONOMY.CATEGORIES.map((cat, index) => {
                    // Fallback color if something mismatch
                    const colorClass = CATEGORY_STYLES[cat.value] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";

                    const isLast = index === TAXONOMY.CATEGORIES.length - 1;
                    const total = TAXONOMY.CATEGORIES.length;

                    // Mobile centering logic for 2-col grid (same as Explore)
                    const centerMobile = (total % 2 !== 0) && isLast;

                    return (
                        <Link
                            key={cat.value}
                            href={`/explore?category=${encodeURIComponent(cat.label)}`}
                            className={`group p-6 rounded-3xl border ${colorClass} backdrop-blur-sm hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center
                                ${centerMobile ? "col-span-2 !mx-auto !w-[calc(50%-0.5rem)] md:!mx-0 md:!w-[calc(25%-1.5rem)]" : "col-span-1 md:w-[calc(25%-1.5rem)]"}
                            `}
                        >
                            {/* Use Emoji as Icon */}
                            <div className="text-3xl md:text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                {cat.icon}
                            </div>
                            <span className="font-bold text-sm md:text-base">{cat.label}</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
