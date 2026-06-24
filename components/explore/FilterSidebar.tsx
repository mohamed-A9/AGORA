"use client";

import { X, ChevronDown, ChevronRight, RotateCcw, Sparkles, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { moroccanCities } from "@/lib/constants";
import { TAXONOMY } from "@/lib/taxonomy";

interface FilterSidebarProps {
    filters: any;
    setFilters: (f: any) => void;
    className?: string;
    onClose?: () => void;
}

// ─── Accordion Section ───────────────────────────────────────────────
function Section({
    title,
    icon,
    count,
    defaultOpen = false,
    children,
}: {
    title: string;
    icon?: string;
    count?: number;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-white/5 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 px-1 group"
            >
                <div className="flex items-center gap-2.5">
                    {icon && <span className="text-base">{icon}</span>}
                    <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                        {title}
                    </span>
                    {count !== undefined && count > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-indigo-500/80 text-[10px] font-bold text-white">
                            {count}
                        </span>
                    )}
                </div>
                <ChevronRight
                    size={14}
                    className={`text-white/30 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                />
            </button>
            {open && (
                <div className="pb-4 px-1 animate-in slide-in-from-top-1 fade-in duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── Chip Button ────────────────────────────────────────────────────
function Chip({
    label,
    selected,
    onClick,
    color = "indigo",
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
    color?: "indigo" | "orange" | "purple" | "blue" | "emerald" | "rose" | "amber";
}) {
    const colorMap: Record<string, { active: string; inactive: string }> = {
        indigo: { active: "bg-indigo-500/20 border-indigo-400/40 text-indigo-200", inactive: "" },
        orange: { active: "bg-orange-500/20 border-orange-400/40 text-orange-200", inactive: "" },
        purple: { active: "bg-purple-500/20 border-purple-400/40 text-purple-200", inactive: "" },
        blue: { active: "bg-blue-500/20 border-blue-400/40 text-blue-200", inactive: "" },
        emerald: { active: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200", inactive: "" },
        rose: { active: "bg-rose-500/20 border-rose-400/40 text-rose-200", inactive: "" },
        amber: { active: "bg-amber-500/20 border-amber-400/40 text-amber-200", inactive: "" },
    };
    const c = colorMap[color] || colorMap.indigo;

    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${selected
                ? `${c.active} shadow-sm`
                : "bg-transparent border-white/8 text-zinc-500 hover:border-white/15 hover:text-zinc-300 hover:bg-white/[0.03]"
                }`}
        >
            {label}
        </button>
    );
}


// ─── Grouped Chip List (with optional search) ───────────────────────
function GroupedChips({
    groups,
    selectedItems,
    onToggle,
    color,
    searchable = false,
    maxInitial = 8,
}: {
    groups: Record<string, string[]>;
    selectedItems: string[];
    onToggle: (item: string) => void;
    color: "indigo" | "orange" | "purple" | "blue" | "emerald" | "rose" | "amber";
    searchable?: boolean;
    maxInitial?: number;
}) {
    const [searchQ, setSearchQ] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const normalize = (s: string) => s.toLowerCase();

    const filteredGroups = useMemo(() => {
        if (!searchQ.trim()) return groups;
        const q = searchQ.toLowerCase();
        const result: Record<string, string[]> = {};
        Object.entries(groups).forEach(([group, items]) => {
            const matched = items.filter(i => i.toLowerCase().includes(q));
            if (matched.length > 0) result[group] = matched;
        });
        return result;
    }, [groups, searchQ]);

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });
    };

    return (
        <div className="space-y-3">
            {searchable && (
                <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-white/[0.03] border border-white/8 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/15"
                    />
                </div>
            )}
            {Object.entries(filteredGroups).map(([groupName, items]) => {
                const isExpanded = expandedGroups.has(groupName) || searchQ.trim().length > 0;
                const displayItems = isExpanded ? items : items.slice(0, maxInitial);
                const groupSelectedCount = items.filter(i => selectedItems.some(s => normalize(s) === normalize(i))).length;

                return (
                    <div key={groupName} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">
                                {groupName}
                            </span>
                            {groupSelectedCount > 0 && (
                                <span className="text-[9px] font-bold text-indigo-400">{groupSelectedCount} selected</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {displayItems.map(item => (
                                <Chip
                                    key={item}
                                    label={item}
                                    selected={selectedItems.some(s => normalize(s) === normalize(item))}
                                    onClick={() => onToggle(item)}
                                    color={color}
                                />
                            ))}
                            {!isExpanded && items.length > maxInitial && (
                                <button
                                    onClick={() => toggleGroup(groupName)}
                                    className="px-2 py-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                                >
                                    +{items.length - maxInitial} more
                                </button>
                            )}
                            {isExpanded && items.length > maxInitial && !searchQ.trim() && (
                                <button
                                    onClick={() => toggleGroup(groupName)}
                                    className="px-2 py-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                                >
                                    less
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function FilterSidebar({ filters, setFilters, className = "", onClose }: FilterSidebarProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // ── Helpers ──────────────────────────────────────────────────────
    const update = (key: string, val: any) => {
        setLocalFilters((prev: any) => ({ ...prev, [key]: val }));
    };

    const toggleArrayItem = (key: string, item: string) => {
        setLocalFilters((prev: any) => {
            let current = prev[key];
            if (typeof current === "string") current = [current];
            if (!Array.isArray(current)) current = [];

            const normalize = (s: string) => s.toLowerCase();
            if (current.some((i: string) => normalize(i) === normalize(item))) {
                return { ...prev, [key]: current.filter((i: string) => normalize(i) !== normalize(item)) };
            } else {
                return { ...prev, [key]: [...current, item] };
            }
        });
    };

    const getArray = (key: string): string[] => {
        const val = localFilters[key];
        if (Array.isArray(val)) return val;
        if (typeof val === "string" && val.length > 0) return [val];
        return [];
    };

    const toggleFeature = (featureKey: string) => {
        setLocalFilters((prev: any) => {
            const currentFeatures = prev.features || {};
            return {
                ...prev,
                features: {
                    ...currentFeatures,
                    [featureKey]: !currentFeatures[featureKey],
                },
            };
        });
    };

    const apply = () => {
        setFilters(localFilters);
        if (onClose) onClose();
    };

    const clear = () => {
        const empty = {
            city: localFilters.city,
            category: [],
            subcategory: [],
            ambiance: [],
            musicStyle: [],
            features: {},
            cuisine: [],
        };
        setLocalFilters(empty);
        setFilters(empty);
    };

    // ── Derived State ───────────────────────────────────────────────
    const selectedCats = getArray("category");
    const selectedCuisines = getArray("cuisine");
    const selectedVibes = getArray("ambiance");
    const selectedMusic = getArray("musicStyle");
    const selectedSubcats = getArray("subcategory");
    // Total active filter count (excluding city)
    const totalActive =
        selectedCats.length +
        selectedSubcats.length +
        selectedCuisines.length +
        selectedVibes.length +
        selectedMusic.length;

    // Relevant subcategories based on category
    const normalize = (s: string) => s.toLowerCase().trim().replace(/&/g, "and").replace(/\s+/g, " ");

    let relevantSubcats: string[] = [];
    if (selectedCats.length > 0) {
        selectedCats.forEach(label => {
            let entry = TAXONOMY.CATEGORIES.find(c => c.label.toLowerCase() === label.toLowerCase());
            if (!entry) {
                const normLabel = normalize(label);
                entry = TAXONOMY.CATEGORIES.find(c => normalize(c.label) === normLabel);
            }
            if (!entry) {
                entry = TAXONOMY.CATEGORIES.find(c => {
                    if (label.toLowerCase().includes("club") && c.value === "CLUBS_PARTY") return true;
                    if (label.toLowerCase().includes("activit") && c.value === "ACTIVITIES_FUN") return true;
                    return false;
                });
            }
            if (entry) {
                const key = entry.value as keyof typeof TAXONOMY.SUBCATEGORIES;
                if (TAXONOMY.SUBCATEGORIES[key]) {
                    relevantSubcats.push(...TAXONOMY.SUBCATEGORIES[key]);
                }
            }
        });
    } else {
        // Show all subcategories when no category selected
        Object.values(TAXONOMY.SUBCATEGORIES).forEach(subs => relevantSubcats.push(...subs));
    }
    relevantSubcats = Array.from(new Set(relevantSubcats));

    // Show cuisine filter for food-related categories
    const showCuisine = selectedCats.length === 0 || selectedCats.some(c => ["Restaurant", "Café", "Cafe"].includes(c));

    // Show music filter for nightlife categories (or all)
    const showMusic =
        selectedCats.length === 0 ||
        selectedCats.some(c => {
            const l = c.toLowerCase();
            return l.includes("nightlife") || l.includes("club") || l.includes("event");
        });



    return (
        <div className={`flex flex-col h-full bg-zinc-950/95 backdrop-blur-2xl ${className}`}>
            {/* ─── Header ──────────────────────────────────────────── */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Sparkles size={14} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">Filters</h2>
                        {totalActive > 0 && (
                            <p className="text-[10px] text-indigo-400 font-medium">{totalActive} active</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {totalActive > 0 && (
                        <button
                            onClick={clear}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
                        >
                            <RotateCcw size={11} />
                            Clear
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 transition-all rounded-lg"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Scrollable Content ──────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">

                {/* 1 · CITY */}
                <Section title="City" icon="📍" defaultOpen={false}>
                    <div className="relative">
                        <select
                            value={localFilters.city}
                            onChange={e => update("city", e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none transition-colors"
                        >
                            <option value="All Cities">All Cities</option>
                            {moroccanCities.map(c => (
                                <option key={c} value={c} className="bg-zinc-900">
                                    {c}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={14} />
                    </div>
                </Section>

                {/* 2 · CATEGORY */}
                <Section title="Category" icon="📂" count={selectedCats.length} defaultOpen={true}>
                    <div className="flex flex-wrap gap-2">
                        {TAXONOMY.CATEGORIES.map(c => {
                            const isSelected = getArray("category").includes(c.label);
                            return (
                                <button
                                    key={c.value}
                                    onClick={() => toggleArrayItem("category", c.label)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-2 ${isSelected
                                        ? "bg-white text-black border-white shadow-lg shadow-white/5 scale-[1.02]"
                                        : "bg-transparent border-white/8 text-white/50 hover:border-white/20 hover:text-white hover:bg-white/[0.03]"
                                        }`}
                                >
                                    <span className="text-sm">{c.icon}</span>
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>
                </Section>

                {/* 3 · VENUE TYPE (Subcategories) */}
                <Section
                    title={selectedCats.length > 0 ? "Venue Type" : "Activity Type"}
                    icon="🏷️"
                    count={selectedSubcats.length}
                >
                    <div className="flex flex-wrap gap-1.5">
                        {relevantSubcats.slice(0, 20).map(t => (
                            <Chip
                                key={t}
                                label={t}
                                selected={selectedSubcats.some(s => s.toLowerCase() === t.toLowerCase())}
                                onClick={() => toggleArrayItem("subcategory", t)}
                                color="indigo"
                            />
                        ))}
                        {relevantSubcats.length > 20 && (
                            <span className="text-[10px] text-white/20 px-2 py-1 self-center">
                                +{relevantSubcats.length - 20} more in search
                            </span>
                        )}
                    </div>
                </Section>

                {/* 4 · CUISINE (Grouped) */}
                {showCuisine && (
                    <Section title="Cuisine" icon="🍽️" count={selectedCuisines.length}>
                        <GroupedChips
                            groups={TAXONOMY.CUISINE_GROUPS}
                            selectedItems={selectedCuisines}
                            onToggle={item => toggleArrayItem("cuisine", item)}
                            color="orange"
                            searchable={true}
                            maxInitial={6}
                        />
                    </Section>
                )}

                {/* 5 · VIBE & ATMOSPHERE (Grouped) */}
                <Section title="Vibe & Atmosphere" icon="✨" count={selectedVibes.length}>
                    <GroupedChips
                        groups={TAXONOMY.VIBE_GROUPS}
                        selectedItems={selectedVibes}
                        onToggle={item => toggleArrayItem("ambiance", item)}
                        color="purple"
                        maxInitial={6}
                    />
                </Section>

                {/* 6 · MUSIC (Grouped) */}
                {showMusic && (
                    <Section title="Music" icon="🎵" count={selectedMusic.length}>
                        <GroupedChips
                            groups={TAXONOMY.MUSIC_GROUPS}
                            selectedItems={selectedMusic}
                            onToggle={item => toggleArrayItem("musicStyle", item)}
                            color="blue"
                            searchable={true}
                            maxInitial={5}
                        />
                    </Section>
                )}



                <div className="h-24" />
            </div>

            {/* ─── Footer ──────────────────────────────────────────── */}
            <div className="px-4 py-3 border-t border-white/5 flex gap-3 bg-zinc-950/80 backdrop-blur-xl">
                <button
                    onClick={clear}
                    className="flex-1 py-3 rounded-xl border border-white/8 text-white/60 text-sm font-semibold hover:bg-white/5 hover:text-white transition-all active:scale-[0.98]"
                >
                    Reset All
                </button>
                <button
                    onClick={apply}
                    className="flex-[2] py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-100 transition-all shadow-lg shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    Show Results
                    {totalActive > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-black/10 text-[10px] font-bold">
                            {totalActive}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
