"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";

interface VenueCardProps {
    id: string;
    name: string;
    city: string;
    category: string;
    rating?: number;
    imageUrl?: string;
    ambiance?: string;
    cuisine?: string;
}

export default function VenueCard({ id, name, city, category, rating, imageUrl, ambiance, cuisine }: VenueCardProps) {
    return (
        <Link href={`/venue/${id}`} className="group block h-full">
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl hover:border-white/20">
                {/* Image Container */}
                <div className="relative aspect-[20/19] w-full overflow-hidden bg-white/5">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/20 bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                            <span className="text-4xl text-white/10 font-bold">AGORA</span>
                        </div>
                    )}

                    {/* Badge overlay */}
                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center rounded-lg bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/10">
                            {category}
                        </span>
                    </div>
                    {rating && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-xs font-medium backdrop-blur-md border border-white/10 text-white">
                            <span>★</span> {rating}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{name}</h3>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/60">
                        <span>{city}</span>
                        {(ambiance || cuisine) && <span>•</span>}
                        {ambiance && <span className="text-indigo-400 font-medium">{ambiance}</span>}
                        {cuisine && <span className="text-purple-400 font-medium">{cuisine}</span>}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-white/50 group-hover:text-white/70">
                        <span className="font-semibold text-white">Réserver</span>
                        <span>→</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
