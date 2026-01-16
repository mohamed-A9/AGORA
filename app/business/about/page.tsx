"use client";

import Link from "next/link";
import {
    ShieldCheck,
    ArrowRight,
    BarChart3,
    Users,
    Zap,
    Globe,
    Ticket,
    CalendarCheck,
    LayoutDashboard,
    Smartphone,
    CheckCircle2,
    ChevronDown
} from "lucide-react";

const features = [
    {
        icon: Users,
        title: "Global Visibility",
        description: "Put your venue in front of thousands of local and international travelers looking for their next experience in Morocco."
    },
    {
        icon: CalendarCheck,
        title: "Reservation Management",
        description: "Accept and manage bookings with ease. Our intuitive dashboard keeps your floor plan organized and your team in sync."
    },
    {
        icon: Ticket,
        title: "Ticketing & Events",
        description: "Selling tickets online? We seamlessly redirect users to your event pages or ticketing website to boost your sales."
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Understand your audience with real-time data on views, clicks, and conversion rates to optimize your business."
    },
    {
        icon: LayoutDashboard,
        title: "Premium Branded Profile",
        description: "Showcase your venue with high-resolution imagery, video trailers, and deep-dive details that reflect your brand's quality."
    },
    {
        icon: Smartphone,
        title: "Mobile Optimized",
        description: "Manage your business on the go. Agora's business portal is fully responsive and optimized for any device."
    }
];

const steps = [
    {
        title: "Register Your Account",
        description: "Create your business profile and verify your ownership in minutes."
    },
    {
        title: "Build Your Profile",
        description: "Upload stunning media, set your schedule, and list your unique features."
    },
    {
        title: "Go Live",
        description: "Start appearing in search results and receiving reservations immediately."
    }
];

export default function BusinessAboutPage() {
    return (
        <main className="min-h-screen pt-6 pb-20 relative px-4 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Hero Section */}
                <div className="text-center space-y-8 mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold tracking-wide uppercase">
                        <ShieldCheck className="w-5 h-5" />
                        Empowering Moroccan Hospitality
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter max-w-5xl mx-auto">
                        The Digital Front Door for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            Elite Venues
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/50 font-medium max-w-3xl mx-auto leading-relaxed">
                        Agora is Morocco's premium discovery platform. We connect high-end venues with a curated audience seeking exceptional experiences.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 pt-4">
                        <Link
                            href="/signup?role=business"
                            className="px-12 py-6 bg-white text-black text-xl font-bold rounded-2xl flex items-center gap-3 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5"
                        >
                            Get Started for Free
                            <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-10 flex flex-col items-center gap-2 animate-bounce cursor-pointer group hidden md:flex"
                        onClick={() => document.getElementById('features-grid')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <p className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase group-hover:text-white/40 transition-colors">
                            Scroll
                        </p>
                        <ChevronDown className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                </div>

                {/* Feature Grid */}
                <div id="features-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 backdrop-blur-xl hover:bg-zinc-900/80 transition-all hover:border-white/10 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                                <feature.icon className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-white/40 leading-relaxed text-lg italic">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Unified Card Section for Steps */}
                <div className="rounded-[3rem] p-12 md:p-24 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl overflow-hidden relative mb-32">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white text-center mb-20 tracking-tighter">
                            How to Become an <span className="text-indigo-400">Agora Partner</span>
                        </h2>

                        <div className="grid md:grid-cols-3 gap-16 relative">
                            {steps.map((step, idx) => (
                                <div key={idx} className="relative text-center group">
                                    <div className="w-16 h-16 rounded-full bg-white text-black text-2xl font-black flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-transform">
                                        {idx + 1}
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-4">{step.title}</h4>
                                    <p className="text-white/40 leading-relaxed italic">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center py-20 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-20 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter">
                            Ready to Join the Network?
                        </h2>
                        <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto">
                            Register today and start managing your venue with Agora's professional tools.
                        </p>
                        <Link
                            href="/signup?role=business"
                            className="inline-flex px-12 py-6 bg-white text-black text-xl font-bold rounded-2xl items-center gap-3 hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 mx-auto"
                        >
                            Register Your Business Now
                            <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
