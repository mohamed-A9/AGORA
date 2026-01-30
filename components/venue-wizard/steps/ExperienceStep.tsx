import { useState } from "react";
import { Zap, Sparkles, Check, ArrowRight } from "lucide-react";
import { updateVenueStep } from "@/actions/venue";

export default function ExperienceStep({ venueId, initialData, onNext, onDataChange, onBack }: { venueId: string, initialData: any, onNext: (data: any) => void, onDataChange: (data: any) => void, onBack: () => void }) {
    const [selectedType, setSelectedType] = useState<'simple' | 'immersive'>(initialData.reservationType || 'immersive');
    const [isSaving, setIsSaving] = useState(false);

    const handleContinue = async () => {
        setIsSaving(true);
        // Persist reservation type to DB attributes
        // We merge with existing attributes if any
        const currentAttributes = initialData.attributes || {};
        const updatedAttributes = {
            ...currentAttributes,
            reservationType: selectedType
        };

        try {
            await updateVenueStep(venueId, { attributes: updatedAttributes });
            // Also update local draft data so next steps see it
            onDataChange({ attributes: updatedAttributes, reservationType: selectedType });
            onNext({ reservationType: selectedType });
        } catch (err) {
            console.error("Failed to save experience choice", err);
            // Allow continue anyway? Or show error?
            // For wizard flow, maybe just log and continue, as onNext updates local state too.
            onNext({ reservationType: selectedType });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelect = (type: 'simple' | 'immersive') => {
        setSelectedType(type);
        onDataChange({ reservationType: type });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">Choose Your Reservation Experience</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    Do you want to offer a quick, simple booking flow, or invite guests to a <span className="text-indigo-400 font-semibold">Virtual Experience</span> where they can explore the venue and hand-pick their perfect table?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                {/* SIMPLE BOOKING CARD */}
                <button
                    onClick={() => handleSelect('simple')}
                    className={`
                        relative group p-8 rounded-2xl text-left transition-all duration-300 border-2
                        ${selectedType === 'simple'
                            ? 'bg-zinc-900 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-[1.02]'
                            : 'bg-zinc-900/50 border-white/5 hover:border-white/10 hover:bg-zinc-900'
                        }
                    `}
                >
                    <div className={`
                        w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-colors
                        ${selectedType === 'simple' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'}
                    `}>
                        <Zap className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">Simple Booking</h3>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                        The classic approach. Guests select a date, time, and party size. Fast, familiar, and efficient for standard reservations.
                    </p>

                    {/* Checkmark for selection */}
                    {selectedType === 'simple' && (
                        <div className="absolute top-6 right-6 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center animate-in zoom-in">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                    )}
                </button>

                {/* IMMERSIVE TOUR CARD */}
                <button
                    onClick={() => handleSelect('immersive')}
                    className={`
                        relative group p-8 rounded-2xl text-left transition-all duration-300 border-2
                        ${selectedType === 'immersive'
                            ? 'bg-zinc-900 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-[1.02]'
                            : 'bg-zinc-900/50 border-white/5 hover:border-white/10 hover:bg-zinc-900'
                        }
                    `}
                >
                    {/* Badge */}
                    <div className="absolute top-6 right-6">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
                            Recommended
                        </span>
                    </div>

                    <div className={`
                        w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-colors
                        ${selectedType === 'immersive' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'}
                    `}>
                        <Sparkles className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">Immersive Virtual Tour</h3>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                        Wow your guests. Let them virtually navigate your venue, see the ambiance, and choose the exact table they want.
                    </p>

                    {/* Gradient Glow */}
                    {selectedType === 'immersive' && (
                        <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl pointer-events-none" />
                    )}

                    {/* Selection Indicator */}
                    {selectedType === 'immersive' && (
                        <div className="absolute bottom-6 right-6 w-6 h-6 flex items-center justify-center">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        </div>
                    )}
                </button>
            </div>

            {/* Preview Area (Visual Placeholder as per design implication) */}
            <div className={`
                mt-8 h-64 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden relative transition-all duration-500
                ${selectedType === 'immersive' ? 'bg-indigo-900/10' : 'bg-zinc-900/30'}
            `}>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

                <div className="relative z-10 text-center space-y-2">
                    {selectedType === 'immersive' ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-indigo-600 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)] animate-bounce">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-indigo-300 font-medium">Preview: Guests will explore your venue in 3D</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto flex items-center justify-center border border-white/10">
                                <Zap className="w-8 h-8 text-zinc-500" />
                            </div>
                            <p className="text-zinc-500 font-medium">Preview: Standard List & Calendar View</p>
                        </>
                    )}
                </div>
            </div>


            <div className="flex justify-between items-center pt-8 border-t border-white/5">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-4 py-2 font-medium"
                >
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-all transform hover:scale-105 shadow-lg shadow-white/10 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                >
                    {isSaving ? 'Processing...' : (selectedType === 'immersive' ? 'Continue to Editor' : 'Finish Setup')}
                    {!isSaving && <ArrowRight className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
