"use client";

import { useState } from "react";
import { updateVenueStep } from "@/actions/venue";
import { DRESS_CODES, AGE_POLICIES, PAYMENT_METHODS } from "@/lib/constants";

export default function DetailsStep({ venueId, onNext, onBack, initialData }: { venueId: string, onNext: (data: any) => void, onBack: () => void, initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false);

    // Contact
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [instagram, setInstagram] = useState("");

    // Policies
    const [dressCode, setDressCode] = useState("");
    const [agePolicy, setAgePolicy] = useState("");
    const [paymentMethods, setPaymentMethods] = useState<string[]>([]);

    // Facilities
    const [parkingAvailable, setParkingAvailable] = useState(initialData?.parkingAvailable || false);
    const [valetParking, setValetParking] = useState(initialData?.valetParking || false);
    const [reservationsEnabled, setReservationsEnabled] = useState(initialData?.reservationsEnabled !== false); // Default true

    // Constants - from @/lib/constants
    // DRESS_CODES, AGE_POLICIES, PAYMENT_METHODS imported

    const togglePaymentMethod = (method: string) => {
        if (paymentMethods.includes(method)) {
            setPaymentMethods(paymentMethods.filter(m => m !== method));
        } else {
            setPaymentMethods([...paymentMethods, method]);
        }
    };

    async function handleContinue() {
        setIsLoading(true);

        const res = await updateVenueStep(venueId, {
            phone,
            website,
            instagram,
            dressCode,
            agePolicy,
            paymentMethods, // Array of strings, handled by generic update if schema matches
            parkingAvailable,
            valetParking,
            reservationsEnabled
        });

        if (res?.success) {
            onNext({
                phone, website, instagram,
                dressCode, agePolicy, paymentMethods,
                parkingAvailable, valetParking, reservationsEnabled
            });
        } else {
            console.error("Details Step Error:", res?.error);
            alert(res?.error || "Failed to save details. Please try again.");
        }
        setIsLoading(false);
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Step 3: Details & Policies</h2>
                <p className="text-zinc-400">Tell us more about the experience.</p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Contact Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Phone Number</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212 6..." className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Website</label>
                        <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Instagram Handle</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-zinc-500">@</span>
                            <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="agora.venue" className="w-full bg-zinc-800 border-zinc-700 rounded-lg pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Policies */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Dress Code</label>
                        <select value={dressCode} onChange={e => setDressCode(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                            <option value="">Select Dress Code...</option>
                            {DRESS_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Age Policy</label>
                        <select value={agePolicy} onChange={e => setAgePolicy(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                            <option value="">Select Age Policy...</option>
                            {AGE_POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Facilities & Payment */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Facilities & Payment</h3>

                <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Payment Methods</label>
                    <div className="flex flex-wrap gap-3">
                        {PAYMENT_METHODS.map(method => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => togglePaymentMethod(method)}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${paymentMethods.includes(method)
                                    ? "bg-indigo-600 border-indigo-500 text-white"
                                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                                    }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${reservationsEnabled ? "bg-indigo-600 border-indigo-600" : "border-zinc-600"}`}>
                            {reservationsEnabled && "✓"}
                        </div>
                        <input type="checkbox" checked={reservationsEnabled} onChange={e => setReservationsEnabled(e.target.checked)} className="hidden" />
                        <div>
                            <span className="text-white font-medium block">Accept Reservations</span>
                            <span className="text-zinc-400 text-sm block">Allow users to book tables via the app</span>
                        </div>
                    </label>

                    <div className="flex gap-8 px-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${parkingAvailable ? "bg-indigo-600 border-indigo-600" : "border-zinc-600"}`}>
                                {parkingAvailable && "✓"}
                            </div>
                            <input type="checkbox" checked={parkingAvailable} onChange={e => setParkingAvailable(e.target.checked)} className="hidden" />
                            <span className="text-white">Parking Available</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${valetParking ? "bg-indigo-600 border-indigo-600" : "border-zinc-600"}`}>
                                {valetParking && "✓"}
                            </div>
                            <input type="checkbox" checked={valetParking} onChange={e => setValetParking(e.target.checked)} className="hidden" />
                            <span className="text-white">Valet Service</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-between pt-6">
                    <button onClick={onBack} disabled={isLoading} className="text-zinc-400 hover:text-white px-4 py-2">
                        Back
                    </button>
                    <button onClick={handleContinue} disabled={isLoading} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50">
                        {isLoading ? "Saving..." : "Continue to Media"}
                    </button>
                </div>
            </div>
        </div>);
}
