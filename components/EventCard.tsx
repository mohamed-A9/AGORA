"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

interface EventCardProps {
    id: string;
    name: string;
    date: Date | string;
    startTime?: string;
    venueName: string;
    city: string;
    imageUrl?: string;
    category?: string;
}

export default function EventCard({ id, name, date, startTime, venueName, city, imageUrl, category }: EventCardProps) {
    const eventDate = new Date(date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('en-US', { month: 'short' });

    return (
        <Link href={`/events/${id}`} className="group block h-full">
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
                            <Calendar size={48} className="text-white/10" />
                        </div>
                    )}

                    {/* Date Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 text-black rounded-lg px-2.5 py-1.5 flex flex-col items-center leading-none min-w-[50px] shadow-lg">
                        <span className="text-xs font-bold uppercase text-black/60">{month}</span>
                        <span className="text-lg font-extrabold">{day}</span>
                    </div>

                    {/* Category Badge */}
                    {category && (
                        <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center rounded-lg bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/10">
                                {category}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-tight">{name}</h3>
                    </div>

                    <div className="mt-2 text-sm text-indigo-400 font-medium">
                        @{venueName}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm text-white/50">
                        <span>{city}</span>
                        {startTime && (
                            <>
                                <span>•</span>
                                <span>{startTime}</span>
                            </>
                        )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white">
                        <span>Get Tickets</span>
                        <span>→</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
