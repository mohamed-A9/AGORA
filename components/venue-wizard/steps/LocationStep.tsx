"use client";

import { useState } from "react";
import { updateVenueStep } from "@/actions/venue";
import { moroccanCities, TIME_SLOTS } from "@/lib/constants";

// Helper for days
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function LocationStep({ venueId, onNext, onBack, initialData }: { venueId: string, onNext: (data: any) => void, onBack: () => void, initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false);

    // Address State
    const [address, setAddress] = useState(initialData?.address || "");
    const [city, setCity] = useState(initialData?.city || "");
    const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood || "");
    const [googleUrl, setGoogleUrl] = useState(initialData?.locationUrl || "");

    // Schedule State: Array of { days: [], open: "10:00", close: "23:00" }
    // User requested "From To for days". 
    // We will simple rows: [StartDay] to [EndDay] : [Open] - [Close]
    const [scheduleRows, setScheduleRows] = useState<any[]>(initialData?.weeklySchedule || [
        { startDay: "Mon", endDay: "Sun", open: "09:00", close: "22:00" }
    ]);

    const addScheduleRow = () => {
        setScheduleRows([...scheduleRows, { startDay: "Mon", endDay: "Fri", open: "09:00", close: "18:00" }]);
    };

    const removeScheduleRow = (idx: number) => {
        setScheduleRows(scheduleRows.filter((_, i) => i !== idx));
    };

    const updateRow = (idx: number, field: string, value: string) => {
        const newRows = [...scheduleRows];
        newRows[idx][field] = value;
        setScheduleRows(newRows);
    };

    async function handleContinue() {
        if (!address || !city) return alert("City and Address are required.");

        setIsLoading(true);

        // Construct openingHours string or JSON
        // Format: "Mon-Sun: 09:00-22:00"
        const formattedHours = scheduleRows.map(row =>
            `${row.startDay === row.endDay ? row.startDay : row.startDay + '-' + row.endDay} ${row.open} - ${row.close}`
        ).join(", ");

        const res = await updateVenueStep(venueId, {
            address,
            city,
            neighborhood,
            locationUrl: googleUrl,
            openingHours: formattedHours,
            // We could also store structured schedule in 'weeklySchedule' JSON if needed
            weeklySchedule: scheduleRows
        });

        if (res?.success) {
            onNext({ address, city, openingHours: formattedHours });
        } else {
            alert(res?.error || "Failed to save location.");
        }
        setIsLoading(false);
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Step 2: Location & Hours</h2>
                <p className="text-zinc-400">Where can people find you?</p>
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400">City <span className="text-red-500">*</span></label>
                    <select value={city} onChange={e => setCity(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white">
                        <option value="">Select City...</option>
                        {moroccanCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Neighborhood</label>
                    <input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="e.g. Gueliz, Maarif" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm text-zinc-400">Full Address <span className="text-red-500">*</span></label>
                    <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street name, number..." className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm text-zinc-400">Google Maps Link</label>
                    <input value={googleUrl} onChange={e => setGoogleUrl(e.target.value)} placeholder="https://maps.google.com/..." className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white" />
                </div>
            </div>

            <hr className="border-white/10" />

            {/* Schedule Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Opening Schedule</h3>
                    <button onClick={addScheduleRow} type="button" className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-600/50 px-3 py-1 rounded hover:bg-indigo-600/30 transition-colors">
                        + Add Time Slot
                    </button>
                </div>

                <div className="space-y-3">
                    {scheduleRows.map((row, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-zinc-800/50 p-3 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-500">From</span>
                                <select value={row.startDay} onChange={e => updateRow(idx, 'startDay', e.target.value)} className="bg-zinc-900 border-zinc-700 rounded px-2 py-1 text-sm text-white">
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <span className="text-sm text-zinc-500">To</span>
                                <select value={row.endDay} onChange={e => updateRow(idx, 'endDay', e.target.value)} className="bg-zinc-900 border-zinc-700 rounded px-2 py-1 text-sm text-white">
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div className="hidden md:block w-px h-6 bg-white/10"></div>

                            <div className="flex items-center gap-1.5 flex-1">
                                <span className="text-sm text-zinc-500">Open</span>
                                <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded px-2 py-1">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={row.open.split(':')[0]}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            updateRow(idx, 'open', `${val.padStart(2, '0')}:${row.open.split(':')[1] || '00'}`);
                                        }}
                                        className="w-8 bg-transparent text-sm text-white text-center outline-none"
                                        placeholder="HH"
                                    />
                                    <span className="text-zinc-500">:</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={row.open.split(':')[1]}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            updateRow(idx, 'open', `${row.open.split(':')[0] || '00'}:${val.padStart(2, '0')}`);
                                        }}
                                        className="w-8 bg-transparent text-sm text-white text-center outline-none"
                                        placeholder="mm"
                                    />
                                </div>
                                <span className="text-sm text-zinc-500 ml-1">Close</span>
                                <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded px-2 py-1">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={row.close.split(':')[0]}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            updateRow(idx, 'close', `${val.padStart(2, '0')}:${row.close.split(':')[1] || '00'}`);
                                        }}
                                        className="w-8 bg-transparent text-sm text-white text-center outline-none"
                                        placeholder="HH"
                                    />
                                    <span className="text-zinc-500">:</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={row.close.split(':')[1]}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            updateRow(idx, 'close', `${row.close.split(':')[0] || '00'}:${val.padStart(2, '0')}`);
                                        }}
                                        className="w-8 bg-transparent text-sm text-white text-center outline-none"
                                        placeholder="mm"
                                    />
                                </div>
                            </div>

                            {scheduleRows.length > 1 && (
                                <button onClick={() => removeScheduleRow(idx)} className="text-zinc-500 hover:text-red-400 p-1">
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <button onClick={onBack} disabled={isLoading} className="text-zinc-400 hover:text-white px-4 py-2">
                    Back
                </button>
                <button onClick={handleContinue} disabled={isLoading} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50">
                    {isLoading ? "Saving..." : "Continue to Details"}
                </button>
            </div>
        </div>
    );
}
