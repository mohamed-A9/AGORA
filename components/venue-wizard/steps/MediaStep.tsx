"use client";

import { useState } from "react";
import { updateVenueStep } from "@/actions/venue";
import MediaUpload from "@/components/MediaUpload"; // Import existing component

export default function MediaStep({ venueId, onNext, onBack, initialData }: { venueId: string, onNext: (data: any) => void, onBack: () => void, initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [media, setMedia] = useState<any[]>(initialData?.media || []);

    async function handleContinue() {
        if (media.length === 0) {
            if (!confirm("Are you sure you want to continue without any photos? Venues with photos get 5x more views.")) {
                return;
            }
        }

        setIsLoading(true);

        // We need to transform media to the format expected by the backend if necessary.
        // The `MediaUpload` returns { url, type }.
        // `updateVenueStep` (in actions/venue.ts) calls `prisma.venue.update`.
        // The schema has `media` as a relation `Media[]`.
        // `updateVenueStep` doesn't strictly handle nested relations in its generic `data` argument unless we craft it.
        // Let's look at `updateVenueStep`:
        /*
            await prisma.venue.update({
                where: { id: venueId, ownerId: session.user.id },
                data: data
            });
        */
        // If we pass `media` array directly, it might fail because it expects a relation input (create/connect).
        // WE need to delete existing and create new, or just create new.
        // For a draft wizard, simpler is: delete all for this venue and re-create.
        // OR, we can just pass the array and let the server action handle it if we modify `updateVenueStep`.
        // BUT, `updateVenueStep` is very generic.
        // Let's pass a specific object `media` that Prisma understands for update:
        /*
            media: {
                deleteMany: {}, // Clear old
                create: media.map(m => ({ url: m.url, type: m.type })) // Add new
            }
        */

        const mediaUpdatePayload = {
            media: {
                deleteMany: {},
                create: media.map(m => ({ url: m.url, type: m.type }))
            }
        };

        const res = await updateVenueStep(venueId, mediaUpdatePayload);

        if (res?.success) {
            onNext({ media });
        } else {
            console.error("Media Step Error:", res?.error);
            alert(res?.error || "Failed to save media.");
        }
        setIsLoading(false);
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Step 4: Gallery</h2>
                <p className="text-zinc-400">Showcase your venue. High-quality photos are key.</p>
            </div>

            <div className="bg-zinc-800/50 rounded-xl p-6 border border-white/5">
                <MediaUpload
                    initialMedia={media}
                    onChange={setMedia}
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
