"use client";

import { useState } from "react";
import { updateVenueStep } from "@/actions/venue";
import MediaUpload from "@/components/MediaUpload";

export default function MediaStep({ venueId, onNext, onBack, initialData, onDataChange }: { venueId: string, onNext: (data: any) => void, onBack: () => void, initialData?: any, onDataChange: (data: any) => void }) {
    const [isLoading, setIsLoading] = useState(false);

    // Initialize based on type or just empty?
    // Current backend stores all in `media`. We need to filter them if possible.
    // If initialData.media exists, we try to split them.
    // PDFs are definitely menus. Images might be mixed.
    // Ideally, we would have a tag. But for now, let's say all PDFs are menus. 
    // AND let's say we just use one list for everything if we can't distinguish, 
    // BUT the user wants visualization separation.

    // Strategy:
    // We will separate them in the UI. 
    // When loading `initialData.media`:
    // - PDF -> Menu
    // - Everything else -> Gallery
    // THIS IS IMPERFECT because a menu can be an image.
    // BUT since we don't have a 'tag' field in the DB yet (only url/type), this is the best we can do for migration.
    // OR we can trust the user to re-organize if they are editing.

    const allMedia = initialData?.media || [];
    // Correctly separate based on the 'type' (which maps to 'kind' from DB)
    const initialMenu = allMedia.filter((m: any) => m.type === 'pdf' || m.type === 'menu_pdf' || m.type === 'menu_image');
    // Gallery is everything else (image, video)
    const initialGallery = allMedia.filter((m: any) => m.type === 'image' || m.type === 'video');

    const [gallery, setGallery] = useState<any[]>(initialGallery);
    const [menus, setMenus] = useState<any[]>(initialMenu);

    async function handleContinue() {
        const mediaCount = gallery.length; // Photos/Videos only

        if (mediaCount < 5) {
            alert(`You need at least 5 photos or videos. Currently you have ${mediaCount}. Please add ${5 - mediaCount} more.`);
            return;
        }

        setIsLoading(true);

        try {
            // Send gallery and menus separately so backend can correctly classify them
            // 'media' = Gallery items (image/video)
            // 'menus' = Menu items (image/pdf)
            const res = await updateVenueStep(venueId, {
                media: gallery,
                menus: menus
            });

            if (res?.success) {
                console.log("✅ Media saved successfully");
                // For local state/next step, we can merge or keep separate. 
                // Let's pass them properly.
                onNext({
                    media: gallery, // UI expects media to be gallery usually
                    menus: menus
                });
            } else {
                console.error("Media Step Error:", res?.error);
                if (res?.error === "DRAFT_NOT_FOUND") {
                    alert("This venue draft no longer exists. Refreshing...");
                    localStorage.clear();
                    window.location.href = "/business/add-venue";
                } else {
                    alert(res?.error || "Failed to save media.");
                }
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred while saving media.");
        }

        setIsLoading(false);
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Step 4: Gallery & Menus</h2>
                <p className="text-zinc-400">Showcase your venue and what you serve.</p>
            </div>

            {/* Gallery Section */}
            <div className="bg-zinc-800/50 rounded-xl p-6 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Photo & Video Gallery</h3>
                        <p className="text-sm text-zinc-400">Upload at least 5 photos or videos to showcase your venue.</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${gallery.length >= 5 ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-700 text-white'}`}>
                        {gallery.length} / 5 min
                    </div>
                </div>
                <MediaUpload
                    initialMedia={gallery}
                    onChange={setGallery}
                    allowedFormats={["image", "video"]}
                    title="Upload Photos & Videos"
                    description="High quality venue shots"
                />
            </div>

            {/* Menu Section */}
            <div className="bg-zinc-800/50 rounded-xl p-6 border border-white/5 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-white">Menus</h3>
                    <p className="text-sm text-zinc-400">Upload PDF menus or images of your menu.</p>
                </div>
                <MediaUpload
                    initialMedia={menus}
                    onChange={setMenus}
                    allowedFormats={["pdf", "image"]}
                    title="Upload Menus"
                    description="PDF documents or Menu photos"
                />
            </div>

            <div className="flex justify-between pt-6">
                <button onClick={onBack} disabled={isLoading} className="text-zinc-400 hover:text-white px-4 py-2">
                    Back
                </button>
                <button onClick={handleContinue} disabled={isLoading} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50">
                    {isLoading ? "Saving..." : "Continue to Preview"}
                </button>
            </div>
        </div>
    );
}
