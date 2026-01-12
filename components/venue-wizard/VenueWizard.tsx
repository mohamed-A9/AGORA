"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Steps
import BasicsStep from "./steps/BasicsStep";
import LocationStep from "./steps/LocationStep";
import DetailsStep from "./steps/DetailsStep";
import MediaStep from "./steps/MediaStep";
import PreviewStep from "./steps/PreviewStep";

export default function VenueWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [venueId, setVenueId] = useState<string | null>(null);
    const [draftData, setDraftData] = useState<any>({});

    const handleNext = (data: any) => {
        setDraftData({ ...draftData, ...data });
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    // Sub-components will call server actions to save drafts

    return (
        <div className="mx-auto max-w-5xl py-10 px-6">
            <WizardProgress currentStep={step} />

            <div className="mt-8 bg-zinc-900 rounded-xl border border-white/10 p-6 md:p-8">
                {step === 1 && <BasicsStep initialData={draftData} onNext={handleNext} setVenueId={setVenueId} />}
                {step === 2 && venueId && <LocationStep initialData={draftData} venueId={venueId} onNext={handleNext} onBack={handleBack} />}
                {step === 3 && venueId && <DetailsStep initialData={draftData} venueId={venueId} onNext={handleNext} onBack={handleBack} />}
                {step === 4 && venueId && <MediaStep initialData={draftData} venueId={venueId} onNext={handleNext} onBack={handleBack} />}
                {step === 5 && venueId && <PreviewStep initialData={draftData} venueId={venueId} onBack={handleBack} />}

                {/* Error State */}
                {step > 1 && !venueId && <div className="text-red-500">Error: No Venue ID. Please restart.</div>}
            </div>
        </div>
    );
}

function WizardProgress({ currentStep }: { currentStep: number }) {
    const steps = ["Basics", "Location", "Details", "Media", "Preview"];
    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((label, index) => {
                const stepNum = index + 1;
                const active = stepNum === currentStep;
                const completed = stepNum < currentStep;
                return (
                    <div key={label} className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50" :
                            completed ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                            }`}>
                            {completed ? "✓" : stepNum}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${active ? "text-indigo-400" : "text-zinc-600"}`}>{label}</span>
                    </div>
                )
            })}
            {/* Progress Bar Background - simplified */}
            <div className="absolute top-10 left-0 w-full h-0.5 bg-zinc-800 -z-10 hidden sm:block"></div>
        </div>
    );
}
