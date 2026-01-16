"use client";

import Link from "next/link";

const cities = [
    { name: "Marrakech", code: "Marrakech", image: "/home/cities/marrakech.png", label: "The Red City" },
    { name: "Casablanca", code: "Casablanca", image: "/home/cities/casablanca.png", label: "Modern Metropolis" },
    { name: "Tangier", code: "Tangier", image: "/home/cities/tangier.png", label: "Gateway to Europe" },
    { name: "Rabat", code: "Rabat", image: "/home/cities/rabat.png", label: "Coastal Capital" },
];

export default function FeaturedCities() {
    return (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
                        Explore by City
                    </h2>
                    <p className="text-white/60">
                        Discover the unique nightlife and culture of Morocco's top destinations.
                    </p>
                </div>
                <Link href="/explore" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors whitespace-nowrap">
                    View all cities →
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cities.map((city) => (
                    <Link
                        key={city.name}
                        href={`/explore?city=${city.code}`}
                        className="group relative h-80 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                    >
                        <img
                            src={city.image}
                            alt={city.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                            <p className="text-white/70 text-sm">{city.label}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
