"use client";

import { useState } from "react";
import { updateVenueStep } from "@/actions/venue";
import MediaUpload from "@/components/MediaUpload";
import MenuUpload from "@/components/MenuUpload";

export default function MediaStep({ venueId, onNext, onBack, initialData, onDataChange }: {
    venueId: string,
    onNext: (data: any) => void,
    onBack: () => void,
    initialData?: any,
    onDataChange: (data: any) => void
}) {
    const [isLoading, setIsLoading] = useState(false);

    // Filter menus from all available media
    // We check both type and kind to be safe with legacy data
    const allMedia = initialData?.media || [];
    const initialMenus = allMedia
        .filter((m: any) =>
            m.kind === 'menu_image' ||
            m.kind === 'menu_pdf' ||
            m.type === 'pdf' ||
            m.type === 'menu_pdf'
        )
        .map((m: any) => ({
            url: m.url,
            type: 'image' as const // We treat everything as image now
        }));

    const initialGallery = allMedia.filter((m: any) => m.type === 'image' || m.type === 'video');

    const [gallery, setGallery] = useState<any[]>(initialGallery);
    const [menus, setMenus] = useState<any[]>(initialMenus);

    const handleMenuChange = (newMenus: any[]) => {
        setMenus(newMenus);
        onDataChange({ menus: newMenus });
    };

    async function handleContinue() {
        const mediaCount = gallery.length;
        if (mediaCount < 5) {
            alert(`You need at least 5 photos or videos. Currently you have ${mediaCount}.`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await updateVenueStep(venueId, {
                media: gallery,
                menus: menus
            });

            if (res?.success) {
                onNext({ media: gallery, menus: menus });
            } else {
                alert(res?.error || "Failed to save media.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        }
        setIsLoading(false);
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Step 4: Gallery &amp; Menus</h2>
                <p className="text-zinc-400">Showcase your venue and what you serve.</p>
            </div>

            {/* Gallery Section */}
            <div className="bg-zinc-800/50 rounded-xl p-6 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Photo &amp; Video Gallery</h3>
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

            {/* Menu Section — MenuUpload handles its own DB saves via venueId */}
            <div className="bg-zinc-800/50 rounded-xl p-6 border border-white/5 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-white">Menus</h3>
                    <p className="text-sm text-zinc-400">Upload PDF menus or images of your menu. Saved automatically.</p>
                </div>
                <MenuUpload
                    initialMedia={initialMenus}
                    onChange={handleMenuChange}
                    maxFiles={5}
                    venueId={venueId}
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
