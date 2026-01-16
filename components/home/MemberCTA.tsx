"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function MemberCTA() {
    return (
        <section className="py-10 px-4 overflow-hidden relative text-center">
            <div className="max-w-3xl mx-auto">
                <div className="relative rounded-[2.5rem] p-6 md:p-10 bg-zinc-900/50 border border-white/5 backdrop-blur-3xl overflow-hidden group">
                    {/* Animated Background Accents */}
                    <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full group-hover:bg-purple-500/20 transition-colors duration-1000" />
                    <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-[200px] h-[200px] bg-pink-500/10 blur-[80px] rounded-full group-hover:bg-pink-500/20 transition-colors duration-1000" />

                    <div className="relative z-10 space-y-8">
                        {/* Header Section */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold tracking-wide uppercase">
                                <Sparkles className="w-3.5 h-3.5 fill-purple-400" />
                                Agora Explorer Membership
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                                Discover More. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                    Experience Better.
                                </span>
                            </h2>

                            <p className="text-sm md:text-base text-white/50 font-medium leading-relaxed max-w-xl mx-auto">
                                Save your favorite spots, get personalized recommendations, and be the first to know about exclusive events across Morocco.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/signup"
                                className="px-8 py-3.5 bg-white text-black text-base font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                            >
                                Join Agora
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                href="/members/about"
                                className="px-8 py-3.5 bg-white/5 border border-white/10 text-white text-base font-bold rounded-xl hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                Learn More
                            </Link>
                        </div>

                        {/* Integrated Stats Section */}
                        <div className="pt-8 border-t border-white/5 flex items-center justify-center gap-8 md:gap-16 text-white/40">
                            <div className="text-center">
                                <p className="text-xl font-black text-white">20k+</p>
                                <p className="text-[9px] font-bold tracking-widest uppercase">Explorers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-white">1k+</p>
                                <p className="text-[9px] font-bold tracking-widest uppercase">Hidden Gems</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-white">5★</p>
                                <p className="text-[9px] font-bold tracking-widest uppercase">Experiences</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
