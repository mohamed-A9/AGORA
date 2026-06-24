import Hero from "@/components/Hero";
import CategoryDiscovery from "@/components/home/CategoryDiscovery";
import FeaturedCities from "@/components/home/FeaturedCities";
import BusinessCTA from "@/components/home/BusinessCTA";
import MemberCTA from "@/components/home/MemberCTA";
import CasablancaVenues from "@/components/home/CasablancaVenues";
import { Suspense } from "react";

function VenuesSkeleton() {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-10 w-64 bg-white/5 rounded-xl mb-4 animate-pulse" />
      <div className="h-5 w-96 bg-white/5 rounded-lg mb-14 animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-16">
          <div className="h-7 w-48 bg-white/5 rounded-lg mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="rounded-2xl overflow-hidden bg-white/5 animate-pulse">
                <div className="h-44 bg-white/10" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent overflow-x-hidden">
      <Hero />
      <div className="relative z-10 space-y-4">
        <CategoryDiscovery />
        <Suspense fallback={<VenuesSkeleton />}>
          <CasablancaVenues />
        </Suspense>
        <FeaturedCities />
        <MemberCTA />
        <BusinessCTA />
      </div>
    </main>
  );
}