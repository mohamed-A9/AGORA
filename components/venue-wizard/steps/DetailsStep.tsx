"use client";

import { useState, useEffect } from "react";
import { updateVenueStep } from "@/actions/venue";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { DRESS_CODES, AGE_POLICIES, PAYMENT_METHODS, AMBIANCES, CUISINES } from "@/lib/constants";
import TimePicker from "@/components/ui/TimePicker";
import { getVenueTypeFields } from "@/actions/dynamic-fields";

export default function DetailsStep({ venueId, onNext, onBack, initialData, onDataChange }: { venueId: string, onNext: (data: any) => void, onBack: () => void, initialData?: any, onDataChange: (data: any) => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [dynamicFields, setDynamicFields] = useState<any[]>([]);

    // Contact - Initialize from initialData
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [website, setWebsite] = useState(initialData?.website || "");
    const [instagram, setInstagram] = useState(initialData?.instagram || "");

    // Identity Details
    const [ambiance, setAmbiance] = useState(initialData?.ambiance || "");
    const [cuisine, setCuisine] = useState(initialData?.cuisine || "");

    // Policies - Initialize from initialData
    const [dressCode, setDressCode] = useState(initialData?.dressCode || "");
    const [agePolicy, setAgePolicy] = useState(initialData?.agePolicy || "");

    // Ensure paymentMethods is an array
    const [paymentMethods, setPaymentMethods] = useState<string[]>(
        Array.isArray(initialData?.paymentMethods) ? initialData.paymentMethods : []
    );

    // Facilities - Initialize from initialData
    const [parkingAvailable, setParkingAvailable] = useState(initialData?.parkingAvailable || false);
    const [valetParking, setValetParking] = useState(initialData?.valetParking || false);
    const [reservationsEnabled, setReservationsEnabled] = useState(initialData?.reservationsEnabled !== false); // Default true

    // Fetch dynamic fields based on subcategory
    useEffect(() => {
        if (initialData?.subcategory) {
            getVenueTypeFields(initialData.subcategory).then(setDynamicFields);
        }
    }, [initialData?.subcategory]);

    function getOptionsFor(fieldKey: string) {
        const field = dynamicFields.find(f => f.field_key === fieldKey);
        return field && field.options && Array.isArray(field.options) ? field.options : [];
    }

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
            paymentMethods,
            parkingAvailable,
            valetParking,
            reservationsEnabled,
            ambiance,
            cuisine
        });

        if (res?.success) {
            onNext({
                phone, website, instagram,
                dressCode, agePolicy, paymentMethods,
                parkingAvailable, valetParking, reservationsEnabled,
                ambiance, cuisine
            });
        } else {
            console.error("Details Step Error:", res?.error);
            if (res?.error === "DRAFT_NOT_FOUND") {
                alert("This venue draft no longer exists in our database. We'll refresh the page so you can start fresh.");
                localStorage.clear();
                window.location.href = "/business/add-venue";
            } else {
                alert(res?.error || "Failed to save details. Please try again.");
            }
        }
        setIsLoading(false);
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Step 3: Details & Policies</h2>
                <p className="text-zinc-400">Tell us more about the experience.</p>
            </div>

            {/* Experience & Style */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Experience & Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Ambiance (Optional)</label>
                        <select value={ambiance} onChange={e => setAmbiance(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                            <option value="">Select Ambiance...</option>
                            {(getOptionsFor('ambiance').length > 0 ? getOptionsFor('ambiance') : AMBIANCES.map(l => ({ value: l, label_en: l }))).map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label_en || opt.value}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Cuisine / Secondary Style (Optional)</label>
                        <select value={cuisine} onChange={e => setCuisine(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                            <option value="">Select Style...</option>
                            {(getOptionsFor('cuisine_types').length > 0 ? getOptionsFor('cuisine_types') : CUISINES.map(l => ({ value: l, label_en: l }))).map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label_en || opt.value}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Contact Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Phone Number</label>
                        <PhoneInput
                            international
                            defaultCountry="MA"
                            value={phone}
                            onChange={(value) => setPhone(value as string)}
                            className="bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus-within:ring-2 focus-within:ring-indigo-600 outline-none w-full flex gap-2 phone-input-dark"
                        />
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
                            {(getOptionsFor('dress_code').length > 0 ? getOptionsFor('dress_code') : DRESS_CODES.map(l => ({ value: l, label_en: l }))).map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label_en || opt.value}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Age Policy</label>
                        <select value={agePolicy} onChange={e => setAgePolicy(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                            <option value="">Select Age Policy...</option>
                            <option value="All Ages">All Ages</option>
                            <option value="18+">18+</option>
                            <option value="21+">21+</option>
                            <option value="Family Friendly">Family Friendly</option>
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

                    {/* New Amenities Section */}
                    <h4 className="text-md font-semibold text-white mt-6 mb-3">Amenities & Accessibility</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <input type="checkbox" name="hasDanceFloor" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                            <label className="text-white font-medium">Dance Floor</label>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <input type="checkbox" name="wheelchairAccessible" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                            <label className="text-white font-medium">Wheelchair Accessible</label>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <input type="checkbox" name="hasBabyChairs" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                            <label className="text-white font-medium">Baby Chairs Available</label>
                        </div>
                    </div>

                    <h4 className="text-md font-semibold text-white mt-6 mb-3">Dietary Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <input type="checkbox" name="hasGlutenFreeOptions" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                            <label className="text-white font-medium">Gluten-Free Options</label>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <input type="checkbox" name="hasSugarFreeOptions" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                            <label className="text-white font-medium">Sugar-Free Options</label>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <input type="checkbox" name="hasSaltFreeOptions" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                            <label className="text-white font-medium">Salt-Free/Low Sodium</label>
                        </div>
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

            <style jsx global>{`
                .phone-input-dark .PhoneInputCountry { margin-right: 10px; }
                .phone-input-dark .PhoneInputCountrySelect { color: black; }
                .phone-input-dark input { background: transparent; border: none; outline: none; color: white; width: 100%; }
                .phone-input-dark input::placeholder { color: #52525b; }
            `}</style>
        </div >
    );
}
