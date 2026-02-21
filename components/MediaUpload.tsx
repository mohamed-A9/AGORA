"use client";

import { Upload, ChevronLeft, ChevronRight, Trash2, FileText, Pencil, Loader2, ExternalLink } from "lucide-react";
import { useState, useEffect, useId, useRef } from "react";
import ImageCropper from "./ImageCropper";
import VideoEditor, { VideoTransformations } from "./VideoEditor";
import Toast from "./Toast";
import {
    validateFile,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_DOCUMENT_TYPES
} from "@/lib/file-validation";

// Dynamic imports for heavy libraries
let PDFLib: any = null;
let pdfjsLib: any = null;

const loadPdfLibs = async () => {
    if (PDFLib && pdfjsLib) return { PDFLib, pdfjsLib };

    try {
        console.log("📂 Loading heavy PDF libraries...");
        const [pdfLibMod, pdfjsMod] = await Promise.all([
            import('pdf-lib'),
            import('pdfjs-dist')
        ]);

        PDFLib = pdfLibMod;
        pdfjsLib = pdfjsMod;

        // For PDF.js 5.x, the worker MUST be a module (.mjs) when using the ESM build
        // jsDelivr is usually more reliable than cdnjs for recent ESM modules
        const version = pdfjsLib.version || '5.4.624';
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

        console.log(`✅ PDF libraries loaded (v${version})`);
        return { PDFLib, pdfjsLib };
    } catch (error) {
        console.error("❌ Failed to load PDF libraries:", error);
        throw error;
    }
};

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
    disableEditing?: boolean;
    convertPdfToImages?: boolean;
}

type AwsAllowedFormats = "image" | "video" | "pdf";

export default function MediaUpload({
    onChange,
    initialMedia = [],
    allowedFormats = ["image", "video", "pdf"],
    maxFiles = 10,
    title = "Upload Media",
    description = "Images, Videos, or PDF Menus",
    disableEditing = false,
    convertPdfToImages = false
}: MediaUploadProps) {
    const inputId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
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

        console.log(`📂 Files selected in ${title}:`, files.length);
        await uploadFiles(Array.from(files));

        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "853549478416266";
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

            // PDF Handling: Either Convert to Images OR Compress
            if (file.type === 'application/pdf') {
                if (convertPdfToImages) {
                    try {
                        showToast("Converting PDF to images...", "info");
                        const images = await convertPdfToImageFiles(file);
                        // Process the newly created images
                        for (const imgFile of images) {
                            await uploadSingleFile(imgFile, cloudName, apiKey, currentItems, (newItems) => {
                                currentItems = newItems;
                                onChange(currentItems);
                            });
                        }
                        // Remove pending for the PDF since it's replaced by images
                        setPendingFiles(prev => prev.filter(p => p.id !== pending.id));
                        continue; // Skip the individual PDF upload
                    } catch (e) {
                        console.error("PDF Conversion failed", e);
                    }
                } else if (file.size > 10 * 1024 * 1024) {
                    try {
                        showToast("Optimizing large PDF...", "info");
                        file = await compressPdf(file);
                    } catch (e) {
                        console.error("PDF Optimization failed, trying original", e);
                    }
                }
            }

            // Normal individual file upload
            await uploadSingleFile(file, cloudName, apiKey, currentItems, (newItems) => {
                currentItems = newItems;
                onChange(currentItems);
            }, pending);
        }

        setIsUploading(false);
        if (currentItems.length > items.length) {
            showToast(`Successfully uploaded ${currentItems.length - items.length} file(s)!`, "success");
        }
    };

    const uploadSingleFile = async (
        file: File,
        cloudName: string,
        apiKey: string,
        currentItems: MediaItem[],
        onUpdate: (items: MediaItem[]) => void,
        pending?: any
    ) => {
        try {
            const timestamp = Math.round((new Date).getTime() / 1000);
            const paramsToSign = {
                folder: "venues",
                timestamp: timestamp,
                access_mode: "public"  // Ensure the uploaded asset is publicly accessible
            };

            const signResponse = await fetch('/api/sign-cloudinary', {
                method: 'POST',
                body: JSON.stringify({ paramsToSign }),
            });

            if (!signResponse.ok) throw new Error("Failed to get upload signature");

            const { signature } = await signResponse.json();

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", "venues");
            formData.append("access_mode", "public"); // Must also be in formData

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                { method: "POST", body: formData }
            );

            const data = await response.json();

            if (response.ok && data.secure_url) {
                let type: AwsAllowedFormats = "image";
                if (data.resource_type === "video") type = "video";
                if (data.format === "pdf") type = "pdf";

                // Build a consistent, clean public URL from the response
                const outCloudName = data.cloud_name || 'dt5sqovt9';
                const resourceType = data.resource_type || 'image';
                const publicId = data.public_id;  // e.g. "venues/abc123"
                const version = data.version ? `v${data.version}/` : '';
                const format = data.format || 'jpg';
                const publicUrl = `https://res.cloudinary.com/${outCloudName}/${resourceType}/upload/${version}${publicId}.${format}`;

                const newItem: MediaItem = {
                    url: publicUrl,
                    type
                };

                onUpdate([...currentItems, newItem]);
            } else {
                console.error("Upload Error:", data);
                showToast(`Error uploading ${file.name}: ${data.error?.message || 'Unknown error'}`, "error");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            showToast(`Upload failed: ${error.message}`, "error");
        } finally {
            if (pending) {
                setPendingFiles(prev => prev.filter(p => p.id !== pending.id));
                if (pending.preview) URL.revokeObjectURL(pending.preview);
            }
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

    const getPublicCloudinaryUrl = (url: string) => {
        // res.cloudinary.com is the correct public CDN endpoint when access_mode=public.
        // No transformation needed — the 401 was caused by missing access_mode in the signed upload.
        return url;
    };

    const getPdfThumbnail = (url: string) => {
        if (!url || !url.includes('cloudinary.com')) return null;
        // Normalize away res. subdomain first
        const normalUrl = url.replace('res.cloudinary.com', 'cloudinary.com');
        // Cloudinary trick: render first page as JPEG image
        return normalUrl
            .replace(/\/upload\/(?:v\d+\/)?/, (match) => `${match}f_jpg,pg_1,w_1000,c_limit/`)
            .replace(/\.pdf$/, '.jpg');
    };

    const handleViewPdf = (url: string) => {
        // Just open the PDF directly - access_mode is now public so no auth is needed.
        // fl_inline was causing a 400 error for raw-type PDFs.
        // If URL uses /image/upload/ but the file is raw, try /raw/upload/ as fallback.
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleVideoSave = (transforms: VideoTransformations) => {
        if (croppingItemIndex === null) return;
        const newItems = [...items];
        const item = newItems[croppingItemIndex];
        let cleanUrl = getCleanUrl(item.url);

        // Construct Transformation String
        let transformParts: string[] = [];

        if (transforms.startTime > 0) transformParts.push(`so_${transforms.startTime}`);
        if (transforms.endTime !== null) transformParts.push(`eo_${transforms.endTime}`);
        if (transforms.rotation !== 0) transformParts.push(`a_${transforms.rotation}`);
        if (transforms.isMuted) transformParts.push(`ac_none`);

        if (transforms.zoom > 1) {
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
                    {/* Main Photo Preview */}
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
                                {items[0].type === 'pdf' && (
                                    <div className="h-full w-full relative bg-zinc-900">
                                        {getPdfThumbnail(items[0].url) ? (
                                            <img
                                                src={getPdfThumbnail(items[0].url)!}
                                                className="h-full w-full object-contain"
                                                alt="PDF Preview"
                                                onError={(e) => {
                                                    // Fallback if thumbnail fails
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.querySelector('.pdf-placeholder')!.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`pdf-placeholder ${getPdfThumbnail(items[0].url) ? 'hidden' : ''} h-full w-full flex flex-col items-center justify-center text-white/50 shadow-inner`}>
                                            <FileText className="w-20 h-20 mb-4 text-indigo-400" />
                                            <p className="text-lg font-bold">PDF Document</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-3 flex justify-end gap-2 md:bg-gradient-to-t md:from-black/80 md:via-transparent md:to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                {items[0].type === 'pdf' && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewPdf(items[0].url); }}
                                        type="button"
                                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-500 flex items-center gap-2 shadow-lg"
                                    >
                                        <ExternalLink size={14} />
                                        <span>View PDF</span>
                                    </button>
                                )}
                                {!disableEditing && items[0].type !== 'pdf' && (
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
                                                    <div className="h-full w-full bg-zinc-900 relative">
                                                        {getPdfThumbnail(item.url) ? (
                                                            <img
                                                                src={getPdfThumbnail(item.url)!}
                                                                className="h-full w-full object-cover"
                                                                alt={`PDF Gallery ${actualIndex}`}
                                                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex flex-col items-center justify-center text-white/50 p-4 text-center">
                                                                <FileText className="w-8 h-8 mb-2" />
                                                                <span className="text-xs">PDF</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mobile & Desktop Controls */}
                                            <div className="absolute md:bg-black/70 inset-0 md:opacity-0 md:group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-2 bg-black/40">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); makeMain(actualIndex); }}
                                                    type="button"
                                                    className="w-full px-2 py-1.5 bg-indigo-600 rounded-lg text-[10px] md:text-xs font-bold text-white hover:bg-indigo-500 flex items-center justify-center gap-1"
                                                >
                                                    ★ {window.innerWidth < 768 ? 'Main' : 'Make Main'}
                                                </button>
                                                <div className="flex gap-2 w-full">
                                                    {item.type === 'pdf' && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewPdf(item.url); }}
                                                            type="button"
                                                            className="flex-1 p-1.5 bg-indigo-600/20 rounded-lg hover:bg-indigo-600/40 text-indigo-400 transition-colors flex items-center justify-center"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </button>
                                                    )}
                                                    {item.type !== 'pdf' && !disableEditing && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCroppingItemIndex(actualIndex); }}
                                                            type="button"
                                                            className="flex-1 p-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(actualIndex); }}
                                                        type="button"
                                                        className="flex-1 p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/40 text-red-200 transition-colors flex items-center justify-center"
                                                    >
                                                        <Trash2 size={14} />
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

            <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                htmlFor={inputId}
                className={`relative w-full border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input
                    id={inputId}
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept={allowedFormats.map(f => f === 'pdf' ? '.pdf' : `${f}/*`).join(',')}
                />

                <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Upload className={`w-8 h-8 text-white/50 group-hover:text-white/80 ${isUploading ? 'animate-bounce' : ''}`} />
                </div>

                <div className="text-center pointer-events-none">
                    <h3 className="text-lg font-semibold text-white">
                        {isUploading ? "Uploading..." : title}
                    </h3>
                    <p className="text-white/40 text-sm mt-1">{description}</p>
                    <p className="text-white/20 text-xs mt-4 italic">Drag and drop here or click to browse</p>
                </div>
            </label>
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
async function compressPdf(file: File): Promise<File> {
    const startTime = Date.now();
    console.log(`📄 Starting compression for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    try {
        const { PDFLib, pdfjsLib } = await loadPdfLibs();
        const arrayBuffer = await file.arrayBuffer();

        // Load the PDF
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            useSystemFonts: true,
            disableFontFace: true // Faster and more stable for simple rendering
        });
        const pdf = await loadingTask.promise;
        console.log(`📄 PDF Loaded: ${pdf.numPages} pages`);

        // Prepare output PDF
        const outPdf = await PDFLib.PDFDocument.create();

        // Process each page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);

            // Lower scale slightly (1.2 is roughly 120 DPI) to ensure we hit the 10MB target
            const viewport = page.getViewport({ scale: 1.2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            // Convert to JPEG blob - more efficient than data URLs
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.75));
            if (!blob) continue;

            const imageArrayBuffer = await blob.arrayBuffer();
            const image = await outPdf.embedJpg(imageArrayBuffer);

            const { width, height } = image.scale(1.0);
            const newPage = outPdf.addPage([width, height]);
            newPage.drawImage(image, {
                x: 0,
                y: 0,
                width,
                height,
            });

            // Cleanup canvas to save memory
            canvas.width = 0;
            canvas.height = 0;
        }

        const pdfBytes = await outPdf.save();
        const compressedFile = new File([pdfBytes], file.name, { type: 'application/pdf' });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        const finalSize = (compressedFile.size / 1024 / 1024).toFixed(2);
        console.log(`✅ PDF Compressed in ${duration}s: ${finalSize}MB`);

        if (compressedFile.size > 10 * 1024 * 1024) {
            console.warn("⚠️ PDF still exceeds 10MB after compression!");
        }

        return compressedFile;
    } catch (error: any) {
        console.error("❌ Critical PDF compression error:", error);
        // If it fails, return the original file as a fallback
        return file;
    }
}
async function convertPdfToImageFiles(file: File): Promise<File[]> {
    const startTime = Date.now();
    console.log(`📄 Converting PDF to Images: ${file.name}`);

    try {
        const { pdfjsLib } = await loadPdfLibs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            useSystemFonts: true,
            disableFontFace: true
        });
        const pdf = await loadingTask.promise;
        const imageFiles: File[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // Higher quality for menu conversion
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            if (blob) {
                const nameBase = file.name.replace('.pdf', '');
                imageFiles.push(new File([blob], `${nameBase}-page-${i}.jpg`, { type: 'image/jpeg' }));
            }

            canvas.width = 0;
            canvas.height = 0;
        }

        console.log(`✅ Converted PDF to ${imageFiles.length} images in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
        return imageFiles;
    } catch (error) {
        console.error("❌ PDF Conversion error:", error);
        throw error;
    }
}
