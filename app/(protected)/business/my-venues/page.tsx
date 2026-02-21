"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteVenue, updateVenueStatus } from "@/actions/venue-management";

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

    async function handleStatusChange(id: string, newStatus: string) {
        const res = await updateVenueStatus(id, newStatus);
        if (res.success) {
            setVenues(venues.map(v => v.id === id ? { ...v, status: newStatus } : v));
            router.refresh();
        } else {
            alert("Error updating status");
        }
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
                    <div key={v.id} className="group relative bg-white/5 border border-white/10 rounded-3xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:translate-y-[-4px] hover:shadow-xl">

                        {/* Image / Header Area */}
                        <div className="relative h-48 w-full bg-white/5">
                            {v.coverImageUrl ? (
                                <img
                                    src={v.coverImageUrl}
                                    alt={v.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                    <span className="text-4xl opacity-20">🏠</span>
                                </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4">
                                <span className={`text-[10px] px-2 py-1 rounded-full border tracking-wide font-bold uppercase backdrop-blur-md shadow-sm ${v.status === 'APPROVED' ? 'border-emerald-500/30 text-emerald-200 bg-emerald-500/40' :
                                        v.status === 'PENDING' ? 'border-amber-500/30 text-amber-200 bg-amber-500/40' :
                                            'border-white/20 text-white/80 bg-white/10'
                                    }`}>
                                    {v.status}
                                </span>
                            </div>

                            {/* Delete Action */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.preventDefault(); setDeleteId(v.id); }}
                                    className="p-2 bg-black/40 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-all"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 flex flex-col gap-4 flex-1 -mt-2 relative">
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">{v.name}</h2>
                                <div className="text-white/50 text-sm mt-1 font-medium">{typeof v.city === 'object' ? v.city?.name : v.city} • {v.category || "Venue"}</div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 border-t border-white/5 space-y-2 mt-auto">
                                <div className="flex items-center gap-2">
                                    {v.status === 'PENDING' ? (
                                        <button disabled className="flex-1 text-center bg-white/5 text-white/30 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed">
                                            Processing...
                                        </button>
                                    ) : (
                                        <Link
                                            href={v.status === 'DRAFT' ? `/business/add-venue?id=${v.id}` : `/business/edit-venue/${v.id}`}
                                            className="flex-1 text-center bg-white/10 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-500 hover:text-white transition-all"
                                        >
                                            {v.status === 'DRAFT' ? 'Continue Draft' : 'Edit Details'}
                                        </Link>
                                    )}
                                    <Link
                                        href={`/venue/${v.id}`}
                                        className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors"
                                    >
                                        Preview
                                    </Link>
                                </div>

                                {v.status === 'DRAFT' && (
                                    <button
                                        onClick={() => handleStatusChange(v.id, 'PENDING')}
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white border border-indigo-500/30 transition-all"
                                    >
                                        Submit for Review
                                    </button>
                                )}

                                {v.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleStatusChange(v.id, 'DRAFT')}
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white border border-amber-500/30 transition-all"
                                    >
                                        Back to Draft (Edit)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
