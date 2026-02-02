"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Upload, ChevronLeft, ChevronRight, Trash2, FileText, Pencil, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import ImageCropper from "./ImageCropper";
import VideoEditor, { VideoTransformations } from "./VideoEditor";
import Toast from "./Toast";
import {
    validateFile,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_DOCUMENT_TYPES
} from "@/lib/file-validation";

interface MediaItem {
    id?: string;
    url: string;
    type: "image" | "video" | "pdf";
}

interface MediaUploadProps {
    onChange: (media: MediaItem[]) => void;
    initialMedia?: MediaItem[];
    allowedFormats?: AwsAllowedFormats[];
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
    const items = initialMedia;
    const [croppingItemIndex, setCroppingItemIndex] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<{ id: string, preview: string, type: string }[]>([]);
    const [toast, setToast] = useState<{ message: string, type: "success" | "error" | "info" } | null>(null);

    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        await uploadFiles(Array.from(files));
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;
        await uploadFiles(Array.from(files));
    };

    const uploadFiles = async (files: File[]) => {
        if (items.length + files.length > maxFiles) {
            showToast(`You can upload up to ${maxFiles} files maximum`, "error");
            return;
        }

        // Build allowed MIME types based on allowedFormats prop
        const allowedMimeTypes: string[] = [];
        if (allowedFormats.includes('image')) allowedMimeTypes.push(...ALLOWED_IMAGE_TYPES);
        if (allowedFormats.includes('video')) allowedMimeTypes.push(...ALLOWED_VIDEO_TYPES);
        if (allowedFormats.includes('pdf')) allowedMimeTypes.push(...ALLOWED_DOCUMENT_TYPES);

        // ============================================
        // SECURITY VALIDATION - Validate all files first
        // ============================================
        const validFiles: File[] = [];
        for (const file of files) {
            const validation = validateFile(file, allowedMimeTypes);
            if (!validation.valid) {
                showToast(`${file.name}: ${validation.error}`, "error");
                continue; // Skip invalid file
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) {
            return; // All files were invalid
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9";
        setIsUploading(true);

        const newPending = validFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
            type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'pdf'
        }));
        setPendingFiles(prev => [...prev, ...newPending]);

        let currentItems = [...items];

        for (let i = 0; i < validFiles.length; i++) {
            let file = validFiles[i];
            const pending = newPending[i];

            if (file.type.startsWith('image/')) {
                try {
                    file = await compressImage(file);
                } catch (e) {
                    console.error("Compression skipped", e);
                }
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "agora_uploads");
            formData.append("folder", "venues");

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const data = await response.json();

                if (response.ok && data.secure_url) {
                    let type: AwsAllowedFormats = "image";
                    if (data.resource_type === "video") type = "video";
                    if (data.format === "pdf") type = "pdf";

                    const newItem: MediaItem = {
                        url: data.secure_url,
                        type
                    };

                    currentItems = [...currentItems, newItem];
                    onChange(currentItems);
                } else {
                    const errorMsg = data.error?.message || "Upload failed. Check your Cloudinary settings.";
                    console.error("Cloudinary Error:", data);
                    showToast(`Error uploading ${file.name}: ${errorMsg}`, "error");
                }
            } catch (error) {
                console.error("Upload error:", error);
                showToast(`Network error uploading ${file.name}`, "error");
            } finally {
                setPendingFiles(prev => prev.filter(p => p.id !== pending.id));
                if (pending.preview) URL.revokeObjectURL(pending.preview);
            }
        }

        setIsUploading(false);
        if (currentItems.length > items.length) {
            showToast(`Successfully uploaded ${currentItems.length - items.length} file(s)!`, "success");
        }
    };

    const handleDelete = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const makeMain = (index: number) => {
        if (index === 0) return;
        const newItems = [...items];
        const item = newItems[index];
        newItems.splice(index, 1);
        newItems.unshift(item);
        onChange(newItems);
    };

    const moveLeft = (index: number) => {
        if (index === 0) return;
        const newItems = [...items];
        const temp = newItems[index];
        newItems[index] = newItems[index - 1];
        newItems[index - 1] = temp;
        onChange(newItems);
    };

    const moveRight = (index: number) => {
        if (index === items.length - 1) return;
        const newItems = [...items];
        const temp = newItems[index];
        newItems[index] = newItems[index + 1];
        newItems[index + 1] = temp;
        onChange(newItems);
    };

    const getCleanUrl = (url: string) => {
        if (url.includes("/upload/") && url.includes("/v")) {
            const parts = url.split("/upload/");
            if (parts.length === 2) {
                const rest = parts[1];
                const vIndex = rest.indexOf("/v");
                if (vIndex > 0) {
                    return parts[0] + "/upload/" + rest.substring(vIndex);
                }
            }
        }
        return url;
    };

    const handleVideoSave = (transforms: VideoTransformations) => {
        if (croppingItemIndex === null) return;
        const newItems = [...items];
        const item = newItems[croppingItemIndex];
        let cleanUrl = getCleanUrl(item.url);

        // Construct Transformation String
        // Order matters for some operations, generally: Trim -> Rotate -> Effect -> Resize/Crop
        // Cloudinary processes chained transformations from left to right usually.

        let transformParts: string[] = [];

        // 1. Trim (Start Offset / End Offset)
        if (transforms.startTime > 0) transformParts.push(`so_${transforms.startTime}`);
        if (transforms.endTime !== null) transformParts.push(`eo_${transforms.endTime}`);

        // 2. Rotation
        if (transforms.rotation !== 0) transformParts.push(`a_${transforms.rotation}`);

        // 3. Audio (Mute)
        if (transforms.isMuted) transformParts.push(`ac_none`);

        // 4. Zoom (Center Crop)
        // Logic: To zoom 2x, we crop to 50% width/height from center.
        if (transforms.zoom > 1) {
            // Factor = 1 / zoom. E.g. Zoom 2x -> Width 0.5
            // using relative width flags w_1.0 etc doesn't work well with c_crop always.
            // Using "w_<1/zoom >" if using float flags might effectively zoom.
            // Safest simple zoom: c_crop,g_center,w_<1/zoom>,h_<1/zoom> combined with implicit relative sizing (fl_relative_width not assumed everywhere).
            // Actually, scaling UP `c_scale,w_...` makes it bigger but frame same.
            // To ZOOM IN while keeping frame: Crop the center.
            // "w_0.5,h_0.5,c_crop,g_center,fl_relative" is standard for 2x zoom.
            const decimal = (1 / transforms.zoom).toFixed(2);
            transformParts.push(`c_crop,g_center,w_${decimal},h_${decimal},fl_relative`);
        }

        if (transformParts.length > 0) {
            const transformString = transformParts.join(",");
            cleanUrl = cleanUrl.replace("/upload/", `/upload/${transformString}/`);
        }

        newItems[croppingItemIndex] = { ...item, url: cleanUrl };
        onChange(newItems);
        setCroppingItemIndex(null);
    };

    const handleCropSave = (cropPixels: any, rotation: number = 0) => {
        if (croppingItemIndex === null || !cropPixels) return;

        const newItems = [...items];
        const item = newItems[croppingItemIndex];
        const cleanUrl = getCleanUrl(item.url);

        // Build transformation string: Rotate first, then crop
        let transform = "";
        if (rotation !== 0) {
            transform += `a_${rotation}/`;
        }
        transform += `c_crop,x_${cropPixels.x},y_${cropPixels.y},w_${cropPixels.width},h_${cropPixels.height}`;

        const newUrl = cleanUrl.replace("/upload/", `/upload/${transform}/`);

        newItems[croppingItemIndex] = { ...item, url: newUrl };
        onChange(newItems);
        setCroppingItemIndex(null);
    };

    const inputId = `media-input-${title.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).slice(2, 7)}`;

    return (
        <div className="space-y-4">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {croppingItemIndex !== null && items[croppingItemIndex] && items[croppingItemIndex].type === 'image' && (
                <ImageCropper
                    imageSrc={getCleanUrl(items[croppingItemIndex].url)}
                    onCancel={() => setCroppingItemIndex(null)}
                    onCropComplete={handleCropSave}
                />
            )}

            {croppingItemIndex !== null && items[croppingItemIndex] && items[croppingItemIndex].type === 'video' && (
                <VideoEditor
                    videoSrc={getCleanUrl(items[croppingItemIndex].url)}
                    onCancel={() => setCroppingItemIndex(null)}
                    onSave={handleVideoSave}
                />
            )}

            {(items.length > 0 || pendingFiles.length > 0) && (
                <div className="space-y-4 mb-4">
                    {/* Main Photo Preview - Large, exactly like venue page */}
                    {items.length > 0 && items[0] && (
                        <div className="relative group rounded-2xl overflow-hidden bg-zinc-800 border-2 border-indigo-500/50 shadow-xl">
                            <div className="absolute top-3 left-3 z-10 bg-indigo-600 text-white text-xs uppercase font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
                                <span>★</span> Main Photo
                            </div>
                            <div className="aspect-[3/2] w-full">
                                {items[0].type === 'image' && (
                                    <img src={items[0].url} className="h-full w-full object-cover" alt="Main Preview" />
                                )}
                                {items[0].type === 'video' && (
                                    <video src={items[0].url} className="h-full w-full object-cover" controls />
                                )}
                            </div>
                            {/* Hover Controls */}
                            <div className="absolute inset-x-0 bottom-0 p-3 flex justify-end gap-2 md:bg-gradient-to-t md:from-black/80 md:via-transparent md:to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                {items[0] && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCroppingItemIndex(0); }}
                                        type="button"
                                        className="px-3 py-2 bg-white text-black rounded-lg font-bold text-xs hover:bg-white/90 flex items-center gap-2 shadow-lg"
                                    >
                                        <Pencil size={14} />
                                        <span className="hidden sm:inline">Adjust</span>
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(0); }}
                                    type="button"
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg font-bold text-xs hover:bg-red-600 flex items-center gap-2 shadow-lg"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <p className="absolute bottom-3 left-3 text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                This is exactly how your venue will appear on the explore page
                            </p>
                        </div>
                    )}

                    {/* Other Photos Grid */}
                    {items.length > 1 && (
                        <div>
                            <p className="text-zinc-500 text-sm mb-3">Other gallery photos (click to set as main):</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {items.slice(1).map((item, idx) => {
                                    const actualIndex = idx + 1;
                                    return (
                                        <div key={actualIndex} className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-[3/2] cursor-pointer hover:border-indigo-500/50 transition-colors">
                                            <div className="h-full w-full">
                                                {item.type === 'image' && (
                                                    <img src={item.url} className="h-full w-full object-cover" alt={`Gallery ${actualIndex}`} />
                                                )}
                                                {item.type === 'video' && (
                                                    <video src={item.url} className="h-full w-full object-cover" />
                                                )}
                                                {item.type === 'pdf' && (
                                                    <div className="h-full w-full flex flex-col items-center justify-center text-white/50 p-4 text-center">
                                                        <FileText className="w-8 h-8 mb-2" />
                                                        <span className="text-xs">PDF</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mobile Controls (Always Visible) */}
                                            <div className="md:hidden absolute bottom-0 left-0 w-full bg-black/80 p-1.5 flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); makeMain(actualIndex); }}
                                                    type="button"
                                                    className="flex-1 px-2 py-1.5 bg-indigo-600 rounded-md text-[10px] font-bold text-white flex items-center justify-center gap-1 active:scale-95 transition-transform"
                                                >
                                                    ★ Main
                                                </button>
                                                {item.type !== 'pdf' && (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCroppingItemIndex(actualIndex); }}
                                                        type="button"
                                                        className="p-1.5 bg-white/10 rounded-md text-white active:bg-white/20"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(actualIndex); }}
                                                    type="button"
                                                    className="p-1.5 bg-red-500/20 rounded-md text-red-200 active:bg-red-500/30"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>

                                            {/* Desktop Controls (Hover Only) */}
                                            <div className="hidden md:flex absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex-col items-center justify-center gap-2 p-2">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); makeMain(actualIndex); }}
                                                    type="button"
                                                    className="w-full px-2 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-500 flex items-center justify-center gap-1"
                                                >
                                                    ★ Make Main
                                                </button>
                                                <div className="flex gap-2 w-full">
                                                    {item.type !== 'pdf' && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCroppingItemIndex(actualIndex); }}
                                                            type="button"
                                                            className="flex-1 p-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-1"
                                                            title="Adjust Frame"
                                                        >
                                                            <Pencil size={14} />
                                                            <span className="text-xs">Edit</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(actualIndex); }}
                                                        type="button"
                                                        className="flex-1 p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/40 text-red-200 transition-colors flex items-center justify-center gap-1"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span className="text-xs">Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pending Uploads */}
                    {pendingFiles.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {pendingFiles.map((p) => (
                                <div key={p.id} className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-[3/2]">
                                    <div className="h-full w-full opacity-30">
                                        {p.type === 'image' && p.preview && (
                                            <img src={p.preview} className="h-full w-full object-cover" alt="Loading..." />
                                        )}
                                        {(p.type === 'video' || (p.type === 'image' && !p.preview)) && (
                                            <div className="h-full w-full bg-zinc-800" />
                                        )}
                                        {p.type === 'pdf' && (
                                            <div className="h-full w-full flex flex-col items-center justify-center text-white/20 p-4">
                                                <FileText className="w-8 h-8 mb-2" />
                                                <span className="text-[10px]">PDF</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`relative w-full border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => document.getElementById(inputId)?.click()}
            >
                <input
                    id={inputId}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept={allowedFormats.map(f => f === 'pdf' ? '.pdf' : `${f}/*`).join(',')}
                />

                <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Upload className={`w-8 h-8 text-white/50 group-hover:text-white/80 ${isUploading ? 'animate-bounce' : ''}`} />
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">
                        {isUploading ? "Uploading..." : title}
                    </h3>
                    <p className="text-white/40 text-sm mt-1">{description}</p>
                    <p className="text-white/20 text-xs mt-4 italic">Drag and drop here or click to browse</p>
                </div>
            </div>
        </div>
    );
}

async function compressImage(file: File): Promise<File> {
    if (file.type === 'image/gif') return file; // Skip GIFs

    return new Promise((resolve) => {
        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = () => resolve(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 1920;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file);
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file);
                    return;
                }
                // Use compressed if smaller
                if (blob.size < file.size) {
                    const newFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(newFile);
                } else {
                    resolve(file);
                }
            }, 'image/jpeg', 0.85);
        };
        reader.readAsDataURL(file);
    });
}
