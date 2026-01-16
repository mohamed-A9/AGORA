"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Store, Trash2, MapPin, Plus, Clock } from "lucide-react";
import { deleteEvent } from "@/actions/event";

export default function BusinessEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const res = await fetch("/api/business/events");
        const data = await res.json().catch(() => ({}));
        setEvents(Array.isArray(data?.events) ? data.events : []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    async function handleDelete(id: string, venueId: string) {
        if (!confirm("Voulez-vous vraiment supprimer cet événement ?")) return;
        const res = await deleteEvent(id);
        if (res.success) {
            load();
        } else {
            alert(res.error || "Erreur lors de la suppression");
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Special Nights</h1>
                    <p className="text-white/60 mt-2 text-lg">
                        {loading ? "Chargement..." : `Gérez vos ${events.length} événement(s) à travers tous vos établissements.`}
                    </p>
                </div>

                <Link
                    href="/business/my-venues"
                    className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-all hover:translate-y-[-2px] shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nouvel Événement</span>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-3xl bg-white/5 border border-white/10" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm px-4 text-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
                        <Calendar className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Aucun événement prévu</h3>
                    <p className="text-white/50 mt-2 mb-8 max-w-md">Créez des événements spéciaux pour attirer plus de clients dans vos établissements.</p>
                    <Link href="/business/my-venues" className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors">
                        Gérer mes lieux
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((ev) => (
                        <div key={ev.id} className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl">
                            {/* Media Preview if exists */}
                            <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden relative">
                                <img src={ev.media?.[0]?.url || "/logo.png"} alt={ev.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{ev.type || "Event"}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(ev.id, ev.venueId)}
                                    className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 flex flex-col flex-1">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{ev.name}</h3>
                                    <div className="flex items-center gap-2 text-white/40 text-sm">
                                        <Store className="w-3.5 h-3.5" />
                                        <span>{ev.venue.name} • {ev.venue.city}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 py-4 border-y border-white/5">
                                    <div className="flex items-center gap-3 text-white/70">
                                        <Calendar className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm font-semibold">{new Date(ev.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/50">
                                        <Clock className="w-4 h-4 text-white/30" />
                                        <span className="text-xs">{ev.startTime || "N/A"} - {ev.endTime || "N/A"}</span>
                                    </div>
                                </div>

                                <div className="pt-2 mt-auto">
                                    <Link
                                        href={`/business/edit-venue/${ev.venueId}`}
                                        className="w-full flex items-center justify-center gap-2 bg-white/5 text-white py-3 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        Modifier le lieu
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
