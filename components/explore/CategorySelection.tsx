"use client";

import { TAXONOMY } from "@/lib/taxonomy";
import Link from "next/link";

export default function CategorySelection() {
    return (
        <div className="pt-2 pb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* 2. TITLE SECTION (LIGHTER) */}
            <div className="text-center mb-6 px-4">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    What are you in the mood for?
                </h2>
            </div>

            {/* CARD LAYOUT */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-7xl mx-auto px-4">
                {TAXONOMY.CATEGORIES.map((cat, index) => {
                    return (
                        <Link
                            key={cat.value}
                            href={`/explore?category=${encodeURIComponent(cat.label)}`}
                            className={`group relative flex flex-col items-center justify-center text-center 
                                rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/50 to-black/50 
                                p-6 md:p-10 gap-4 transition-all duration-500 hover:scale-[1.02] hover:bg-white/5 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10
                                w-[calc(50%-0.5rem)] md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] min-h-[160px] md:min-h-[280px]
                            `}
                        >
                            {/* Glow Effect on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-3xl" />

                            {/* Main Icon */}
                            <div className="text-4xl md:text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-500">
                                {cat.icon}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-2 w-full relative z-10 text-center">
                                <h3 className="text-lg md:text-2xl font-bold text-white tracking-tight leading-tight">
                                    {cat.label}
                                </h3>
                                <p className="text-xs md:text-base text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors leading-relaxed opacity-0 md:opacity-100 group-hover:opacity-100 hidden md:block">
                                    {(cat as any).description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
