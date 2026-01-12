"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteVenue } from "@/actions/venue-management";

export default function MyVenuesPage() {
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/admin/venues?status=ALL"); // Reuse admin API? No, insecure if it lists all.
            // We need a way to list MY venues.
            // The admin API checks for ADMIN role.
            // We should create a quick API or just fetch client side if we had an endpoint.
            // Actually, let's use a server component ideally, but I'm writing client code here.
            // I'll create a dedicated API /api/business/venues or just fetch from an action? 
            // For now, let's use a new endpoint or the standard venues endpoint with filter?
            // Standard /api/venues is PUBLIC and lists approved only.
            // Business needs to see PENDING/REJECTED too.

            // I will create a new API route: /api/business/my-venues
            const res2 = await fetch("/api/business/my-venues");
            const data = await res2.json().catch(() => ({}));
            setVenues(data.venues || []);
            setLoading(false);
        })();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this venue? This cannot be undone.")) return;

        const res = await deleteVenue(id);
        if (res.success) {
            setVenues(venues.filter(v => v.id !== id));
        } else {
            alert("Error deleting venue");
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">My Venues</h1>
                    <p className="text-white/60">Manage your listings.</p>
                </div>
                <Link href="/business/add-venue" className="bg-white text-black px-4 py-2 rounded-xl font-bold hover:bg-zinc-200">
                    + Create Venue
                </Link>
            </div>

            {loading && <div className="text-white/50">Loading...</div>}

            {!loading && venues.length === 0 && (
                <div className="text-white/50 bg-white/5 p-8 rounded-2xl text-center">
                    You haven't created any venues yet.
                </div>
            )}

            <div className="grid gap-4">
                {venues.map((v) => (
                    <div key={v.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">{v.name}</h2>
                            <div className="text-white/60 text-sm mt-1">{v.city} • {v.category}</div>
                            <div className="mt-2 flex gap-2">
                                <span className={`text-xs px-2 py-1 rounded border ${v.status === 'APPROVED' ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' :
                                        v.status === 'PENDING' ? 'border-yellow-500/30 text-yellow-300 bg-yellow-500/10' :
                                            'border-red-500/30 text-red-300 bg-red-500/10'
                                    }`}>
                                    {v.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={`/venue/${v.id}`} className="text-white/70 hover:text-white underline text-sm">View</Link>
                            <Link href={`/business/edit-venue/${v.id}`} className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 font-medium">
                                Edit
                            </Link>
                            <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300 px-3">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
