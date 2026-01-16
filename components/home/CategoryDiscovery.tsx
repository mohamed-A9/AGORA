"use client";

import Link from "next/link";
import { Utensils, Music, Martini, Camera, Tent, Beer } from "lucide-react";

const categories = [
    { id: 'Restaurant', label: 'Restaurants', icon: Utensils, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { id: 'Club', label: 'Nightclubs', icon: Music, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'Lounge', label: 'Lounges', icon: Martini, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    { id: 'events', label: 'Events', icon: Camera, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'Beach Club', label: 'Beach Clubs', icon: Tent, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { id: 'Bar', label: 'Bars & Pubs', icon: Beer, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
];

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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/explore?category=${cat.id}`}
                        className={`group p-6 rounded-3xl border ${cat.color} backdrop-blur-sm hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center`}
                    >
                        <cat.icon className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-12 transition-transform" />
                        <span className="font-bold text-sm md:text-base">{cat.label}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
