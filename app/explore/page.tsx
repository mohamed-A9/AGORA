"use client";

import { useEffect, useMemo, useState } from "react";
import VenueCard from "@/components/VenueCard";
import FilterSidebar from "@/components/explore/FilterSidebar";
import { Filter, Search } from "lucide-react";

export default function ExplorePage() {
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState("");

  // Complex filter state
  const [filters, setFilters] = useState({
    city: "",
    category: "",
    features: {} as Record<string, boolean>,
    dressCode: [] as string[],
    agePolicy: [] as string[],
    paymentMethods: [] as string[],
  });

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();

    // Search query
    if (q.trim()) params.set("q", q.trim());

    // Standard filters
    if (filters.city) params.set("city", filters.city);
    if (filters.category) params.set("category", filters.category);

    // Features (boolean flags)
    Object.entries(filters.features).forEach(([available, isSelected]) => {
      if (isSelected) params.set(available, "true");
    });

    // Array filters (comma separated)
    if (filters.dressCode?.length) params.set("dressCode", filters.dressCode.join(","));
    if (filters.agePolicy?.length) params.set("agePolicy", filters.agePolicy.join(","));
    if (filters.paymentMethods?.length) params.set("paymentMethods", filters.paymentMethods.join(","));

    try {
      const res = await fetch(`/api/venues?${params.toString()}`);
      const data = await res.json();
      setItems(Array.isArray(data?.venues) ? data.venues : []);
    } catch (e) {
      console.error("Failed to load venues", e);
      setItems([]);
    }
    setLoading(false);
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.category) count++;
    if (filters.features) count += Object.keys(filters.features).length;
    if (filters.dressCode?.length) count++;
    if (filters.paymentMethods?.length) count++;
    return count;
  }, [filters]);

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          className="w-80 h-full border-r border-white/10"
        />
      </div>

      {/* Mobile Filter Sheet Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-[300px] h-full bg-zinc-900 shadow-2xl animate-in slide-in-from-left">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto h-full relative scrollbar-hide">
        <div className="max-w-7xl mx-auto pb-20 pt-8 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Explore</h1>
              <p className="text-white/60 mt-1">Discover the best places to go out.</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white flex items-center gap-2"
              >
                <Filter size={20} />
                {activeFilterCount > 0 && <span className="bg-indigo-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>}
              </button>

              <div className="relative group flex-1 md:w-80">
                <Search className="absolute left-4 top-3.5 text-white/40" size={20} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search places, addresses..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white outline-none focus:bg-white/10 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Categories Quick Bar (optional, redundant with sidebar but nice for UX) */}
          <div className="lg:hidden flex gap-3 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            {['Restaurant', 'Club', 'Cafe', 'Rooftop'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: filters.category === cat ? "" : cat })}
                className={`px-4 py-2 rounded-full border border-white/10 text-sm font-medium whitespace-nowrap transition-colors ${filters.category === cat ? 'bg-white text-black' : 'bg-white/5 text-white/70'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse aspect-[20/19]">
                <div className="h-full w-full bg-white/5 rounded-xl" />
              </div>
            ))}

            {!loading && items.map((v) => {
              const coverImage = v.media?.find((m: any) => m.type === 'image')?.url;
              return (
                <VenueCard
                  key={v.id}
                  id={v.id}
                  name={v.name}
                  city={v.city}
                  category={v.category}
                  imageUrl={coverImage}
                  rating={v.rating}
                />
              );
            })}

            {!loading && items.length === 0 && (
              <div className="col-span-full py-20 text-center rounded-3xl border border-white/10 bg-white/5 text-white/70">
                <Filter size={48} className="mx-auto mb-4 text-white/20" />
                <h3 className="text-xl font-bold text-white">No places found</h3>
                <p className="mt-2 text-white/50">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => {
                    setFilters({ city: "", category: "", features: {}, dressCode: [], agePolicy: [], paymentMethods: [] });
                    setQ("");
                  }}
                  className="mt-6 px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-zinc-200"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
