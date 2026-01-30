"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteVenue } from "@/actions/venue-management";

import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function MyVenuesPage() {
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null); // Track ID to delete
    const router = useRouter();

    useEffect(() => {
        (async () => {
            // Add timestamp to prevent browser caching
            const res = await fetch(`/api/business/my-venues?t=${Date.now()}`);
            const data = await res.json().catch(() => ({}));
            setVenues(data.venues || []);
            setLoading(false);
            router.refresh(); // Sync server components
        })();
    }, []);

    async function confirmDelete() {
        if (!deleteId) return;
        const res = await deleteVenue(deleteId);
        if (res.success) {
            setVenues(venues.filter(v => v.id !== deleteId));
        } else {
            alert("Error deleting venue");
        }
        setDeleteId(null);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Venue?"
                message="Are you sure you want to delete this venue? This action cannot be undone and all data will be lost."
                confirmLabel="Delete Forever"
                isDestructive={true}
            />

            <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">My Venues</h1>
                    <p className="text-white/60 mt-2 text-lg">Manage your active listings and track their status.</p>
                </div>
                <Link
                    href="/business/add-venue"
                    className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20"
                >
                    <span>+ Create Venue</span>
                </Link>
            </div>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/10" />
                    ))}
                </div>
            )}

            {!loading && venues.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">🏠</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">No venues yet</h3>
                    <p className="text-white/50 mt-1 mb-6">Start by creating your first venue listing.</p>
                    <Link href="/business/add-venue" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                        Create Venue &rarr;
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((v) => (
                    <div key={v.id} className="group relative bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col justify-between gap-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:translate-y-[-4px] hover:shadow-xl">

                        {/* Header */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <span className={`text-[10px] px-2 py-1 rounded-full border tracking-wide font-bold uppercase ${v.status === 'APPROVED' ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' :
                                    v.status === 'PENDING' ? 'border-amber-500/30 text-amber-300 bg-amber-500/10' :
                                        'border-red-500/30 text-red-300 bg-red-500/10'
                                    }`}>
                                    {v.status}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setDeleteId(v.id)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">{v.name}</h2>
                                <div className="text-white/50 text-sm mt-1 font-medium">{typeof v.city === 'object' ? v.city?.name : v.city} • {v.category || "Venue"}</div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 border-t border-white/5 flex items-center gap-2 mt-2">
                            <Link
                                href={v.status === 'DRAFT' ? `/business/add-venue?id=${v.id}` : `/business/edit-venue/${v.id}`}
                                className="flex-1 text-center bg-white/10 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-500 hover:text-white transition-all"
                            >
                                {v.status === 'DRAFT' ? 'Continue Draft' : 'Edit Details'}
                            </Link>
                            <Link
                                href={`/venue/${v.id}`}
                                className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors"
                            >
                                Preview
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
