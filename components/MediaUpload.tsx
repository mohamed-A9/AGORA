"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Upload, ChevronLeft, ChevronRight, Trash2, FileText, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import ImageCropper from "./ImageCropper";

interface MediaItem {
    url: string;
    type: "image" | "video" | "pdf";
}

interface MediaUploadProps {
    onChange: (media: MediaItem[]) => void;
    initialMedia?: MediaItem[];
    allowedFormats?: AwsAllowedFormats[]; // "image" | "video" | "pdf"
    maxFiles?: number;
    title?: string;
    description?: string;
}

type AwsAllowedFormats = "image" | "video" | "pdf";

export default function MediaUpload({
    onChange,
    initialMedia = [],
    allowedFormats = ["image", "video", "pdf"],
    maxFiles = 10,
    title = "Upload Media",
    description = "Images, Videos, or PDF Menus"
}: MediaUploadProps) {
    const [items, setItems] = useState<MediaItem[]>(initialMedia);
    const [croppingItemIndex, setCroppingItemIndex] = useState<number | null>(null);

    // Sync from parent on mount
    useEffect(() => {
        if (initialMedia && initialMedia.length > 0 && items.length === 0) {
            setItems(initialMedia);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMedia]);

    // Sync to parent
    useEffect(() => {
        onChange(items);
    }, [items, onChange]);

    const handleUpload = (result: any) => {
        const info = result?.info;
        if (info) {
            let type: AwsAllowedFormats = "image";
            if (info.format === "pdf") type = "pdf";
            else if (info.resource_type === "video") type = "video";

            const newItem: MediaItem = {
                url: info.secure_url,
                type
            };

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

    const makeMain = (index: number) => {
        if (index === 0) return;
        setItems(prev => {
            const newItems = [...prev];
            const item = newItems[index];
            newItems.splice(index, 1);
            newItems.unshift(item); // Move to start
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

    // --- Cropping Logic ---

    // 1. Get Clean URL (remove previous crops)
    const getCleanUrl = (url: string) => {
        // Remove Cloudinary transformations /upload/c_crop.../v
        // Regex to match /upload/ followed by any transformations until /v
        // This is a naive check, assumes standard Cloudinary URL structure
        if (url.includes("/upload/") && url.includes("/v")) {
            // Split by /upload/
            const parts = url.split("/upload/");
            if (parts.length === 2) {
                const rest = parts[1];
                // If it starts with v123... it's clean. If it starts with some chars then /v123... it has transforms.
                // We want to remove everything before /v
                const vIndex = rest.indexOf("/v");
                if (vIndex > 0) {
                    return parts[0] + "/upload/" + rest.substring(vIndex);
                }
            }
        }
        return url;
    };

    // 2. Handle Save
    const handleCropSave = (cropPixels: any) => {
        if (croppingItemIndex === null || !cropPixels) return;

        setItems(prev => {
            const newItems = [...prev];
            const item = newItems[croppingItemIndex];
            const cleanUrl = getCleanUrl(item.url);

            // Construct Cloudinary Transformation
            // c_crop,x_100,y_100,w_400,h_400
            const transform = `c_crop,x_${cropPixels.x},y_${cropPixels.y},w_${cropPixels.width},h_${cropPixels.height}`;

            // Insert transformation into URL
            // .../upload/v12345/... -> .../upload/c_crop,x_...,y_...,w_...,h_.../v12345/...
            const newUrl = cleanUrl.replace("/upload/", `/upload/${transform}/`);

            newItems[croppingItemIndex] = { ...item, url: newUrl };
            return newItems;
        });

        setCroppingItemIndex(null);
    };

    return (
        <div className="space-y-4">

            {/* Cropper Modal */}
            {croppingItemIndex !== null && items[croppingItemIndex] && (
                <ImageCropper
                    imageSrc={getCleanUrl(items[croppingItemIndex].url)}
                    onCancel={() => setCroppingItemIndex(null)}
                    onCropComplete={handleCropSave}
                />
            )}

            {/* Grid of uploaded items */}
            {items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {items.map((item, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-square">
                            {/* Main Badge */}
                            {index === 0 && (
                                <div className="absolute top-2 left-2 z-10 bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg">
                                    Main Photo
                                </div>
                            )}

                            {/* Preview */}
                            <div className="h-full w-full">
                                {item.type === 'image' && (
                                    <img src={item.url} className="h-full w-full object-cover" alt="Preview" />
                                )}
                                {item.type === 'video' && (
                                    <video src={item.url} className="h-full w-full object-cover" />
                                )}
                                {item.type === 'pdf' && (
                                    <div className="h-full w-full flex flex-col items-center justify-center text-white/50 p-4 text-center">
                                        <FileText className="w-8 h-8 mb-2" />
                                        <span className="text-xs break-all line-clamp-2">PDF</span>
                                    </div>
                                )}
                            </div>

                            {/* Overlays */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">

                                {index !== 0 && (
                                    <button
                                        onClick={() => makeMain(index)}
                                        className="mb-2 px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold text-white hover:bg-indigo-500"
                                    >
                                        Make Main
                                    </button>
                                )}

                                <div className="flex gap-2">
                                    {item.type === 'image' && (
                                        <button
                                            onClick={() => setCroppingItemIndex(index)}
                                            className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                                            title="Adjust Frame"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-200 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => moveLeft(index)} disabled={index === 0} className="p-1 hover:text-white text-white/50 disabled:opacity-20">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={() => moveRight(index)} disabled={index === items.length - 1} className="p-1 hover:text-white text-white/50 disabled:opacity-20">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CldUploadWidget
                uploadPreset="agora-uploads"
                options={{
                    folder: "venues",
                    maxFiles: maxFiles,
                    resourceType: "auto",
                    clientAllowedFormats: allowedFormats,
                }}
                onSuccess={handleUpload}
            >
                {({ open }) => (
                    <button
                        onClick={() => open()}
                        className="w-full border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-4 group"
                    >
                        <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                            <Upload className="w-8 h-8 text-white/50 group-hover:text-white/80" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-white">{title}</h3>
                            <p className="text-white/40 text-sm mt-1">{description}</p>
                            <p className="text-white/20 text-xs mt-4">Max 10MB</p>
                        </div>
                    </button>
                )}
            </CldUploadWidget>
        </div>
    );
}
