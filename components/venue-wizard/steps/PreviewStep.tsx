"use client";

import { useState } from "react";
import { updateVenueStep, launchVenue } from "@/actions/venue";
import { useRouter } from "next/navigation";
import { CheckCircle, MapPin, Phone, Clock, FileText, X, Rocket, AlertTriangle, Loader2 } from "lucide-react";
import Toast from "@/components/Toast";

function ConfirmModal({ onConfirm, onCancel, title, message, confirmLabel, isDestructive = false }:
    { onConfirm: () => void, onCancel: () => void, title: string, message: string, confirmLabel: string, isDestructive?: boolean }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
            <div className={`bg-zinc-900 border-2 ${isDestructive ? 'border-red-500/20' : 'border-white/10'} rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4`}>
                <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-xl ${isDestructive ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                        {isDestructive ? <AlertTriangle className="w-8 h-8 text-red-400" /> : <CheckCircle className="w-8 h-8 text-emerald-400" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">{message}</p>
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
                        className={`flex-1 px-4 py-3 ${isDestructive ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white rounded-lg font-bold transition-colors`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PreviewStep({ venueId, onBack, initialData }: { venueId: string, onBack: () => void, initialData: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void, confirmLabel: string, isDestructive?: boolean } | null>(null);
    const [toast, setToast] = useState<{ message: string, type: "success" | "error" | "info" } | null>(null);
    const data = initialData || {};

    const status = data.status || "DRAFT"; // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, LIVE

    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
    };

    // 1. Submit for Approval (Draft -> Pending)
    async function handlePublish() {
        setModalConfig(null);
        setIsLoading(true);

        const res = await updateVenueStep(venueId, {
            status: "PENDING_APPROVAL"
        });

        if (res?.success) {
            localStorage.removeItem("agora_wizard_step");
            localStorage.removeItem("agora_wizard_venue_id");
            localStorage.removeItem("agora_wizard_data");

            showToast("Venue submitted successfully! Awaiting approval.", "success");
            // Reload to update UI state or redirect
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showToast(res?.error || "Failed to submit venue.", "error");
            setIsLoading(false);
        }
    }

    // 2. Launch to Live (Approved -> Live)
    async function handleLaunch() {
        setModalConfig(null);
        setIsLoading(true);

        const res = await launchVenue(venueId);

        if (res?.success) {
            showToast("Venue is LIVE on Agora!", "success");
            setTimeout(() => {
                router.push("/business/dashboard?success=launched");
            }, 1500);
        } else {
            showToast(res?.error || "Failed to launch venue.", "error");
            setIsLoading(false);
        }
    }

    // 3. Retract Submission / Edit after Rejection (Pending/Rejected -> Draft)
    async function handleRetract() {
        setModalConfig(null);
        setIsLoading(true);

        const res = await updateVenueStep(venueId, {
            status: "DRAFT"
        });

        if (res?.success) {
            showToast("Venue returned to Draft. You can now edit.", "success");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast(res?.error || "Failed to update status.", "error");
            setIsLoading(false);
        }
    }

    // --- Render Logic Based on Status ---

    // 1. PENDING APPROVAL VIEW
    if (status === 'PENDING_APPROVAL') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping opacity-75"></div>
                    <Clock className="w-12 h-12 text-amber-500 relative z-10" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white mb-3">Submission Under Review</h2>
                    <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                        Your venue has been submitted and is currently being reviewed by our administrators.
                        You will be notified once a decision is made.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => router.push('/business/dashboard')} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors">
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => setModalConfig({
                            isOpen: true,
                            title: "Retract Submission?",
                            message: "This will remove your venue from the review queue and return it to draft mode for editing.",
                            confirmLabel: "Retract & Edit",
                            onConfirm: handleRetract
                        })}
                        className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Retract Submission
                    </button>
                </div>

                {modalConfig?.isOpen && <ConfirmModal {...modalConfig} onCancel={() => setModalConfig(null)} />}
            </div>
        );
    }

    // 2. APPROVED VIEW (Ready to Launch)
    if (status === 'APPROVED') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white mb-3">Venue Approved!</h2>
                    <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                        Congratulations! Your venue has been approved and is ready to go public.
                        Click below to launch it on Agora.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => router.push('/business/dashboard')} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors">
                        Wait, not yet
                    </button>
                    <button
                        onClick={() => setModalConfig({
                            isOpen: true,
                            title: "Launch Venue?",
                            message: "Your venue will be visible to all users on Agore. Are you sure you are ready?",
                            confirmLabel: "Launch Now",
                            onConfirm: handleLaunch
                        })}
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-400 text-white font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <Rocket className="w-5 h-5" />
                        {isLoading ? "Launching..." : "Launch Now"}
                    </button>
                </div>

                {modalConfig?.isOpen && <ConfirmModal {...modalConfig} onCancel={() => setModalConfig(null)} />}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        );
    }

    // 3. REJECTED VIEW
    if (status === 'REJECTED') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white mb-3">Submission Rejected</h2>
                    <p className="text-zinc-400 max-w-md mx-auto leading-relaxed mb-4">
                        Unfortunately, your venue submission was not approved.
                    </p>
                    {data.rejectionReason && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-200 text-sm max-w-md mx-auto">
                            <strong>Reason:</strong> {data.rejectionReason}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button onClick={() => router.push('/business/dashboard')} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors">
                        Back to Dashboard
                    </button>
                    <button
                        onClick={handleRetract}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                    >
                        Edit & Resubmit
                    </button>
                </div>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        );
    }


    // 4. DRAFT VIEW (Existing Preview Logic)
    return (
        <div className="space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {modalConfig?.isOpen && (
                <ConfirmModal
                    {...modalConfig}
                    onCancel={() => setModalConfig(null)}
                />
            )}

            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Step 5: Review & Publish</h2>
                <p className="text-zinc-400">Review your information before submitting.</p>
            </div>

            <div className="space-y-6 opacity-100 transition-opacity">
                {/* Visual Header Preview */}
                <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden bg-zinc-800 border border-white/5">
                    {data.media && data.media.length > 0 ? (
                        <img src={data.media[0].url} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">No Cover Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-8">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2">{data.name}</h1>
                            {data.tagline && <p className="text-zinc-300 text-lg font-medium">{data.tagline}</p>}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-800/30 p-6 rounded-2xl border border-white/5 space-y-4 hover:bg-zinc-800/50 transition-colors">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" /> Basic Info
                        </h3>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">Category</span> {data.category}</p>
                            <p><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1 mt-3">Description</span> {data.description || "N/A"}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-800/30 p-6 rounded-2xl border border-white/5 space-y-4 hover:bg-zinc-800/50 transition-colors">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-400" /> Location
                        </h3>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p className="font-medium text-white">{data.address}</p>
                            <p>{data.city} {data.neighborhood && `, ${data.neighborhood}`}</p>
                            {data.locationUrl && (
                                <a href={data.locationUrl} target="_blank" className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-wider mt-2 inline-block">
                                    View on Map →
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-zinc-800/30 p-6 rounded-2xl border border-white/5 space-y-4 hover:bg-zinc-800/50 transition-colors">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-400" /> Operations
                        </h3>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">Hours</span> {data.openingHours || "Not specified"}</p>
                            <p><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1 mt-3">Contact</span> {data.phone || "N/A"}</p>
                            {data.website && <a href={data.website} target="_blank" className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-wider mt-2 inline-block">Visit Website →</a>}
                        </div>
                    </div>

                    <div className="bg-zinc-800/30 p-6 rounded-2xl border border-white/5 space-y-4 hover:bg-zinc-800/50 transition-colors">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-indigo-400" /> Policies
                        </h3>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">Dress Code</span> {data.dressCode || "Any"}</div>
                                <div><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">Age</span> {data.agePolicy || "All Ages"}</div>
                                <div><span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">Parking</span> {data.parkingAvailable ? "Yes" : "No"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-white/5">
                <button onClick={onBack} disabled={isLoading} className="text-zinc-400 hover:text-white px-4 py-2 font-medium transition-colors">
                    Back
                </button>
                <button
                    onClick={() => setModalConfig({
                        isOpen: true,
                        title: "Ready to Submit?",
                        message: "Your venue will be submitted for review. You won't be able to edit it until it's approved or rejected.",
                        confirmLabel: "Submit for Review",
                        onConfirm: handlePublish
                    })}
                    disabled={isLoading}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-500/20"
                >
                    {isLoading ? "Submitting..." : "Submit Venue"}
                </button>
            </div>
        </div>
    );
}
