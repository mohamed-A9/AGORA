"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateVenue } from "@/actions/venue-management";
import { createEvent, deleteEvent } from "@/actions/event";
import MediaUpload from "@/components/MediaUpload";
import { AMBIANCES, CUISINES, PAYMENT_METHODS, DRESS_CODES, AGE_POLICIES } from "@/lib/constants";
import { EVENT_TYPES, getGenresForType } from "@/lib/event-taxonomy";
import { LayoutDashboard, MapPin, FileText, Camera, Clock, CheckCircle, Calendar, Trash } from "lucide-react";
import Link from "next/link";

export default function EditVenuePage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("basics");
    const [formData, setFormData] = useState<any>({});
    const [media, setMedia] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [eventMedia, setEventMedia] = useState<any[]>([]);
    const [selectedEventType, setSelectedEventType] = useState("");
    const [saveStatus, setSaveStatus] = useState("");

    async function loadData() {
        const res = await fetch(`/api/venues/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (data.venue) {
            setFormData(data.venue);
            setMedia(data.venue.media || []);
            setEvents(data.venue.events || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [id]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaveStatus("Saving...");

        const form = new FormData(e.currentTarget);
        form.append("mediaJson", JSON.stringify(media));
        form.append("id", id);

        const res = await updateVenue(form);
        if (res.success && res.venue) {
            setSaveStatus("Saved!");

            setTimeout(() => setSaveStatus(""), 5000);

            // Update local state directly with authoritative server data
            setFormData(res.venue);
            setMedia(res.venue.media || []);
            // setEvents(res.venue.events || []); // Events not returned in this query usually?

            // Do NOT call loadData() to avoid race conditions with replication lag
        } else {
            alert(res.error || "Error updating");
            setSaveStatus("Error");
        }
    }

    async function handleAddEvent(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        form.append("venueId", id);
        form.append("mediaJson", JSON.stringify(eventMedia));

        const res = await createEvent(form);
        if (res.success) {
            setEventMedia([]); // Reset media state
            setSelectedEventType(""); // Reset type selection
            e.currentTarget.reset();
            loadData();
        } else {
            alert(res.error || "Error adding event");
        }
    }

    async function handleDeleteEvent(eventId: string) {
        if (!confirm("Delete this event?")) return;
        const res = await deleteEvent(eventId);
        if (res.success) {
            loadData();
        } else {
            alert("Error deleting event");
        }
    }

    if (loading) return <div className="text-white">Loading...</div>;

    const tabs = [
        { id: "basics", label: "Basics", icon: LayoutDashboard },
        { id: "location", label: "Location", icon: MapPin },
        { id: "operations", label: "Operations", icon: Clock },
        { id: "details", label: "Details & Policies", icon: CheckCircle },
        { id: "events", label: "Special Nights", icon: Calendar },
        { id: "media", label: "Media", icon: Camera },
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Venue</h1>
                    <p className="text-white/60">Update your venue information.</p>
                </div>
                <div className="flex items-center gap-4">
                    {saveStatus && (
                        <span className={`text-sm font-medium ${saveStatus === "Saved!" ? "text-green-400" : saveStatus === "Error" ? "text-red-400" : "text-white/60"}`}>
                            {saveStatus}
                        </span>
                    )}
                    <Link href="/business/my-venues" className="px-4 py-2 text-white/60 hover:text-white">Cancel</Link>
                    <button form="edit-form" type="submit" disabled={saveStatus === "Saving..."} className="bg-white text-black font-bold px-6 py-2 rounded-xl hover:opacity-90 disabled:opacity-50">
                        {saveStatus === "Saving..." ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8">
                    {/* Main Form for everything EXCEPT Events */}
                    {activeTab !== "events" && (
                        <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* BASICS */}
                            <div className={activeTab === "basics" ? "space-y-6" : "hidden"}>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Venue Name</label>
                                    <input name="name" defaultValue={formData.name} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Tagline</label>
                                    <input name="tagline" defaultValue={formData.tagline} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Category</label>
                                    <select name="category" defaultValue={formData.category} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                                        <option value="Restaurant">Restaurant</option>
                                        <option value="Club">Club</option>
                                        <option value="Bar">Bar</option>
                                        <option value="Lounge">Lounge</option>
                                        <option value="Cafe">Cafe</option>
                                        <option value="Rooftop">Rooftop</option>
                                        <option value="Event Space">Event Space</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Description</label>
                                    <textarea name="description" defaultValue={formData.description} rows={5} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                </div>
                            </div>

                            {/* LOCATION */}
                            <div className={activeTab === "location" ? "space-y-6" : "hidden"}>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Address</label>
                                    <input name="address" defaultValue={formData.address} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">City</label>
                                        <input name="city" defaultValue={formData.city} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Neighborhood</label>
                                        <input name="neighborhood" defaultValue={formData.neighborhood} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Google Maps URL</label>
                                    <input name="locationUrl" defaultValue={formData.locationUrl} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                </div>
                            </div>

                            {/* OPERATIONS */}
                            <div className={activeTab === "operations" ? "space-y-6" : "hidden"}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Phone</label>
                                        <input name="phone" defaultValue={formData.phone} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Website</label>
                                        <input name="website" defaultValue={formData.website} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Opening Hours (Display Text)</label>
                                    <input name="openingHours" defaultValue={formData.openingHours} placeholder="e.g. Daily 9am - 11pm" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <input type="checkbox" name="reservationsEnabled" defaultChecked={formData.reservationsEnabled !== false} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                    <label className="text-white font-medium">Enable Reservations</label>
                                </div>
                            </div>

                            {/* DETAILS */}
                            <div className={activeTab === "details" ? "space-y-6" : "hidden"}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Ambiance</label>
                                        <select name="ambiance" defaultValue={formData.ambiance || ""} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                                            <option value="">None</option>
                                            {AMBIANCES.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Cuisine / Primary Style</label>
                                        <select name="cuisine" defaultValue={formData.cuisine || ""} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                                            <option value="">None</option>
                                            {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Dress Code</label>
                                        <select name="dressCode" defaultValue={formData.dressCode || ""} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                                            <option value="">None</option>
                                            {DRESS_CODES.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Age Policy</label>
                                        <select name="agePolicy" defaultValue={formData.agePolicy || ""} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                                            <option value="">None</option>
                                            {AGE_POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-6 pt-2">
                                    <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10 flex-1">
                                        <input type="checkbox" name="parkingAvailable" defaultChecked={formData.parkingAvailable} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                        <label className="text-white font-medium">Parking Available</label>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10 flex-1">
                                        <input type="checkbox" name="valetParking" defaultChecked={formData.valetParking} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                        <label className="text-white font-medium">Valet Parking</label>
                                    </div>
                                </div>
                            </div>

                            {/* MEDIA */}
                            <div className={activeTab === "media" ? "space-y-2" : "hidden"}>
                                <label className="text-sm text-zinc-400 mb-2 block">Photo Gallery</label>
                                <MediaUpload onChange={setMedia} initialMedia={media} />
                            </div>

                        </form>
                    )}

                    {/* EVENTS TAB (Separate from main form) */}
                    {activeTab === "events" && (
                        <div className="space-y-8">
                            {/* List Events */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white">Upcoming Special Nights</h3>
                                {events.length === 0 ? (
                                    <div className="text-white/40 italic">No events created yet.</div>
                                ) : (
                                    <div className="grid gap-4">
                                        {events.map(ev => (
                                            <div key={ev.id} className="bg-zinc-800 p-4 rounded-xl border border-white/5 flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-white text-lg">{ev.name}</span>
                                                        {ev.type && <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded uppercase font-bold">{ev.type}</span>}
                                                    </div>

                                                    <div className="text-white/60 text-sm flex items-center gap-2">
                                                        <span>{new Date(ev.date).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{ev.startTime || "?"} - {ev.endTime || "?"}</span>
                                                    </div>

                                                    {(ev.genre || (ev.media && ev.media.length > 0)) && (
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                                                            {ev.genre && <span>🎵 {ev.genre}</span>}
                                                            {ev.media && ev.media.length > 0 && <span>📸 {ev.media.length} photos</span>}
                                                        </div>
                                                    )}

                                                    {ev.description && <div className="text-white/60 text-sm mt-2 max-w-lg">{ev.description}</div>}
                                                </div>
                                                <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-400 hover:text-red-300 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <hr className="border-white/10" />

                            {/* Add Event Form */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Add New Event</h3>
                                <form onSubmit={handleAddEvent} className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm text-zinc-400">Event Name *</label>
                                            <input required name="name" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm text-zinc-400">Type</label>
                                            <select
                                                name="type"
                                                required
                                                className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                                                onChange={(e) => setSelectedEventType(e.target.value)}
                                            >
                                                <option value="">Select Category...</option>
                                                {EVENT_TYPES.map(t => (
                                                    <option key={t.id} value={t.id}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm text-zinc-400">Genre / Specifics</label>
                                        <select
                                            name="genre"
                                            disabled={!selectedEventType}
                                            className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {!selectedEventType ? "Select a Type first..." : "Select Specific..."}
                                            </option>
                                            {selectedEventType && getGenresForType(selectedEventType).map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm text-zinc-400">Date *</label>
                                            <input required type="date" name="date" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm text-zinc-400">Start Time</label>
                                            <input type="time" name="startTime" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm text-zinc-400">End Time</label>
                                            <input type="time" name="endTime" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm text-zinc-400">Description</label>
                                        <textarea name="description" rows={3} className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm text-zinc-400 mb-2">Event Media</label>
                                        <MediaUpload
                                            onChange={setEventMedia}
                                            initialMedia={eventMedia}
                                            title="Upload Event Photos/Videos"
                                            description="Add visuals for this event"
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-500 transition-colors">
                                        + Create Event
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
