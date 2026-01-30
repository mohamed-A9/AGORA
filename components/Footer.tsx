"use client";

import { Mail, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-black/40 border-t border-white/5 py-12 mt-12 bg-opacity-30 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-6 text-center">

                {/* Brand / Logo (Optional text) */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-bold text-white tracking-tighter">AGORA</h3>
                    <p className="text-zinc-500 text-sm">Discover the best of Morocco</p>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-zinc-400 text-sm">
                    <a href="mailto:mohamed.fatih.job@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                        <Mail size={16} />
                        <span>mohamed.fatih.job@gmail.com</span>
                    </a>
                    <a href="tel:+212674714276" className="flex items-center gap-2 hover:text-white transition-colors">
                        <Phone size={16} />
                        <span>+212 674-714276</span>
                    </a>
                </div>

                {/* Copyright */}
                <div className="text-zinc-600 text-xs mt-4">
                    &copy; {new Date().getFullYear()} Agora. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
