"use client";

import { useState } from "react";
import { updateVenueStep } from "@/actions/venue";
import { useRouter } from "next/navigation";
import { CheckCircle, MapPin, Phone, Clock, FileText } from "lucide-react";

export default function PreviewStep({ venueId, onBack, initialData }: { venueId: string, onBack: () => void, initialData: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const data = initialData || {};

    async function handlePublish() {
        if (!confirm("Are you ready to submit your venue for review?")) return;

        setIsLoading(true);

        // Update status to PENDING (or APPROVED for testing)
        // Check `VenueStatus` enum: DRAFT, PENDING, APPROVED, REJECTED, SUSPENDED
        const res = await updateVenueStep(venueId, {
            status: "PENDING"
        });

        if (res?.success) {
            // Redirect to dashboard or success page
            router.push("/business/dashboard?success=venue-submitted");
        } else {
            alert(res?.error || "Failed to submit venue.");
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Step 5: Review & Publish</h2>
                <p className="text-zinc-400">Review your information before submitting.</p>
            </div>

            <div className="space-y-6">
                {/* Visual Header Preview */}
                <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden bg-zinc-800">
                    {data.media && data.media.length > 0 ? (
                        <img src={data.media[0].url} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">No Cover Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{data.name}</h1>
                            {data.tagline && <p className="text-zinc-300 text-lg">{data.tagline}</p>}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-800/50 p-6 rounded-xl border border-white/5 space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" /> Basic Info
                        </h3>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p><span className="text-zinc-500">Category:</span> {data.category}</p>
                            <p><span className="text-zinc-500">Description:</span> {data.description || "N/A"}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-800/50 p-6 rounded-xl border border-white/5 space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-400" /> Location
                        </h3>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p>{data.address}</p>
                            <p>{data.city} {data.neighborhood && `, ${data.neighborhood}`}</p>
                            {data.locationUrl && (
                                <a href={data.locationUrl} target="_blank" className="text-indigo-400 hover:underline">View on Map</a>
                            )}
                        </div>
                    </div>

                    <div className="bg-zinc-800/50 p-6 rounded-xl border border-white/5 space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-400" /> Operations
                        </h3>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p><span className="text-zinc-500">Hours:</span> {data.openingHours || "Not specified"}</p>
                            <p><span className="text-zinc-500">Phone:</span> {data.phone || "N/A"}</p>
                            <p><span className="text-zinc-500">Website:</span> {data.website || "N/A"}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-800/50 p-6 rounded-xl border border-white/5 space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-indigo-400" /> Policies
                        </h3>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p><span className="text-zinc-500">Dress Code:</span> {data.dressCode || "Not specified"}</p>
                            <p><span className="text-zinc-500">Age Policy:</span> {data.agePolicy || "Not specified"}</p>
                            <p><span className="text-zinc-500">Parking:</span> {data.parkingAvailable ? "Yes" : "No"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <button onClick={onBack} disabled={isLoading} className="text-zinc-400 hover:text-white px-4 py-2">
                    Back
                </button>
                <button onClick={handlePublish} disabled={isLoading} className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50">
                    {isLoading ? "Submitting..." : "Submit Venue"}
                </button>
            </div>
        </div>
    );
}
