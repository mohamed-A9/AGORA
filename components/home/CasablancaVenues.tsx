import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MainCategory } from "@prisma/client";

const CATEGORIES = [
  { value: "CAFE" as MainCategory, label: "Cafes & Coffee", icon: "☕", color: "from-amber-500/20 to-amber-600/5", border: "border-amber-500/20", badge: "bg-amber-500/20 text-amber-300" },
  { value: "RESTAURANT" as MainCategory, label: "Restaurants", icon: "🍽️", color: "from-orange-500/20 to-orange-600/5", border: "border-orange-500/20", badge: "bg-orange-500/20 text-orange-300" },
  { value: "NIGHTLIFE_BARS" as MainCategory, label: "Nightlife & Bars", icon: "🍸", color: "from-purple-500/20 to-purple-600/5", border: "border-purple-500/20", badge: "bg-purple-500/20 text-purple-300" },
  { value: "EVENTS" as MainCategory, label: "Evenements", icon: "🎉", color: "from-blue-500/20 to-blue-600/5", border: "border-blue-500/20", badge: "bg-blue-500/20 text-blue-300" },
  { value: "WELLNESS_HEALTH" as MainCategory, label: "Hotels & Spas", icon: "🧖", color: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20", badge: "bg-emerald-500/20 text-emerald-300" },
  { value: "ACTIVITIES_FUN" as MainCategory, label: "Co-working", icon: "💻", color: "from-yellow-500/20 to-yellow-600/5", border: "border-yellow-500/20", badge: "bg-yellow-500/20 text-yellow-300" },
];

const PRICE = ["", "MAD", "MAD MAD", "MAD MAD MAD", "MAD MAD MAD MAD", "💎"];

async function getVenuesByCategory(category: MainCategory) {
  return prisma.venue.findMany({
    where: {
      mainCategory: category,
      isActive: true,
      status: "APPROVED",
      city: { slug: "casablanca" },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      address: true,
      rating: true,
      numReviews: true,
      priceLevel: true,
      coverImageUrl: true,
    },
    orderBy: { rating: "desc" },
    take: 4,
  });
}

export default async function CasablancaVenues() {
  const allVenues = await Promise.all(
    CATEGORIES.map(async (cat) => ({
      ...cat,
      venues: await getVenuesByCategory(cat.value),
    }))
  );

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Casablanca
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
            Les meilleurs endroits
          </h2>
          <p className="text-white/50 max-w-lg">
            Decouvrez les venues incontournables de Casablanca, organisees par categorie.
          </p>
        </div>
        <Link href="/explore?city=Casablanca" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors whitespace-nowrap text-sm">
          Tout explorer →
        </Link>
      </div>

      <div className="space-y-16">
        {allVenues.map((cat) => (
          <div key={cat.value}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="text-xl font-bold text-white">{cat.label}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cat.badge}`}>
                  {cat.venues.length} spots
                </span>
              </div>
              <Link href={`/explore?category=${cat.value}&city=Casablanca`} className="text-white/40 hover:text-white/70 transition-colors text-sm font-medium">
                Voir tout →
              </Link>
            </div>
            {cat.venues.length === 0 ? (
              <div className="text-white/30 text-sm italic">Aucune venue disponible.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {cat.venues.map((venue) => (
                  <Link
                    key={venue.id}
                    href={`/venue/${venue.slug}`}
                    className={`group relative rounded-2xl overflow-hidden border ${cat.border} bg-gradient-to-b ${cat.color} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300`}
                  >
                    <div className="relative h-44 overflow-hidden">
                      {venue.coverImageUrl ? (
                        <Image
                          src={venue.coverImageUrl}
                          alt={venue.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl">
                          {cat.icon}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {venue.rating > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white">
                          ⭐ {venue.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-1">
                        {venue.name}
                      </h4>
                      {venue.address && (
                        <p className="text-white/40 text-xs line-clamp-1 mb-3">
                          📍 {venue.address}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-white/30 text-xs font-medium">
                          {venue.numReviews > 0 ? `${venue.numReviews} avis` : "Nouveau"}
                        </span>
                        {venue.priceLevel && (
                          <span className="text-white/50 text-xs">
                            {PRICE[venue.priceLevel] || ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
