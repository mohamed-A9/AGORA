"use client";

import { useState, useEffect } from "react";
import { createVenueDraft, updateVenueStep } from "@/actions/venue";
import { getVenueTypes } from "@/actions/taxonomy";
import { getVenueTypeFields } from "@/actions/dynamic-fields";
import { Upload, X } from "lucide-react";

export default function BasicsStep({ onNext, setVenueId, initialData, onDataChange }: { onNext: (data: any) => void, setVenueId: (id: string) => void, initialData?: any, onDataChange: (data: any) => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [coverImage, setCoverImage] = useState(initialData?.coverImageUrl || "");
    const [uploadingCover, setUploadingCover] = useState(false);

    // Taxonomy Data State
    const [taxonomy, setTaxonomy] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [specializationOptions, setSpecializationOptions] = useState<any[]>([]);

    // Selection State
    const [selectedCategory, setSelectedCategory] = useState(initialData?.category || "");
    const [selectedSubcategory, setSelectedSubcategory] = useState(initialData?.subcategory || "");

    // Form validation state
    const [venueName, setVenueName] = useState(initialData?.name || "");
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    // Load Taxonomy on Mount
    useEffect(() => {
        getVenueTypes().then(data => {
            setTaxonomy(data);
            // If we have an initial category, set the subcategories immediately
            if (initialData?.category) {
                const cat = data.find((c: any) => c.code === initialData.category);
                if (cat) setSubcategories(cat.subcategories);
            }
        });
    }, []);

    // Handle Category Change
    useEffect(() => {
        if (!selectedCategory || taxonomy.length === 0) {
            setSubcategories([]);
            return;
        }
        const cat = taxonomy.find(c => c.code === selectedCategory);
        setSubcategories(cat ? cat.subcategories : []);
    }, [selectedCategory, taxonomy]);

    // Handle Subcategory Change
    useEffect(() => {
        if (!selectedSubcategory) {
            setSpecializationOptions([]);
            return;
        }
        // Legacy "Specialization" field logic removed.
        setSpecializationOptions([]);
    }, [selectedSubcategory]);

    // Real-time validation effect
    useEffect(() => {
        const errors: string[] = [];

        if (touched.name && !venueName.trim()) {
            errors.push("Venue name is required");
        }
        if (touched.category && !selectedCategory) {
            errors.push("Category is required");
        }
        if (touched.coverImage && !coverImage) {
            errors.push("Cover image is required");
        }

        setValidationErrors(errors);
    }, [venueName, selectedCategory, coverImage, touched]);

    // Validation helper
    const validateForm = (): boolean => {
        const errors: string[] = [];

        if (!venueName.trim()) {
            errors.push("Venue name is required");
        }
        if (!selectedCategory) {
            errors.push("Category is required");
        }
        if (!coverImage) {
            errors.push("Cover image is required");
        }

        setValidationErrors(errors);
        setTouched({
            name: true,
            category: true,
            coverImage: true
        });

        return errors.length === 0;
    };


    async function uploadCoverImage(file: File) {
        setUploadingCover(true);
        setTouched(prev => ({ ...prev, coverImage: true }));
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
                setCoverImage(data.secure_url);
                onDataChange({ coverImageUrl: data.secure_url });
            }
        } catch (error) {
            console.error("Cover upload error:", error);
            alert("Failed to upload cover image");
        } finally {
            setUploadingCover(false);
        }
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");

        // Validate all required fields
        if (!validateForm()) {
            const missing = [];
            if (!venueName.trim()) missing.push("Venue Name");
            if (!selectedCategory) missing.push("Category");
            if (!coverImage) missing.push("Cover Image");

            alert(`Please complete the following mandatory fields:\n\n- ${missing.join('\n- ')}`);

            setError("Please fill in all required fields (marked with *)");
            setIsLoading(false);
            return;
        }

        // Get form data
        const name = formData.get("name") as string;
        const category = formData.get("category") as string;

        try {
            let venueIdToUse = initialData?.id;

            console.log("📝 [BasicsStep] Submitting Step 1");
            console.log("   - initialData.id:", initialData?.id);

            // ============================================
            // SAFETY CHECK: Verify venue exists if ID provided
            // ============================================
            if (venueIdToUse) {
                console.log("   🔍 Checking if venue still exists:", venueIdToUse);

                const checkRes = await fetch(`/api/venues/${venueIdToUse}`);
                const checkData = await checkRes.json();

                if (checkRes.status === 404 || checkData.error === "NOT_FOUND") {
                    console.warn("   ⚠️ Venue doesn't exist. Creating new draft instead.");
                    venueIdToUse = null;

                    // Clear stale localStorage
                    localStorage.removeItem("agora_wizard_venue_id");
                    localStorage.removeItem("agora_wizard_step");
                    localStorage.removeItem("agora_wizard_data");
                } else {
                    console.log("   ✅ Venue exists, will update it");
                }
            }

            // ============================================
            // CREATE DRAFT IF NO VENUE ID
            // (VenueWizard already cleared stale IDs on load)
            // ============================================\r
            if (!venueIdToUse) {
                console.log("🔧 Creating new venue draft...");

                const res = await createVenueDraft(null, formData);

                if (res?.error) {
                    console.error("❌ Failed to create draft:", res.error);
                    setError(res.error);
                    setIsLoading(false);
                    return;
                }

                if (!res?.success || !res?.venueId) {
                    console.error("❌ No venueId returned from createVenueDraft");
                    setError("Failed to create venue draft. Please try again.");
                    setIsLoading(false);
                    return;
                }

                venueIdToUse = res.venueId;
                console.log("✅ Draft created with ID:", venueIdToUse);

                // CRITICAL: Save venueId to parent state and localStorage
                setVenueId(venueIdToUse);
                localStorage.setItem("agora_wizard_venue_id", venueIdToUse);

                // Update URL so refresh works
                window.history.replaceState(null, "", `?id=${venueIdToUse}`);
            }

            // ============================================
            // UPDATE DRAFT WITH ALL STEP 1 DATA
            // ============================================
            const submitData: any = {
                name,
                category,
                tagline: formData.get("tagline") || "",
                description: formData.get("description") || "",
                subcategory: formData.get("subcategory") || "",
                specialization: formData.get("specialization") || "",
                coverImageUrl: coverImage,
                wizardStep: 1 // Track which step was completed
            };

            console.log("💾 Updating venue draft:", venueIdToUse);
            const updateRes = await updateVenueStep(venueIdToUse, submitData);

            if (updateRes?.success) {
                console.log("✅ Step 1 data saved successfully");

                // Proceed to next step
                onNext({
                    ...Object.fromEntries(formData),
                    coverImageUrl: coverImage,
                    id: venueIdToUse
                });
            } else {
                // Handle update errors
                if (updateRes?.error === "VENUE_NOT_FOUND" || updateRes?.statusCode === 404) {
                    alert("❌ This venue draft no longer exists.\n\nWe'll refresh the page so you can start fresh.");
                    localStorage.removeItem("agora_wizard_venue_id");
                    localStorage.removeItem("agora_wizard_step");
                    localStorage.removeItem("agora_wizard_data");
                    window.location.href = "/business/add-venue";
                } else if (updateRes?.error === "NOT_OWNER" || updateRes?.statusCode === 403) {
                    alert("❌ You don't have permission to edit this venue.");
                    window.location.href = "/business/my-venues";
                } else {
                    setError(updateRes?.message || "Failed to save. Please try again.");
                    setIsLoading(false);
                }
            }

        } catch (err: any) {
            console.error("❌ Unexpected error in handleSubmit:", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Step 1: The Basics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Venue Name <span className="text-red-500">*</span></label>
                    <input
                        name="name"
                        value={venueName}
                        onChange={(e) => {
                            setVenueName(e.target.value);
                            onDataChange({ name: e.target.value });
                        }}
                        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                        required
                        placeholder="Venue Name"
                        className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all ${touched.name && !venueName.trim() ? 'border-red-500' : 'border-zinc-700'
                            }`}
                    />
                    {touched.name && !venueName.trim() && (
                        <p className="text-xs text-red-400">Venue name is required</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Tagline (Short & Catchy)</label>
                    <input
                        name="tagline"
                        defaultValue={initialData?.tagline || ""}
                        onChange={(e) => onDataChange({ tagline: e.target.value })}
                        placeholder="Tagline"
                        className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-zinc-400">Category <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                    {taxonomy.map(cat => (
                        <label key={cat.code} className="cursor-pointer relative group">
                            <input
                                type="radio"
                                name="category"
                                value={cat.code}
                                defaultChecked={initialData?.category === cat.code}
                                required
                                className="peer sr-only"
                                onChange={() => {
                                    setSelectedCategory(cat.code);
                                    setSelectedSubcategory(""); // Reset subcat
                                    setTouched(prev => ({ ...prev, category: true }));
                                    onDataChange({ category: cat.code });
                                }}
                            />
                            <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 peer-checked:border-indigo-500 peer-checked:bg-indigo-600/10 peer-checked:text-indigo-400 transition-all text-center">
                                <span className="block font-medium">{cat.name}</span>
                            </div>
                        </label>
                    ))}
                </div>
                {touched.category && !selectedCategory && (
                    <p className="text-xs text-red-400">Please select a category</p>
                )}
            </div>

            {/* Dynamic Subcategory */}
            {subcategories.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm text-zinc-400">Subcategory (Optional)</label>
                    <select
                        name="subcategory"
                        defaultValue={initialData?.subcategory || ""}
                        onChange={(e) => {
                            setSelectedSubcategory(e.target.value);
                            onDataChange({ subcategory: e.target.value });
                        }}
                        className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                    >
                        <option value="">Select a subcategory...</option>
                        {subcategories.map(sub => (
                            <option key={sub.code} value={sub.code}>{sub.name}</option>
                        ))}
                    </select>
                </div>
            )}



            <div className="space-y-2">
                <label className="text-sm text-zinc-400">About the Venue</label>
                <textarea name="description" defaultValue={initialData?.description || ""} rows={4} className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="Description"></textarea>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                    Card Cover Image <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-zinc-500">This image appears on venue cards (browse page). Make it eye-catching!</p>

                {coverImage ? (
                    <div className="relative group rounded-xl overflow-hidden border-2 border-indigo-500/30">
                        <img
                            src={coverImage}
                            alt="Cover"
                            className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <label className="cursor-pointer px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors">
                                Replace
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && uploadCoverImage(e.target.files[0])}
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setCoverImage("");
                                    setTouched(prev => ({ ...prev, coverImage: true }));
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                        <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                            ✓ Cover Photo
                        </div>
                    </div>
                ) : (
                    <label className="block cursor-pointer">
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-500/5 transition-all ${touched.coverImage && !coverImage ? 'border-red-500' : 'border-zinc-700'
                            }`}>
                            {uploadingCover ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                                    <p className="text-sm text-white">Uploading...</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 mx-auto mb-3 text-zinc-500" />
                                    <p className="text-white font-medium mb-1">Upload Cover Image</p>
                                    <p className="text-sm text-zinc-500">Click to browse or drag & drop</p>
                                    <p className="text-xs text-zinc-600 mt-2">Recommended: 1200x800px, landscape</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && uploadCoverImage(e.target.files[0])}
                        />
                    </label>
                )}
                {touched.coverImage && !coverImage && (
                    <p className="text-xs text-red-400">Cover image is required</p>
                )}
            </div>

            {/* Validation Errors Summary */}
            {validationErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 font-medium mb-2">Please complete the following required fields:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((err, idx) => (
                            <li key={idx} className="text-sm text-red-400">{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</p>}

            <div className="flex justify-end pt-6">
                <button
                    disabled={isLoading || uploadingCover}
                    type="submit"
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Saving Draft..." : uploadingCover ? "Uploading Image..." : "Continue to Location"}
                </button>
            </div>
        </form>
    );
}
