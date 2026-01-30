"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Steps
import BasicsStep from "./steps/BasicsStep";
import LocationStep from "./steps/LocationStep";
import DetailsStep from "./steps/DetailsStep";
import MediaStep from "./steps/MediaStep";
import PreviewStep from "./steps/PreviewStep";
import ExperienceStep from "./steps/ExperienceStep";
import FloorPlanStep from "./steps/FloorPlanStep";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function VenueWizard({ initialId }: { initialId?: string | null }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [venueId, setVenueId] = useState<string | null>(initialId || null);
    const [draftData, setDraftData] = useState<any>({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, onConfirm: () => void }>({ isOpen: false, onConfirm: () => { } });

    // Load initialization data
    useEffect(() => {
        const loadDraft = async () => {
            const targetId = initialId || localStorage.getItem("agora_wizard_venue_id");
            console.log("🔍 [LoadDraft] Starting...");
            console.log("   - targetId:", targetId);
            console.log("   - initialId:", initialId);

            if (targetId) {
                try {
                    console.log("   📡 Fetching venue from API:", targetId);
                    const res = await fetch(`/api/venues/${targetId}`);
                    const data = await res.json();

                    console.log("   📦 API Response status:", res.status);
                    console.log("   📦 API Response data:", data);

                    if (data.venue) {
                        const v = data.venue;
                        const mappedData = {
                            ...v,
                            category: v.mainCategory,
                            subcategory: v.subcategories?.[0]?.subcategory?.name || v.subcategories?.[0]?.subcategory?.code,
                            media: v.gallery?.map((m: any) => ({ url: m.url, type: m.kind })),
                            city: v.city?.name || v.city
                        };
                        setDraftData(mappedData);
                        setVenueId(targetId);
                        console.log("   ✅ Loaded venue from DB:", v.name);

                        // Restore wizard step from DB (prioritize DB over localStorage)
                        if (!initialId) {
                            const dbStep = v.wizardStep;
                            const savedStep = localStorage.getItem("agora_wizard_step");

                            if (dbStep && dbStep > 1) {
                                setStep(dbStep);
                                console.log("   ✅ Restored step from DB:", dbStep);
                            } else if (savedStep) {
                                setStep(parseInt(savedStep));
                                console.log("   ✅ Restored step from localStorage:", savedStep);
                            }
                        }
                    } else if (data.error === "NOT_FOUND" || res.status === 404) {
                        // Stale ID! Clear everything.
                        console.warn("   ⚠️ Draft venue not found in DB (stale ID)");
                        console.log("   🗑️ Clearing stale data...");
                        setVenueId(null);
                        setDraftData({}); // CRITICAL: Clear draftData so .id is removed!
                        localStorage.removeItem("agora_wizard_venue_id");
                        localStorage.removeItem("agora_wizard_step");
                        localStorage.removeItem("agora_wizard_data");
                        console.log("   ✅ Stale data cleared. Ready for fresh start.");
                    }
                } catch (err) {
                    console.error("   ❌ Error loading draft venue:", err);
                }
            } else {
                console.log("   ℹ️ No targetId found");
                // No ID at all, check if there's any orphaned data in localStorage
                const savedData = localStorage.getItem("agora_wizard_data");
                const savedStep = localStorage.getItem("agora_wizard_step");

                console.log("   📦 localStorage data:", savedData);
                console.log("   📍 localStorage step:", savedStep);

                if (savedData) {
                    try {
                        const parsedData = JSON.parse(savedData);
                        setDraftData(parsedData);
                        console.log("   ✅ Restored from localStorage:", parsedData);
                    } catch (e) {
                        console.error("   ❌ Failed to parse saved data:", e);
                    }
                }

                if (savedStep) {
                    setStep(parseInt(savedStep));
                    console.log("   ✅ Restored step from localStorage:", savedStep);
                }
            }

            console.log("   ✅ setIsLoaded(true)");
            setIsLoaded(true);
        };

        loadDraft();
    }, [initialId]);

    // CREATE EMPTY DRAFT IMMEDIATELY IF NO VENUE ID EXISTS
    useEffect(() => {
        const createEmptyDraftIfNeeded = async () => {
            console.log("🔄 [CreateEmptyDraft] Effect triggered");
            console.log("   - isLoaded:", isLoaded);
            console.log("   - venueId:", venueId);
            console.log("   - initialId:", initialId);

            // Wait for initial load to complete
            if (!isLoaded) {
                console.log("   ⏸️ Waiting for initial load to complete...");
                return;
            }

            // Skip if we already have a venueId (from URL or localStorage or DB)
            if (venueId) {
                console.log("   ✅ Venue ID already exists:", venueId);
                return;
            }

            // Skip if initialId was provided (editing existing)
            if (initialId) {
                console.log("   ⏭️ InitialId provided, skipping draft creation");
                return;
            }

            console.log("🆕 No venue ID found. Creating empty draft...");

            try {
                const res = await fetch('/api/venues/create-empty-draft', {
                    method: 'POST'
                });

                console.log("   📡 API Response status:", res.status);

                const data = await res.json();
                console.log("   📦 API Response data:", data);

                if (data.success && data.venueId) {
                    console.log("   ✅ Empty draft created with ID:", data.venueId);

                    // Save to state
                    setVenueId(data.venueId);

                    // Save to localStorage
                    localStorage.setItem("agora_wizard_venue_id", data.venueId);
                    localStorage.setItem("agora_wizard_step", "1");

                    // Update URL so refresh works
                    window.history.replaceState(null, "", `?id=${data.venueId}`);

                    console.log("   ✅ Empty draft ready. User can now type and auto-save!");
                } else {
                    console.error("   ❌ Failed to create empty draft:", data.error);
                }
            } catch (err) {
                console.error("   ❌ Error creating empty draft:", err);
            }
        };

        createEmptyDraftIfNeeded();
    }, [isLoaded, venueId, initialId]);


    // Save to LocalStorage on change
    useEffect(() => {
        if (!isLoaded) return; // Don't save initial default values overwriting storage
        localStorage.setItem("agora_wizard_step", step.toString());
        if (venueId) localStorage.setItem("agora_wizard_venue_id", venueId);
        localStorage.setItem("agora_wizard_data", JSON.stringify(draftData));
    }, [step, venueId, draftData, isLoaded]);

    const handleNext = (data: any) => {
        const newData = { ...draftData, ...data };
        setDraftData(newData);

        // CRITICAL: Extract venueId from Step 1 if it was just created
        if (data.id && !venueId) {
            console.log("📍 Setting venueId from Step 1:", data.id);
            setVenueId(data.id);
            localStorage.setItem("agora_wizard_venue_id", data.id);
        }

        // Immediate save to localStorage
        localStorage.setItem("agora_wizard_data", JSON.stringify(newData));
        console.log("✅ Saved to localStorage (handleNext):", newData);

        setStep((s) => {
            const newStep = s + 1;
            localStorage.setItem("agora_wizard_step", newStep.toString());

            // Save step to database if we have a venueId
            const currentVenueId = data.id || venueId;
            if (currentVenueId) {
                fetch(`/api/venues/${currentVenueId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wizardStep: newStep })
                }).catch(err => console.error("Failed to save wizard step:", err));
            }

            return newStep;
        });
    };

    const handleBack = () => {
        // Smart Back Logic
        if (step === 7 && draftData.reservationType === 'simple') {
            setStep((s) => {
                const newStep = 5; // Directly set to 5
                // Save step to database if we have a venueId
                if (venueId) {
                    fetch(`/api/venues/${venueId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ wizardStep: newStep })
                    }).catch(err => console.error("Failed to save wizard step:", err));
                }
                return newStep;
            });
        } else {
            setStep((s) => {
                const newStep = s - 1;

                // Save step to database if we have a venueId
                if (venueId) {
                    fetch(`/api/venues/${venueId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ wizardStep: newStep })
                    }).catch(err => console.error("Failed to save wizard step:", err));
                }

                return newStep;
            });
        }
    };

    const handleDataChange = (data: any) => {
        const newData = { ...draftData, ...data };
        setDraftData(newData);

        // Immediate save to localStorage
        localStorage.setItem("agora_wizard_data", JSON.stringify(newData));
        console.log("✅ Saved to localStorage (handleDataChange):", newData);
    };

    if (!isLoaded) return null; // Prevent hydration mismatch / flash

    return (
        <div className="mx-auto max-w-5xl py-10 px-6">
            <div className="flex justify-between items-center mb-8">
                <WizardProgress currentStep={step} isImmersive={draftData.reservationType === 'immersive'} />
            </div>

            <div className="mt-8 bg-zinc-900 rounded-xl border border-white/10 p-6 md:p-8 relative">
                {/* Clear Draft Option */}
                {venueId && (
                    <button
                        onClick={() => {
                            setConfirmModal({
                                isOpen: true,
                                onConfirm: () => {
                                    localStorage.removeItem("agora_wizard_step");
                                    localStorage.removeItem("agora_wizard_venue_id");
                                    localStorage.removeItem("agora_wizard_data");
                                    window.location.reload();
                                }
                            });
                        }}
                        className="absolute top-8 right-8 text-xs font-bold text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                    >
                        <span>Start Fresh</span>
                    </button>
                )}

                {step === 1 && <BasicsStep initialData={draftData} onNext={handleNext} onDataChange={handleDataChange} setVenueId={setVenueId} />}
                {step === 2 && venueId && <LocationStep initialData={draftData} venueId={venueId} onNext={handleNext} onDataChange={handleDataChange} onBack={handleBack} />}
                {step === 3 && venueId && <DetailsStep initialData={draftData} venueId={venueId} onNext={handleNext} onDataChange={handleDataChange} onBack={handleBack} />}
                {step === 4 && venueId && <MediaStep initialData={draftData} venueId={venueId} onNext={handleNext} onDataChange={handleDataChange} onBack={handleBack} />}

                {/* Step 5: Experience Choice */}
                {step === 5 && venueId && (
                    <ExperienceStep
                        venueId={venueId}
                        initialData={draftData}
                        onNext={(data) => {
                            handleDataChange(data);
                            if (data.reservationType === 'simple') {
                                setStep(7); // Jump to Preview
                            } else {
                                setStep(6); // Go to Editor
                            }
                        }}
                        onDataChange={handleDataChange}
                        onBack={handleBack}
                    />
                )}

                {/* Step 6: Floor Plan Editor (Conditional) */}
                {step === 6 && venueId && (
                    <FloorPlanStep
                        venueId={venueId}
                        initialData={draftData}
                        onBack={handleBack}
                        onNext={() => setStep(7)}
                        onDataChange={handleDataChange}
                    />
                )}

                {/* Step 7: Preview & Submit */}
                {step === 7 && venueId && <PreviewStep initialData={draftData} venueId={venueId} onBack={handleBack} />}

                {/* Error State */}
                {step > 1 && !venueId && <div className="text-red-500">Error: No Venue ID. Please restart.</div>}

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmModal.onConfirm}
                    title="Start Fresh?"
                    message="Are you sure you want to discard this draft and start a new venue? This action cannot be undone."
                    confirmLabel="Start Fresh"
                    isDestructive={true}
                />
            </div>
        </div>
    );
}

function WizardProgress({ currentStep, isImmersive }: { currentStep: number, isImmersive: boolean }) {
    // Dynamic steps based on flow?
    // Let's just list all potential steps but maybe "Layout" is conditional visually? 
    // Or just "Experience -> Review" for simple.
    // For now, let's keep it complete.
    const steps = ["Basics", "Location", "Details", "Media", "Experience", "Layout", "Review"];

    return (
        <div className="relative w-full mb-12">
            {/* Progress Bar Background */}
            <div className="absolute top-4 left-0 w-full h-0.5 bg-white/5 -z-0 hidden sm:block"></div>

            <div className="flex items-center justify-between relative z-10">
                {steps.map((label, index) => {
                    const stepNum = index + 1;

                    // Hide Layout if simple?
                    // if (label === "Layout" && currentStep > 5 && !isImmersive) return null;
                    // This creates visual gaps.

                    const active = stepNum === currentStep;
                    const completed = stepNum < currentStep;

                    // Skip render logic for clean UI
                    const isSkipped = label === "Layout" && !isImmersive && currentStep === 7;
                    // If we are at Review (7), and skipped Layout (6)... 
                    // We should probably just render 6 steps if Simple.
                    // But that complicates the map index.

                    return (
                        <div key={label} className={`flex flex-col items-center flex-1 transition-opacity ${isSkipped ? 'opacity-20' : 'opacity-100'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${active ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-110" :
                                completed ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                }`}>
                                {completed ? "✓" : stepNum}
                            </div>
                            <span className={`text-[10px] sm:text-xs mt-3 font-bold uppercase tracking-wider transition-colors duration-300 ${active ? "text-indigo-400" : "text-zinc-600"}`}>
                                {label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
