"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Upload, ChevronLeft, ChevronRight, Trash2, FileText } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface MediaItem {
    url: string;
    type: "image" | "video" | "pdf";
}

interface MediaUploadProps {
    onChange: (media: MediaItem[]) => void;
    initialMedia?: MediaItem[];
}

export default function MediaUpload({ onChange, initialMedia = [] }: MediaUploadProps) {
    const [items, setItems] = useState<MediaItem[]>(initialMedia);

    // Prevent infinite loops by tracking if the update came from internal or external
    // Actually, simpler: Use useEffect to sync internal items to parent.
    // And use another useEffect to sync external initialMedia to internal items ONLY if items is empty (initial load).

    useEffect(() => {
        if (initialMedia && initialMedia.length > 0 && items.length === 0) {
            setItems(initialMedia);
        }
        // We purposefully do NOT depend on initialMedia changes afterwards to avoid 
        // overwriting user unsaved work if parent re-renders for other reasons.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMedia]);

    // Sync to parent whenever items change
    useEffect(() => {
        onChange(items);
    }, [items, onChange]);

    const handleUpload = (result: any) => {
        const info = result?.info;
        if (info) {
            let type: "image" | "video" | "pdf" = "image";
            if (info.format === "pdf") type = "pdf";
            else if (info.resource_type === "video") type = "video";

            const newItem: MediaItem = {
                url: info.secure_url,
                type
            };

            // Functional update to avoid race conditions with multiple uploads
            setItems(prev => [...prev, newItem]);
        }
    };

    const handleDelete = (index: number) => {
        setItems(prev => {
            const newItems = [...prev];
            newItems.splice(index, 1);
            return newItems;
        });
    };

    const moveLeft = (index: number) => {
        if (index === 0) return;
        setItems(prev => {
            const newItems = [...prev];
            const temp = newItems[index];
            newItems[index] = newItems[index - 1];
            newItems[index - 1] = temp;
            return newItems;
        });
    };

    const moveRight = (index: number) => {
        setItems(prev => {
            if (index === prev.length - 1) return prev;
            const newItems = [...prev];
            const temp = newItems[index];
            newItems[index] = newItems[index + 1];
            newItems[index + 1] = temp;
            return newItems;
        });
    };

    return (
        <div className="space-y-4">

            {/* Grid of uploaded items */}
            {items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {items.map((item, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-square">
                            {/* Preview */}
                            <div className="h-full w-full">
                                {item.type === 'image' && (
                                    <img src={item.url} className="h-full w-full object-cover" alt="Preview" />
                                )}
                                {item.type === 'video' && (
                                    <video src={item.url} className="h-full w-full object-cover" />
                                )}
                                {item.type === 'pdf' && (
                                    <div className="h-full w-full flex items-center justify-center text-white/50 flex-col gap-2">
                                        <FileText className="w-8 h-8" />
                                        <span className="text-xs">PDF</span>
                                    </div>
                                )}
                            </div>

                            {/* Badge */}
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-xs text-white uppercase">
                                {item.type}
                            </div>

                            {/* Controls Overlay (Visible on Hover) */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => moveLeft(index)}
                                        disabled={index === 0}
                                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-30"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(index)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveRight(index)}
                                        disabled={index === items.length - 1}
                                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            <CldUploadWidget
                uploadPreset="agora_uploads"
                options={{
                    sources: ['local', 'url', 'camera'],
                    resourceType: "auto",
                    excludeOriginal: true,
                    multiple: true,  // ENABLE MULTIPLE SELECTION
                    maxFiles: 20     // REASONABLE LIMIT
                }}
                onSuccess={handleUpload}
            >
                {({ open }) => {
                    return (
                        <button
                            type="button"
                            onClick={() => open()}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-8 text-white/40 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                        >
                            <Upload className="h-6 w-6" />
                            <span className="font-medium">
                                {items.length === 0 ? "Upload Photos, Videos or Menus" : "Add More"}
                            </span>
                        </button>
                    );
                }}
            </CldUploadWidget>

            <p className="text-xs text-white/30 text-center">
                Tip: Hover over items to reorder or delete them. The first image will be the cover.
            </p>
        </div>
    );
}
