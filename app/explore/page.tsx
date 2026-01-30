import CategorySelection from "@/components/explore/CategorySelection";
import { getExploreData } from "@/actions/explore";
import FilterBar from "@/components/explore/FilterBar";
import DiscoverySection from "@/components/explore/DiscoverySection";
import VenueCard from "@/components/VenueCard";
import { Search, MapPin, Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Explore - AGORA",
  description: "Discover the best restaurants, nightlife, and events in your city.",
};

// Wrapper for cards to ensure consistent width in horizontal scroll
const CardWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[85vw] sm:w-[320px] md:w-[280px] lg:w-[calc(25%-1rem)] max-w-[400px] flex-shrink-0 h-full">
    {children}
  </div>
);

export default async function ExplorePage(props: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // Parse params
  // If no category and no search query, we are in "Landing Mode"
  // (We ignore city because it defaults to Casablanca usually)
  const isLanding = !searchParams?.category && !searchParams?.q;

  const data = await getExploreData({
    ...searchParams,
    // ensure strings
    city: searchParams?.city,
    category: searchParams?.category,
    vibe: searchParams?.vibe,
    q: searchParams?.q
  });

  const isFiltered = data.mode === "results";
  const hasResults = isFiltered ? (data.items && data.items.length > 0) : (data.sections && data.sections.some((s: any) => s.items.length > 0));

  return (
    <div className="">
      <FilterBar />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* LANDING STATE: CATEGORY SELECTION */}
        {isLanding && (
          <CategorySelection />
        )}

        {/* 1. FILTERED SEARCH RESULTS (Only if NOT landing or if user searched) */}
        {!isLanding && isFiltered && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Search size={20} className="text-indigo-400" />
              Search Results
            </h2>

            {data.items && data.items.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6">
                {data.items.map((v: any) => (
                  <div key={v.id} className="w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] max-w-[360px]">
                    <VenueCard
                      id={v.id}
                      name={v.name}
                      city={v.city?.name || v.city}
                      category={v.mainCategory}
                      rating={v.rating}
                      imageUrl={v.coverImageUrl || v.gallery?.[0]?.url}
                      ambiance={v.vibes?.[0]?.vibe.name}
                      cuisine={v.cuisines?.[0]?.cuisine.name}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-white/40" />
                </div>
                <h3 className="text-xl font-bold text-white">No matches found</h3>
                <p className="text-white/50 mt-2 max-w-md mx-auto">
                  We couldn't find any venues matching your criteria. Try adjusting your filters or search for something else.
                </p>
                <Link href="/explore" className="inline-block mt-6 px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors">
                  Clear Filters
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 2. DISCOVERY SECTIONS (Unfiltered) */}
        {/* We generally only show this if User HAS filtered by city but NOT category? 
            OR if we want "Trending" below categories?
            The user said "give the user a whole page that ASK".
            So maybe we HIDE Discovery Sections if `isLanding` is true, 
            OR we show them below the categories? 
            Let's hide them for a cleaner "Choice" page as requested.
        */}
        {!isLanding && !isFiltered && hasResults && (
          <>
            {data.sections?.map((section: any) => (
              section.items.length > 0 && (
                <DiscoverySection key={section.title} title={section.title} subtitle={section.subtitle} actionHref={section.link}>
                  {section.items.map((v: any) => (
                    <CardWrapper key={v.id}>
                      <VenueCard
                        id={v.id}
                        name={v.name}
                        city={v.city?.name || v.city}
                        category={v.mainCategory}
                        rating={v.rating}
                        imageUrl={v.coverImageUrl || v.gallery?.[0]?.url}
                        ambiance={v.vibes?.[0]?.vibe.name}
                        cuisine={v.cuisines?.[0]?.cuisine.name}
                      />
                    </CardWrapper>
                  ))}
                </DiscoverySection>
              )
            ))}
          </>
        )}

        {/* EMPTY STATE - NO DATA AT ALL */}
        {!isLanding && !hasResults && !isFiltered && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
            <div className="text-center py-20 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-white/10">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
                <MapPin size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">New experiences coming soon 👀</h2>
              <p className="text-white/60 max-w-lg mx-auto mb-8 text-lg">
                We are curating the best list of spots in your city. Be the first to add a venue or check back later!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/business/add-venue" className="px-8 py-3 bg-white text-black text-lg font-bold rounded-full hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                  <Plus size={20} /> Add a Venue
                </Link>
                <Link href="/business" className="px-8 py-3 bg-white/5 text-white border border-white/10 text-lg font-bold rounded-full hover:bg-white/10 transition-colors">
                  Become a Partner
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

