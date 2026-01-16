"use client";

import Link from "next/link";
import { Search, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchDropdown from "./home/SearchDropdown";
import { moroccanCities, AMBIANCES, VENUE_CATEGORIES } from "@/lib/constants";

export default function Hero() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [vibe, setVibe] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (vibe) params.set("vibe", vibe); // New generic vibe param
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="relative z-20 min-h-[80vh] flex flex-col items-center justify-center px-6">

      <div className="mx-auto max-w-4xl text-center space-y-12 w-full">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-medium text-white/80 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Discover the Elite of Moroccan Experiences
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight text-white animate-slide-up leading-[0.9]">
            THE HEART OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              NIGHTLIFE
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-lg md:text-xl text-white/60 font-medium animate-slide-up-delay">
            Curating the finest destinations in Morocco. From mystical rooftops
            to high-energy clubs, your next memory starts here.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay pt-4">
          <Link
            href="/explore"
            className="w-full sm:w-auto px-10 py-5 bg-white text-black text-lg font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Start Exploring
            <ChevronRight className="w-5 h-5" />
          </Link>

          <Link
            href="#partner-program"
            className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white text-lg font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md"
          >
            List Your Business
          </Link>
        </div>

        <div className="hidden md:flex flex-col items-center gap-4">
          <div className="w-full max-w-3xl flex bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl animate-fade-in divide-x divide-white/5 p-1">
            <SearchDropdown
              label="What are you looking for?"
              placeholder="Select Vibe"
              value={vibe}
              onChange={setVibe}
              options={Array.from(new Set([...VENUE_CATEGORIES, ...AMBIANCES]))}
              icon={<Sparkles className="w-5 h-5" />}
            />

            <SearchDropdown
              label="Where to?"
              placeholder="Select City"
              value={city}
              onChange={setCity}
              options={moroccanCities}
              icon={<MapPin className="w-5 h-5" />}
            />

            <div className="flex items-center px-4">
              <button
                onClick={handleSearch}
                className="px-10 h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                Discover
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 group-hover:bg-yellow-300 transition-colors animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            <p className="text-[10px] font-black text-yellow-400 tracking-[0.3em] uppercase transition-colors group-hover:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)] flex items-center gap-2">
              Beyond Morocco
              <img
                src="https://flagcdn.com/w40/ma.png"
                alt="Morocco"
                className="w-4 h-3.5 object-cover rounded-sm border border-white/10"
              />
              — More countries coming soon
            </p>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 group-hover:bg-yellow-300 transition-colors animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 left-10 flex flex-col items-center gap-2 animate-bounce cursor-pointer group"
        onClick={() => document.getElementById('partner-program')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <p className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase group-hover:text-white/40 transition-colors">
          Scroll
        </p>
        <ChevronRight className="w-5 h-5 text-white/20 rotate-90 group-hover:text-white/40 transition-colors" />
      </div>
    </div>
  );
}
