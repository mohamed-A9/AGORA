"use client";

import { useState } from "react";
import { updateVenueStep } from "@/actions/venue";
import { useRouter } from "next/navigation";
import { CheckCircle, MapPin, Phone, Clock, FileText, X } from "lucide-react";
import Toast from "@/components/Toast";

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-zinc-900 border-2 border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Ready to Submit?</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Your venue will be submitted for review. Our team will verify the information and approve it within 24-48 hours.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors"
                    >
                        Submit Venue
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PreviewStep({ venueId, onBack, initialData }: { venueId: string, onBack: () => void, initialData: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: "success" | "error" | "info" } | null>(null);
    const data = initialData || {};

    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
    };

    async function handlePublish() {
        console.log("DEBUG: handlePublish called for venueId:", venueId);

        setShowConfirm(false);
        setIsLoading(true);

        const res = await updateVenueStep(venueId, {
            status: "PENDING"
        });

        console.log("DEBUG: updateVenueStep response:", res);

        if (res?.success) {
            // Clear local storage draft
            localStorage.removeItem("agora_wizard_step");
            localStorage.removeItem("agora_wizard_venue_id");
            localStorage.removeItem("agora_wizard_data");

            showToast("Venue submitted successfully! Redirecting...", "success");

            // Redirect after showing success message
            setTimeout(() => {
                router.push("/business/my-venues?success=venue-submitted");
                router.refresh();
            }, 1500);
        } else {
            showToast(res?.error || "Failed to submit venue. Please try again.", "error");
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {showConfirm && (
                <ConfirmModal
                    onConfirm={handlePublish}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

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
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isLoading}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Submitting..." : "Submit Venue"}
                </button>
            </div>
        </div>
    );
}
