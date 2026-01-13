"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateVenue } from "@/actions/venue-management";
import { createEvent, deleteEvent } from "@/actions/event";
import MediaUpload from "@/components/MediaUpload";
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

    async function loadData() {
        const res = await fetch(`/api/venues/${id}`);
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
        const form = new FormData(e.currentTarget);
        form.append("mediaJson", JSON.stringify(media));
        form.append("id", id);

        const res = await updateVenue(form);
        if (res.success) {
            router.push("/business/my-venues");
        } else {
            alert(res.error || "Error updating");
        }
    }

    async function handleAddEvent(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        form.append("venueId", id);

        const res = await createEvent(form);
        if (res.success) {
            alert("Event created!");
            e.currentTarget.reset();
            loadData(); // Reload to see new event
        } else {
            alert(res.error || "Error creating event");
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
                <div className="flex gap-4">
                    <Link href="/business/my-venues" className="px-4 py-2 text-white/60 hover:text-white">Cancel</Link>
                    <button form="edit-form" type="submit" className="bg-white text-black font-bold px-6 py-2 rounded-xl hover:opacity-90">Save Changes</button>
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
                                        <label className="text-sm text-zinc-400">Dress Code</label>
                                        <select name="dressCode" defaultValue={formData.dressCode || ""} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                                            <option value="">None</option>
                                            <option value="Casual">Casual</option>
                                            <option value="Smart Casual">Smart Casual</option>
                                            <option value="Formal">Formal</option>
                                            <option value="Beachwear">Beachwear</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-zinc-400">Age Policy</label>
                                        <select name="agePolicy" defaultValue={formData.agePolicy || ""} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none">
                                            <option value="">None</option>
                                            <option value="All Ages">All Ages</option>
                                            <option value="18+">18+</option>
                                            <option value="21+">21+</option>
                                            <option value="Family Friendly">Family Friendly</option>
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
                                            <div key={ev.id} className="bg-zinc-800 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-white">{ev.name}</div>
                                                    <div className="text-indigo-400 text-sm">{new Date(ev.date).toLocaleDateString()} at {ev.startTime}</div>
                                                    {ev.description && <div className="text-white/60 text-sm mt-1">{ev.description}</div>}
                                                </div>
                                                <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-400 hover:text-red-300 p-2">
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
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Event Name</label>
                                        <input required name="name" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Date</label>
                                            <input required type="date" name="date" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Start Time</label>
                                            <input type="time" name="startTime" className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Description (Optional)</label>
                                        <textarea name="description" rows={3} className="w-full bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-500">
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
