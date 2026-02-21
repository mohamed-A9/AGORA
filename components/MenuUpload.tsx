"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, FileText, X, ZoomIn } from "lucide-react";

interface MenuItem {
    url: string;       // Always a renderable image URL (jpg/png) — never a raw PDF
    type: "image";     // Everything stored as image after conversion
}

interface MenuUploadProps {
    initialMedia?: MenuItem[];
    onChange?: (items: MenuItem[]) => void;
    maxFiles?: number;
    venueId: string;   // Required — we save directly to DB
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9";
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "853549478416266";

/** Upload a file to Cloudinary, converting PDF→JPG server-side */
async function uploadToCloudinary(file: File): Promise<string> {
    const timestamp = Math.round(Date.now() / 1000);
    const isPdf = file.type === "application/pdf";

    // Sign the upload — include format:jpg for PDFs so Cloudinary converts them
    const paramsToSign: Record<string, any> = {
        folder: "venues/menus",
        timestamp,
    };
    if (isPdf) {
        paramsToSign.format = "jpg";  // Force PDF→JPG conversion — page 1 by default
    }

    const signRes = await fetch("/api/sign-cloudinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paramsToSign }),
    });
    if (!signRes.ok) throw new Error("Failed to get upload signature");
    const { signature } = await signRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", "venues/menus");
    if (isPdf) {
        formData.append("format", "jpg");
    }

    // Always upload as image resource type
    const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    const data = await uploadRes.json();
    if (!uploadRes.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Upload failed");
    }

    // secure_url is already a .jpg URL for PDFs (Cloudinary converted it)
    return data.secure_url;
}

/** Save the current menu list to DB immediately */
async function saveMenusToDB(venueId: string, items: MenuItem[]): Promise<boolean> {
    try {
        const res = await fetch("/api/venues/save-menus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // All items stored as menu_image since we convert PDFs to images at upload
            body: JSON.stringify({ venueId, menus: items.map(m => ({ ...m, type: "image" })) }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
            console.log(`✅ Menus saved: ${data.saved} items for venue ${venueId}`);
            return true;
        } else {
            console.error(`❌ save-menus failed [${res.status}]:`, data);
            return false;
        }
    } catch (e) {
        console.error("❌ save-menus network error:", e);
        return false;
    }
}

export default function MenuUpload({ initialMedia = [], onChange, maxFiles = 5, venueId }: MenuUploadProps) {
    const [items, setItems] = useState<MenuItem[]>(initialMedia);
    const [uploading, setUploading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [uploadProgress, setUploadProgress] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const showStatus = (status: "saved" | "error") => {
        setSaveStatus(status);
        setTimeout(() => setSaveStatus("idle"), 3000);
    };

    /** Commit a new list to state + notify parent + save to DB */
    const commit = async (newItems: MenuItem[]) => {
        setItems(newItems);
        onChange?.(newItems);

        // SAFETY: Only save to DB if we have a real venueId (not null/undefined/empty)
        if (venueId && String(venueId) !== "undefined" && String(venueId) !== "null") {
            setSaveStatus("saving");
            const ok = await saveMenusToDB(venueId, newItems);
            showStatus(ok ? "saved" : "error");
        }
    };

    /** Delete a menu item immediately and save to DB */
    const handleDelete = async (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        await commit(newItems);
    };

    /** Handle file selection */
    const handleFiles = async (files: FileList) => {
        if (!venueId || String(venueId) === "undefined") {
            setError("Venue ID is missing. Please save the first step first.");
            return;
        }
        const remaining = maxFiles - items.length;
        if (remaining <= 0) {
            setError(`Maximum ${maxFiles} menus allowed.`);
            return;
        }

        const selected = Array.from(files).slice(0, remaining);
        setUploading(true);
        let current = [...items];

        for (let i = 0; i < selected.length; i++) {
            const file = selected[i];
            const isImage = file.type.startsWith("image/");
            const isPdf = file.type === "application/pdf";

            if (!isImage && !isPdf) {
                setError(`"${file.name}" must be an image or PDF.`);
                continue;
            }

            if (file.size > 50 * 1024 * 1024) {
                setError(`"${file.name}" is too large (max 50MB).`);
                continue;
            }

            setUploadProgress(
                selected.length > 1
                    ? `Converting & uploading ${i + 1} of ${selected.length}…`
                    : isPdf
                        ? "Converting PDF to image…"
                        : "Uploading…"
            );

            try {
                const imageUrl = await uploadToCloudinary(file);
                // imageUrl is always a renderable image URL (Cloudinary converted PDF→JPG)
                current = [...current, { url: imageUrl, type: "image" }];
                // Update UI immediately after each file
                setItems(current);
            } catch (err: any) {
                setError(`Failed: ${err.message}`);
            }
        }

        setUploading(false);
        setUploadProgress("");
        if (inputRef.current) inputRef.current.value = "";

        // Save all newly uploaded items to DB in one call
        if (current.length !== items.length) {
            onChange?.(current);
            setSaveStatus("saving");
            const ok = await saveMenusToDB(venueId, current);
            showStatus(ok ? "saved" : "error");
        }
    };

    const canAdd = items.length < maxFiles && !uploading;

    return (
        <div className="space-y-4">

            {/* ─── Full-size Preview Modal ─── */}
            {preview && (
                <div
                    className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col"
                    onClick={() => setPreview(null)}
                >
                    <div
                        className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            <span className="text-white font-semibold">Menu</span>
                        </div>
                        <button
                            onClick={() => setPreview(null)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div
                        className="flex-1 overflow-auto flex items-start justify-center p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={preview}
                            alt="Menu"
                            className="max-w-full rounded-xl shadow-2xl"
                            style={{ maxHeight: "calc(100vh - 120px)", objectFit: "contain" }}
                        />
                    </div>
                </div>
            )}

            {/* ─── Uploading state ─── */}
            {uploading && (
                <div className="flex flex-col items-center justify-center gap-4 py-10 rounded-xl border-2 border-dashed border-indigo-500/40 bg-indigo-500/5">
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="6" />
                            <circle
                                cx="32" cy="32" r="28"
                                fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round"
                                strokeDasharray="175" strokeDashoffset="44"
                                className="animate-spin origin-center"
                                style={{ animationDuration: "1s" }}
                            />
                        </svg>
                        <Upload className="absolute inset-0 m-auto w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-white">{uploadProgress || "Uploading…"}</p>
                        <p className="text-xs text-zinc-500 mt-1">Do not close this page</p>
                    </div>
                </div>
            )}

            {/* ─── Items grid ─── */}
            {!uploading && items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {items.map((item, i) => (
                        <div
                            key={item.url}
                            className="relative group rounded-xl overflow-hidden border border-white/10 bg-zinc-900 aspect-[3/4] cursor-pointer"
                            onClick={() => setPreview(item.url)}
                        >
                            <img
                                src={item.url}
                                alt={`Menu ${i + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    // If image fails, show icon placeholder
                                    const img = e.target as HTMLImageElement;
                                    img.style.display = "none";
                                    const fb = img.nextElementSibling as HTMLElement;
                                    if (fb) fb.classList.remove("hidden");
                                }}
                            />
                            {/* Fallback icon */}
                            <div className="hidden absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900">
                                <FileText className="w-10 h-10 text-indigo-400" />
                                <span className="text-xs text-zinc-400">Menu {i + 1}</span>
                            </div>

                            {/* Hover: view + delete */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                    <ZoomIn className="w-5 h-5 text-white" />
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(i); }}
                                    className="p-2 bg-red-600/90 rounded-full backdrop-blur-sm text-white hover:bg-red-500 transition-colors"
                                    title="Delete menu"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Save status ─── */}
            {saveStatus !== "idle" && (
                <p className={`text-xs text-center ${saveStatus === "saved" ? "text-emerald-400" : saveStatus === "saving" ? "text-zinc-400" : "text-red-400"}`}>
                    {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : "Save failed — please try again"}
                </p>
            )}

            {/* ─── Upload zone ─── */}
            {canAdd && (
                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 rounded-xl p-8 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-white">Upload menu</p>
                        <p className="text-xs text-zinc-500 mt-1">Images or PDF · max {maxFiles} · up to 50 MB</p>
                        <p className="text-xs text-zinc-600 mt-0.5">PDFs are converted to images automatically</p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        disabled={uploading}
                    />
                </label>
            )}

            {!canAdd && !uploading && (
                <p className="text-center text-xs text-zinc-500">
                    {maxFiles} files reached — delete one to add more.
                </p>
            )}

            {error && (
                <p className="text-sm text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-4">{error}</p>
            )}
        </div>
    );
}
