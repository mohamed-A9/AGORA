"use client";

import { useState } from "react";
import { updateVenueStep } from "@/actions/venue";
import { moroccanCities, CITY_NEIGHBORHOODS } from "@/lib/constants";
import TimePicker from "@/components/ui/TimePicker";

// Helper for days
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function LocationStep({ venueId, onNext, onBack, initialData, onDataChange }: { venueId: string, onNext: (data: any) => void, onBack: () => void, initialData?: any, onDataChange: (data: any) => void }) {
    const [isLoading, setIsLoading] = useState(false);

    // Address State
    const [address, setAddress] = useState(initialData?.address || "");
    const [city, setCity] = useState(initialData?.city || "");
    const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood || "");
    const [googleUrl, setGoogleUrl] = useState(initialData?.locationUrl || "");

    // Schedule State: 7 Fixed Rows for Mon-Sun
    const [scheduleRows, setScheduleRows] = useState<any[]>(() => {
        // If we have previously saved detailed schedule (length 7), use it
        if (initialData?.weeklySchedule && Array.isArray(initialData.weeklySchedule) && initialData.weeklySchedule.length === 7 && initialData.weeklySchedule[0].day) {
            return initialData.weeklySchedule;
        }

        // Otherwise (or if old format), default to 7 days open
        return DAYS.map(day => ({
            day: day,
            open: "09:00",
            close: "22:00",
            closed: false
        }));
    });

    const updateRow = (idx: number, field: string, value: any) => {
        const newRows = [...scheduleRows];
        newRows[idx][field] = value;
        setScheduleRows(newRows);
    };

    const toggleClosed = (idx: number) => {
        const newRows = [...scheduleRows];
        newRows[idx].closed = !newRows[idx].closed;
        setScheduleRows(newRows);
    };

    async function handleContinue() {
        if (!address || !city) return alert("City and Address are required.");

        setIsLoading(true);

        // Construct openingHours string
        // Format: "Mon: 09:00-22:00, Tue: Closed, ..." (Human Readable)
        const formattedHours = scheduleRows.map(row => {
            if (row.closed) return `${row.day}: Closed`;
            return `${row.day}: ${row.open} - ${row.close}`;
        }).join(", ");

        const res = await updateVenueStep(venueId, {
            address,
            city,
            neighborhood,
            locationUrl: googleUrl,
            openingHours: formattedHours,
            weeklySchedule: scheduleRows
        });

        if (res?.success) {
            onNext({
                address,
                city,
                neighborhood,
                locationUrl: googleUrl,
                openingHours: formattedHours,
                weeklySchedule: scheduleRows
            });
        } else {
            if (res?.error === "DRAFT_NOT_FOUND") {
                alert("This venue draft no longer exists in our database. We'll refresh the page so you can start fresh.");
                localStorage.clear();
                window.location.href = "/business/add-venue";
            } else {
                alert(res?.error || "Failed to save location.");
            }
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
                    {city && CITY_NEIGHBORHOODS[city] ? (
                        <select
                            value={neighborhood}
                            onChange={e => setNeighborhood(e.target.value)}
                            className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white"
                        >
                            <option value="">Select Neighborhood...</option>
                            {CITY_NEIGHBORHOODS[city].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                    ) : (
                        <input
                            value={neighborhood}
                            onChange={e => setNeighborhood(e.target.value)}
                            placeholder="e.g. Gueliz, Maarif"
                            className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white"
                        />
                    )}
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
                    <h3 className="text-lg font-semibold text-white">Opening Hours</h3>
                </div>

                <div className="space-y-2">
                    {scheduleRows.map((row, idx) => (
                        <div key={row.day} className={`flex flex-col md:flex-row gap-3 items-center bg-zinc-800/50 p-3 rounded-lg border ${row.closed ? 'border-red-900/30 opacity-75' : 'border-white/5'}`}>

                            {/* Day & Closed Toggle */}
                            <div className="flex items-center justify-between w-full md:w-32">
                                <span className="font-semibold text-zinc-300 w-12">{row.day}</span>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!row.closed}
                                        onChange={() => toggleClosed(idx)}
                                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                                    />
                                    <span className="text-xs text-zinc-500">{row.closed ? 'Closed' : 'Open'}</span>
                                </label>
                            </div>

                            <div className="hidden md:block w-px h-6 bg-white/10 mx-2"></div>

                            {/* Time Pickers (Visible if Open) */}
                            {row.closed ? (
                                <div className="flex-1 text-sm text-zinc-600 italic">
                                    Closed all day
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 flex-1 animate-in fade-in">
                                    <TimePicker
                                        label="Open"
                                        value={row.open}
                                        onChange={(val) => updateRow(idx, 'open', val)}
                                    />
                                    <span className="text-zinc-500">-</span>
                                    <TimePicker
                                        label="Close"
                                        value={row.close}
                                        onChange={(val) => updateRow(idx, 'close', val)}
                                    />
                                </div>
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
