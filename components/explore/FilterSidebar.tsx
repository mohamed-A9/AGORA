"use client";

import { useState, useEffect } from "react";
import { moroccanCities, VENUE_CATEGORIES, DRESS_CODES, AGE_POLICIES, PAYMENT_METHODS } from "@/lib/constants";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSidebarProps {
    filters: any;
    setFilters: (filters: any) => void;
    className?: string;
    onClose?: () => void;
}

export default function FilterSidebar({ filters, setFilters, className = "", onClose }: FilterSidebarProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>("location");

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const updateFilter = (key: string, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const toggleArrayFilter = (key: string, item: string) => {
        const current = filters[key] || [];
        if (current.includes(item)) {
            updateFilter(key, current.filter((i: string) => i !== item));
        } else {
            updateFilter(key, [...current, item]);
        }
    };

    return (
        <div className={`bg-zinc-900 border-r border-white/10 h-full overflow-y-auto w-80 flex-shrink-0 flex flex-col ${className}`}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Filter size={20} /> Filters
                </h2>
                {onClose && (
                    <button onClick={onClose} className="md:hidden text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                )}
            </div>

            <div className="p-4 space-y-6 pb-24">
                {/* Location */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("location")}>
                        <h3 className="font-semibold text-white">Location</h3>
                        {expandedSection === "location" ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                    </div>
                    {expandedSection === "location" && (
                        <select
                            value={filters.city || ""}
                            onChange={(e) => updateFilter("city", e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                        >
                            <option value="">All Cities</option>
                            {moroccanCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="h-px bg-white/5" />

                {/* Categories */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("categories")}>
                        <h3 className="font-semibold text-white">Category</h3>
                        {expandedSection === "categories" ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                    </div>
                    {expandedSection === "categories" && (
                        <div className="flex flex-wrap gap-2">
                            {VENUE_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => updateFilter("category", filters.category === cat ? "" : cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filters.category === cat
                                            ? "bg-white text-black border-white"
                                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-px bg-white/5" />

                {/* Features */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("features")}>
                        <h3 className="font-semibold text-white">Features</h3>
                        {expandedSection === "features" ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                    </div>
                    {expandedSection === "features" && (
                        <div className="space-y-2">
                            {[
                                { key: 'parkingAvailable', label: 'Parking Available' },
                                { key: 'valetParking', label: 'Valet Service' },
                                { key: 'reservationsEnabled', label: 'Accepts Reservations' }
                            ].map(feature => (
                                <label key={feature.key} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.features?.[feature.key] ? "bg-indigo-600 border-indigo-600" : "border-zinc-600 group-hover:border-zinc-500"
                                        }`}>
                                        {filters.features?.[feature.key] && <span className="text-xs text-white">✓</span>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.features?.[feature.key] || false}
                                        onChange={(e) => {
                                            const newFeatures = { ...filters.features, [feature.key]: e.target.checked };
                                            // Remove false keys to keep url clean
                                            if (!e.target.checked) delete newFeatures[feature.key];
                                            updateFilter("features", newFeatures);
                                        }}
                                    />
                                    <span className="text-zinc-300 text-sm">{feature.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-px bg-white/5" />

                {/* Dress Code */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("dressCode")}>
                        <h3 className="font-semibold text-white">Dress Code</h3>
                        {expandedSection === "dressCode" ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                    </div>
                    {expandedSection === "dressCode" && (
                        <div className="space-y-2">
                            {DRESS_CODES.map(code => (
                                <label key={code} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.dressCode?.includes(code) ? "border-indigo-500" : "border-zinc-600"
                                        }`}>
                                        {filters.dressCode?.includes(code) && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.dressCode?.includes(code) || false}
                                        onChange={() => toggleArrayFilter("dressCode", code)}
                                    />
                                    <span className="text-zinc-300 text-sm">{code}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-px bg-white/5" />

                {/* Payment Methods */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("payment")}>
                        <h3 className="font-semibold text-white">Payment Methods</h3>
                        {expandedSection === "payment" ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                    </div>
                    {expandedSection === "payment" && (
                        <div className="flex flex-wrap gap-2">
                            {PAYMENT_METHODS.map(method => (
                                <button
                                    key={method}
                                    onClick={() => toggleArrayFilter("paymentMethods", method)}
                                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${filters.paymentMethods?.includes(method)
                                            ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-200"
                                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-zinc-900 sticky bottom-0">
                <button
                    onClick={() => setFilters({})}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors text-sm"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
}
