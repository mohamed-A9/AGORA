import Link from "next/link";
import Hero from "@/components/Hero";
import CategoryDiscovery from "@/components/home/CategoryDiscovery";
import FeaturedCities from "@/components/home/FeaturedCities";
import BusinessCTA from "@/components/home/BusinessCTA";
import MemberCTA from "@/components/home/MemberCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent overflow-x-hidden">
      <Hero />

      {/* Dynamic Background Wrapper for sections */}
      <div className="relative z-10 space-y-12">
        <CategoryDiscovery />
        <FeaturedCities />
        <MemberCTA />
        <BusinessCTA />
      </div>
    </main>
  );
}

