"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VenueCard from "@/components/VenueCard";
import FilterSidebar from "@/components/explore/FilterSidebar";
import { Filter, Search } from "lucide-react";
import { VENUE_CATEGORIES, AMBIANCES } from "@/lib/constants";

function ExploreContent() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState("");

  const [filters, setFilters] = useState({
    city: "",
    category: "",
    ambiance: "",
    cuisine: "",
    eventType: "",
    eventGenre: "",
    date: "",
    startTime: "",
    sort: "recommended",
    features: {} as Record<string, boolean>,
    dressCode: [] as string[],
    agePolicy: [] as string[],
    paymentMethods: [] as string[],
    openingDays: [] as string[],
    startHour: "",
    endHour: "",
  });

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefLoading, setPrefLoading] = useState(true);

  async function fetchUserPrefs() {
    try {
      const res = await fetch("/api/user/preferences");
      if (res.ok) {
        const data = await res.json();
        // Only apply if no explicit URL param for those keys
        const qParam = searchParams.get("q");
        const cityParam = searchParams.get("city");
        const categoryParam = searchParams.get("category");
        const ambianceParam = searchParams.get("ambiance");
        const vibeParam = searchParams.get("vibe");

        if (!qParam && !cityParam && !categoryParam && !ambianceParam && !vibeParam) {
          setFilters(prev => ({
            ...prev,
            city: data.preferredCities?.join(",") || "",
            category: data.preferredCategories?.join(",") || "",
            ambiance: data.preferredAmbiances?.join(",") || "",
          }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch user preferences", e);
    } finally {
      setPrefLoading(false);
    }
  }

  useEffect(() => {
    fetchUserPrefs();
  }, []);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (filters.city) params.set("city", filters.city);
    if (filters.category) params.set("category", filters.category);
    if (filters.ambiance) params.set("ambiance", filters.ambiance);
    if (filters.cuisine) params.set("cuisine", filters.cuisine);
    if (filters.eventType) params.set("eventType", filters.eventType);
    if (filters.eventGenre) params.set("eventGenre", filters.eventGenre);
    if (filters.date) params.set("date", filters.date);
    if (filters.startTime) params.set("startTime", filters.startTime);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.startHour) params.set("startHour", filters.startHour);
    if (filters.endHour) params.set("endHour", filters.endHour);
    if (filters.openingDays?.length) params.set("openingDays", filters.openingDays.join(","));

    if (filters.features) {
      Object.entries(filters.features).forEach(([available, isSelected]) => {
        if (isSelected) params.set(available, "true");
      });
    }

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

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [q, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.category) count++;
    if (filters.ambiance) count++;
    if (filters.cuisine) count++;
    if (filters.eventType) count++;
    if (filters.eventGenre) count++;
    if (filters.date) count++;
    if (filters.startTime) count++;
    if (filters.features) count += Object.values(filters.features).filter(Boolean).length;
    count += (filters.dressCode?.length || 0);
    count += (filters.agePolicy?.length || 0);
    count += (filters.paymentMethods?.length || 0);
    count += (filters.openingDays?.length || 0);
    if (filters.startHour) count++;
    if (filters.endHour) count++;
    return count;
  }, [filters]);

  useEffect(() => {
    const qParam = searchParams.get("q");
    const cityParam = searchParams.get("city");
    const categoryParam = searchParams.get("category");
    const ambianceParam = searchParams.get("ambiance");
    const vibeParam = searchParams.get("vibe");

    if (qParam) setQ(qParam);

    setFilters(prev => {
      const newFilters = { ...prev };
      if (cityParam) newFilters.city = cityParam;
      if (categoryParam) newFilters.category = categoryParam;
      if (ambianceParam) newFilters.ambiance = ambianceParam;

      if (vibeParam) {
        if (VENUE_CATEGORIES.includes(vibeParam)) {
          newFilters.category = vibeParam;
        } else if (AMBIANCES.includes(vibeParam)) {
          newFilters.ambiance = vibeParam;
        }
      }
      return newFilters;
    });
  }, [searchParams]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative">
      <div className="hidden lg:block lg:sticky lg:top-24 w-80 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
        <FilterSidebar filters={filters} setFilters={setFilters} className="w-full" />
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-[300px] h-full bg-zinc-900 shadow-2xl animate-in slide-in-from-left">
            <FilterSidebar filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 relative scrollbar-hide">
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

              <select
                value={filters.sort || "recommended"}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none hover:bg-white/10 transition-colors cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="top-rated">★ Top Rated</option>
                <option value="newest">🕒 Newest First</option>
              </select>
            </div>
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
                  ambiance={v.ambiance}
                  cuisine={v.cuisine}
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
                    setFilters({
                      city: "",
                      category: "",
                      ambiance: "",
                      cuisine: "",
                      eventType: "",
                      eventGenre: "",
                      date: "",
                      startTime: "",
                      sort: "recommended",
                      features: {},
                      dressCode: [],
                      agePolicy: [],
                      paymentMethods: [],
                      openingDays: [],
                      startHour: "",
                      endHour: ""
                    });
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

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
