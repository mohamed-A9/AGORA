"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function BusinessCTA() {
    return (
        <section id="partner-program" className="py-10 px-4 overflow-hidden relative text-center">
            <div className="max-w-3xl mx-auto">
                <div className="relative rounded-[2.5rem] p-6 md:p-10 bg-zinc-900/50 border border-white/5 backdrop-blur-3xl overflow-hidden group">
                    {/* Animated Background Accents */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-1000" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors duration-1000" />

                    <div className="relative z-10 space-y-8">
                        {/* Header Section */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wide uppercase">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Agora Partner Program
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                                Own a Venue? <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                    Elevate Your Presence
                                </span>
                            </h2>

                            <p className="text-sm md:text-base text-white/50 font-medium leading-relaxed max-w-xl mx-auto">
                                Join the most exclusive network of Moroccan venues. Manage reservations, redirect guests to your ticketing pages, and showcase your unique experience to thousands of explorers.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/signup?role=business"
                                className="px-8 py-3.5 bg-white text-black text-base font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                            >
                                Register Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                href="/business/about"
                                className="px-8 py-3.5 bg-white/5 border border-white/10 text-white text-base font-bold rounded-xl hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                Learn More
                            </Link>
                        </div>

                        {/* Integrated Stats Section */}
                        <div className="pt-8 border-t border-white/5 flex items-center justify-center gap-8 md:gap-16">
                            <div className="text-center group/stat">
                                <p className="text-xl font-black text-white">500+</p>
                                <p className="text-[9px] font-bold text-white/30 tracking-widest uppercase">Venues</p>
                            </div>
                            <div className="text-center group/stat">
                                <p className="text-xl font-black text-white">20k+</p>
                                <p className="text-[9px] font-bold text-white/30 tracking-widest uppercase">Users</p>
                            </div>
                            <div className="text-center group/stat">
                                <div className="relative inline-block">
                                    <p className="text-xl font-black text-white">10+</p>
                                    <span className="absolute -top-3 -right-6 px-1 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/20 text-[6px] font-black text-indigo-400">
                                        SOON
                                    </span>
                                </div>
                                <p className="text-[9px] font-bold text-white/30 tracking-widest uppercase">Cities</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
