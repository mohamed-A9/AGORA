"use client";

import { useState } from "react";
import { Upload, MapPin, Phone, Globe, Star } from "lucide-react";
import MediaUpload from "@/components/MediaUpload";

export default function LiveVenueCreator() {
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        tagline: "",
        description: "",
        category: "",
        address: "",
        city: "Casablanca",
        phone: "",
        website: "",
        instagram: "",
        coverImageUrl: "",
        openingHours: "9:00 AM - 11:00 PM"
    });
    const [gallery, setGallery] = useState<any[]>([]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    async function uploadCoverImage(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "agora_uploads");
        formData.append("folder", "venues/covers");

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9"}/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await response.json();
            if (data.secure_url) {
                updateField("coverImageUrl", data.secure_url);
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-screen">
                {/* LEFT: FORM */}
                <div className="bg-zinc-950 overflow-y-auto p-6 lg:p-8 border-r border-white/10">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Create Your Venue</h1>
                            <p className="text-zinc-400">Fill in the details and see a live preview on the right →</p>
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Cover Image *</label>
                            <p className="text-xs text-zinc-500">Main image for cards and hero</p>
                            {formData.coverImageUrl ? (
                                <div className="relative group rounded-xl overflow-hidden">
                                    <img src={formData.coverImageUrl} className="w-full h-40 object-cover" alt="Cover" />
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                        <span className="px-4 py-2 bg-white text-black rounded-lg font-medium">Change</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCoverImage(e.target.files[0])} />
                                    </label>
                                </div>
                            ) : (
                                <label className="block border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-indigo-500 cursor-pointer transition-colors">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-white">Click to upload cover image</p>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCoverImage(e.target.files[0])} />
                                </label>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Venue Name *"
                                value={formData.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Tagline (e.g. 'Modern Rooftop Lounge')"
                                value={formData.tagline}
                                onChange={(e) => updateField("tagline", e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                rows={4}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Location</h3>
                            <input
                                type="text"
                                placeholder="Address"
                                value={formData.address}
                                onChange={(e) => updateField("address", e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                        </div>

                        {/* Contact */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Contact</h3>
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                            <input
                                type="url"
                                placeholder="Website"
                                value={formData.website}
                                onChange={(e) => updateField("website", e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Instagram (@username)"
                                value={formData.instagram}
                                onChange={(e) => updateField("instagram", e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                        </div>

                        {/* Gallery */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">Photo Gallery (min 5)</h3>
                            <MediaUpload
                                initialMedia={gallery}
                                onChange={setGallery}
                                maxFiles={20}
                                allowedFormats={["image", "video"]}
                            />
                        </div>

                        {/* Submit */}
                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-colors">
                            Create Venue
                        </button>
                    </div>
                </div>

                {/* RIGHT: LIVE PREVIEW */}
                <div className="bg-black overflow-y-auto">
                    <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-white/10 px-6 py-4 z-10">
                        <h2 className="text-lg font-bold text-white">Live Preview</h2>
                        <p className="text-sm text-zinc-400">This is how your venue page will look</p>
                    </div>

                    <div className="p-6 max-w-5xl mx-auto">
                        {/* Preview Header */}
                        <div className="mb-6">
                            <h1 className="text-4xl font-bold text-white mb-2">
                                {formData.name || "Your Venue Name"}
                            </h1>
                            {formData.tagline && (
                                <p className="text-xl text-zinc-400">{formData.tagline}</p>
                            )}
                            <div className="flex items-center gap-3 mt-3 text-zinc-400 text-sm">
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    Nouveau
                                </span>
                                <span>•</span>
                                <span>{formData.city}, Morocco</span>
                            </div>
                        </div>

                        {/* Preview Images */}
                        <div className="grid grid-cols-4 gap-2 mb-8 h-[450px] rounded-2xl overflow-hidden">
                            <div className="col-span-2 bg-zinc-900 relative">
                                {formData.coverImageUrl ? (
                                    <img src={formData.coverImageUrl} className="w-full h-full object-cover" alt="Cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <div className="text-center">
                                            <Upload className="w-12 h-12 mx-auto mb-2" />
                                            <p>Upload cover image</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-2">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="bg-zinc-900 relative">
                                        {gallery[i] ? (
                                            <img src={gallery[i].url} className="w-full h-full object-cover" alt={`Gallery ${i + 1}`} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">
                                                {i + 1}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="space-y-6">
                            {formData.description && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">About</h3>
                                    <p className="text-zinc-300 leading-relaxed">{formData.description}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Information</h3>
                                <div className="space-y-3">
                                    {formData.address && (
                                        <div className="flex items-start gap-3 text-zinc-300">
                                            <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                            <span>{formData.address}, {formData.city}</span>
                                        </div>
                                    )}
                                    {formData.phone && (
                                        <div className="flex items-center gap-3 text-zinc-300">
                                            <Phone className="w-5 h-5 text-indigo-400" />
                                            <span>{formData.phone}</span>
                                        </div>
                                    )}
                                    {formData.website && (
                                        <div className="flex items-center gap-3 text-zinc-300">
                                            <Globe className="w-5 h-5 text-indigo-400" />
                                            <span>{formData.website}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
