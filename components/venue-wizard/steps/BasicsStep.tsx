"use client";

import { useState } from "react";
import { createVenueDraft, updateVenueStep } from "@/actions/venue";
import { CATEGORY_SUBCATEGORIES, CATEGORY_SPECIALIZATIONS } from "@/lib/constants";


export default function BasicsStep({ onNext, setVenueId, initialData }: { onNext: (data: any) => void, setVenueId: (id: string) => void, initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(initialData?.category || "");

    // We can use categories from your constant or hardcode simple structure for now.
    // The previous implementation used constant `categories`

    // Hardcoded for now to ensure reliability during refactor
    const CATEGORIES = [
        { id: 'restaurants', label: 'Restaurants & Cafés', icon: 'utensils' },
        { id: 'nightlife', label: 'Nightlife & Bars', icon: 'martini' },
        { id: 'clubs', label: 'Clubs & Party', icon: 'party-popper' },
        { id: 'culture', label: 'Culture & Arts', icon: 'theater' },
        { id: 'events', label: 'Events & Live', icon: 'ticket' },
    ];

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");

        if (initialData?.id) {
            // Edit Mode
            const res = await updateVenueStep(initialData.id, {
                name: formData.get("name"),
                category: formData.get("category"),
                tagline: formData.get("tagline"),
                description: formData.get("description")
            });

            if (res?.success) {
                // If ID is already set, we don't strictly need to set it again, but good practice
                // setVenueId(initialData.id); 
                onNext({
                    name: formData.get("name"),
                    category: formData.get("category"),
                    tagline: formData.get("tagline"),
                    description: formData.get("description")
                });
            } else {
                setError(res?.error || "Failed to update venue.");
                setIsLoading(false);
            }

        } else {
            // Create Mode
            const res = await createVenueDraft(null, formData);

            if (res?.error) {
                setError(res.error);
                setIsLoading(false);
            } else if (res?.success && res.venueId) {
                setVenueId(res.venueId);
                onNext({
                    name: formData.get("name"),
                    category: formData.get("category"),
                    tagline: formData.get("tagline"),
                    description: formData.get("description")
                });
            }
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Step 1: The Basics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Venue Name <span className="text-red-500">*</span></label>
                    <input name="name" defaultValue={initialData?.name || ""} required placeholder="e.g. The Royal Bistro" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Tagline (Short & Catchy)</label>
                    <input name="tagline" defaultValue={initialData?.tagline || ""} placeholder="Where flavor meets passion" className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-zinc-400">Category <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                    {CATEGORIES.map(cat => (
                        <label key={cat.id} className="cursor-pointer relative group">
                            <input
                                type="radio"
                                name="category"
                                value={cat.id}
                                defaultChecked={initialData?.category === cat.id}
                                required
                                className="peer sr-only"
                                onChange={() => setSelectedCategory(cat.id)}
                            />
                            <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 peer-checked:border-indigo-500 peer-checked:bg-indigo-600/10 peer-checked:text-indigo-400 transition-all text-center">
                                <span className="block font-medium">{cat.label}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Conditional Subcategory */}
            {selectedCategory && CATEGORY_SUBCATEGORIES[selectedCategory] && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm text-zinc-400">Subcategory (Optional)</label>
                    <select
                        name="subcategory"
                        defaultValue={initialData?.subcategory || ""}
                        className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                    >
                        <option value="">Select a subcategory...</option>
                        {CATEGORY_SUBCATEGORIES[selectedCategory].map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Conditional Specialization (Third Level) */}
            {selectedCategory && CATEGORY_SPECIALIZATIONS[selectedCategory] && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm text-zinc-400">Specialization (Optional)</label>
                    <select
                        name="specialization"
                        defaultValue={initialData?.specialization || ""}
                        className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                    >
                        <option value="">
                            {selectedCategory === 'restaurants' ? 'Select cuisine type...' :
                                selectedCategory === 'nightlife' ? 'Select drink specialty...' :
                                    selectedCategory === 'clubs' ? 'Select music genre...' :
                                        selectedCategory === 'culture' ? 'Select art type...' :
                                            'Select specialization...'}
                        </option>
                        {CATEGORY_SPECIALIZATIONS[selectedCategory].map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm text-zinc-400">About the Venue</label>
                <textarea name="description" defaultValue={initialData?.description || ""} rows={4} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="Describe the vibe, cuisine, and what makes it special..."></textarea>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end pt-6">
                <button disabled={isLoading} type="submit" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50">
                    {isLoading ? "Saving Draft..." : "Continue to Location"}
                </button>
            </div>
        </form>
    );
}
