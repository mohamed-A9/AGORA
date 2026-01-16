"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SearchDropdownProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    icon: React.ReactNode;
    placeholder: string;
}

export default function SearchDropdown({ label, options, value, onChange, icon, placeholder }: SearchDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative flex-1" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center px-6 gap-3 h-16 text-left group transition-all"
            >
                <div className="text-white/20 group-hover:text-indigo-400 transition-colors">
                    {icon}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">{label}</p>
                    <p className="text-white font-medium truncate">
                        {value || <span className="text-white/20">{placeholder}</span>}
                    </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-fade-in max-h-80 overflow-y-auto premium-scrollbar">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-6 py-3 text-left text-white/70 hover:text-white hover:bg-white/5 transition-colors group"
                        >
                            <span className="font-medium">{option}</span>
                            {value === option && (
                                <Check className="w-4 h-4 text-indigo-400" />
                            )}
                        </button>
                    ))}
                    {options.length === 0 && (
                        <div className="px-6 py-4 text-white/30 text-sm italic text-center">
                            No options found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
