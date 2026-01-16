"use client";

import Link from "next/link";
import {
    Compass,
    Heart,
    MapPin,
    Bell,
    Star,
    ShieldCheck,
    ArrowRight,
    TrendingUp,
    History,
    CalendarDays,
    ChevronDown
} from "lucide-react";

const benefits = [
    {
        icon: Compass,
        title: "Curated Discovery",
        description: "Find the most exclusive restaurants, clubs, and events in Morocco, hand-picked for quality."
    },
    {
        icon: Heart,
        title: "Personalized Favorites",
        description: "Save your favorite spots and create your own bucket list of must-visit venues."
    },
    {
        icon: CalendarDays,
        title: "Easy Reservations",
        description: "Book your table or spot in seconds. Manage all your outings in one central place."
    },
    {
        icon: Bell,
        title: "Exclusive Alerts",
        description: "Be the first to know about secret events, new openings, and VIP invitations."
    },
    {
        icon: MapPin,
        title: "Explore Moroccan Cities",
        description: "Deep dive into the unique vibes of Marrakech, Casablanca, Tangier, and more."
    },
    {
        icon: TrendingUp,
        title: "Trending Spots",
        description: "Real-time updates on what's hot right now in the Moroccan scene."
    }
];

export default function MemberAboutPage() {
    return (
        <main className="min-h-screen pt-6 pb-20 relative px-4 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Hero Section */}
                <div className="text-center space-y-8 mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold tracking-wide uppercase">
                        <Star className="w-5 h-5 fill-purple-400" />
                        Your Ultimate Moroccan Guide
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter max-w-5xl mx-auto">
                        Experience the Best of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                            Moroccan Life
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/50 font-medium max-w-3xl mx-auto leading-relaxed">
                        Join thousands of explorers discovering the hidden gems and elite venues of Morocco. AGORA is your passport to the exceptional.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 pt-4">
                        <Link
                            href="/signup"
                            className="px-12 py-6 bg-white text-black text-xl font-bold rounded-2xl flex items-center gap-3 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5"
                        >
                            Join for Free
                            <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-10 flex flex-col items-center gap-2 animate-bounce cursor-pointer group hidden md:flex"
                        onClick={() => document.getElementById('benefits-grid')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <p className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase group-hover:text-white/40 transition-colors">
                            Scroll
                        </p>
                        <ChevronDown className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                </div>

                {/* Benefits Grid */}
                <div id="benefits-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {benefits.map((benefit, idx) => (
                        <div
                            key={idx}
                            className="p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 backdrop-blur-xl hover:bg-zinc-900/80 transition-all hover:border-white/10 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                                <benefit.icon className="w-7 h-7 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                            <p className="text-white/40 leading-relaxed text-lg italic">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="rounded-[3rem] p-12 md:p-24 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl overflow-hidden relative mb-32">
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />

                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                            Not Just an App. <br />
                            <span className="text-purple-400">A Community.</span>
                        </h2>
                        <p className="text-white/40 text-xl leading-relaxed italic">
                            From high-fashion dinners in Marrakech to clandestine beach clubs in Tangier, AGORA connects you with the people and places that define modern Morocco.
                        </p>
                        <div className="flex justify-center gap-12 md:gap-24 pt-4">
                            <div>
                                <p className="text-4xl font-black text-white">20k+</p>
                                <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Members</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-white">100k+</p>
                                <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Reservations</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center py-20 rounded-[3rem] bg-gradient-to-br from-purple-600 to-pink-700 p-8 md:p-20 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter">
                            Start Your Journey Today
                        </h2>
                        <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto">
                            Join Agora and discover a whole new side of Morocco.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex px-12 py-6 bg-white text-black text-xl font-bold rounded-2xl items-center gap-3 hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 mx-auto"
                        >
                            Sign Up for Free
                            <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
