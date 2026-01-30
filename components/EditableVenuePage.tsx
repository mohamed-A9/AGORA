"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Upload, MapPin, Phone, Globe, Instagram, ChevronLeft, Save,
    ArrowRight, Check, Sparkles, Image as ImageIcon, Music,
    Utensils, Armchair, Info, Clock, ShieldCheck, CheckCircle2, Link as LinkIcon,
    CalendarDays, MessageCircle, Map, Mail, FileText, Zap
} from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
import FloorPlanEditor, { Scene } from "@/components/venue-wizard/FloorPlanEditor";
import { createVenueDraft, updateVenueStep } from "@/actions/venue";
import { TAXONOMY } from "@/lib/taxonomy";
import ImageCropper from "@/components/ImageCropper";
import getCroppedImg from "@/lib/cropImage";
import { moroccanCities, CITY_NEIGHBORHOODS, DRESS_CODES, AGE_POLICIES, PAYMENT_METHODS } from "@/lib/constants";
import NotificationModal from "@/components/ui/NotificationModal";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_OPTIONS = (() => {
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m of [0, 15, 30, 45]) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            times.push(`${hour}:${minute}`);
        }
    }
    return times;
})();

import { COUNTRY_LIST } from "@/lib/countries";

import { useSearchParams } from "next/navigation";
import { getVenueDraft } from "@/actions/venue";

export default function VenueWizardPage() {
    const phoneCodes = COUNTRY_LIST;

    const router = useRouter();
    const searchParams = useSearchParams();
    const urlVenueId = searchParams.get("id");

    // Custom Icon for Agora
    const AgoraIcon = ({ className }: { className?: string }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 21 12 3 21 21" />
            <path d="M7 13h10" />
        </svg>
    );

    const [saving, setSaving] = useState(false);
    const [venueId, setVenueId] = useState<string | null>(urlVenueId);

    // Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const TOTAL_STEPS = 5;
    const [isDirty, setIsDirty] = useState(false);

    // Notification Modal State
    const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info" }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info"
    });

    // Ref to prevent hydration from overriding step during save
    const isSavingRef = useRef(false);

    const showNotification = (title: string, message: string, type: "success" | "error" | "warning" | "info" = "warning") => {
        setNotification({ isOpen: true, title, message, type });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    // Persistence: Restore ID & Step
    // Persistence: Restore ID & Step
    useEffect(() => {
        // We REMOVED auto-restore of ID from localStorage to force fresh start on new entry.
        // User must click "Resume" from dashboard to get the ID in URL.

        // Only restore step from localStorage on initial page load with URL param
        if (urlVenueId && !isSavingRef.current) {
            const savedStep = localStorage.getItem(`agora_editor_step_${urlVenueId}`);
            if (savedStep) {
                const s = parseInt(savedStep);
                if (!isNaN(s) && s >= 1 && s <= TOTAL_STEPS) setCurrentStep(s);
            }
        }
    }, [urlVenueId]); // Only run on URL param change, not on programmatic venueId changes

    // Persistence: Save ID & Step
    useEffect(() => {
        if (venueId) {
            localStorage.setItem("agora_last_venue_id", venueId);
            localStorage.setItem(`agora_editor_step_${venueId}`, currentStep.toString());
        }
    }, [venueId, currentStep]);

    // Hydrate form if editing existing draft (ONLY when resuming from URL)
    useEffect(() => {
        // Only hydrate if we have a URL param (resume scenario)
        // Do NOT hydrate when venueId is set programmatically after creating a new venue
        if (!urlVenueId) return;

        if (urlVenueId !== venueId) setVenueId(urlVenueId);

        getVenueDraft(urlVenueId).then((result) => {
            if (result && result.venue) {
                const v = result.venue as any;

                // Helper to split phone
                let loadedPrefix = "+212";
                let loadedPhone = "";
                if (v.phone) {
                    // Check if space exists
                    if (v.phone.includes(" ")) {
                        const parts = v.phone.split(" ");
                        loadedPrefix = parts[0];
                        loadedPhone = parts[1];
                    } else {
                        loadedPhone = v.phone;
                    }

                    // Restore leading zero if missing
                    if (loadedPhone && !loadedPhone.startsWith('0')) {
                        loadedPhone = '0' + loadedPhone;
                    }
                }

                // Helper to parse Schedule
                let loadedTimeStart = "12:00";
                let loadedTimeEnd = "00:00";
                let loadedDayStart = "Monday";
                let loadedDayEnd = "Sunday";

                if (v.weeklySchedule) {
                    const ws = v.weeklySchedule;
                    if (ws.startHour) loadedTimeStart = ws.startHour;
                    if (ws.endHour) loadedTimeEnd = ws.endHour;
                    if (ws.dayStart) loadedDayStart = ws.dayStart;
                    if (ws.dayEnd) loadedDayEnd = ws.dayEnd;
                } else if (v.openingHours) {
                    const parts = v.openingHours.split(" - ");
                    if (parts.length === 2) {
                        loadedTimeStart = parts[0];
                        loadedTimeEnd = parts[1];
                    }
                }


                // Restore Step from DB if valid (but NOT if we're currently saving)
                if (!isSavingRef.current) {
                    if (v.wizardStep && v.wizardStep >= 1 && v.wizardStep <= TOTAL_STEPS) {
                        setCurrentStep(v.wizardStep);
                    } else if (v.wizardStep && v.wizardStep > TOTAL_STEPS) {
                        // If finished, maybe go to last step or redirect?
                        // For now, let's stick to last step or 1 if invalid
                        setCurrentStep(TOTAL_STEPS);
                    }
                }

                // Populate Form
                setData(prev => ({
                    ...prev,
                    name: v.name,
                    description: v.description || "",
                    address: v.address || "",
                    city: v.city?.name || "",
                    neighborhood: v.neighborhood || "",
                    phone: loadedPhone,
                    phonePrefix: loadedPrefix,
                    email: v.email || "",
                    website: v.website || "",
                    instagram: v.instagramUrl || "",
                    tiktokUrl: v.tiktokUrl || "",
                    wazeUrl: v.wazeUrl || "",
                    locationUrl: v.locationUrl || "",

                    timeStart: loadedTimeStart,
                    timeEnd: loadedTimeEnd,
                    dayStart: loadedDayStart,
                    dayEnd: loadedDayEnd,

                    coverImageUrl: v.coverImageUrl || "",
                    category: v.mainCategory,
                    subcategory: v.subcategories?.[0]?.subcategory?.name || "", // Simplified
                    dressCode: v.dressCode || "",
                    agePolicy: v.agePolicy || "",
                    parkingAvailable: v.parkingAvailable,
                    valetParking: v.valetParking,
                    reservationsEnabled: v.reservationsEnabled,
                    reservationPolicy: v.reservationPolicy || "AGORA",
                    reservationPhoneNumber: v.reservationPhoneNumber || "",
                    reservationUrl: v.reservationUrl || "",
                    menuUrl: v.menuUrl || "",
                }));

                // Populate Multi-selects
                if (v.cuisines) setSelectedCuisines(v.cuisines.map((c: any) => c.cuisine.name));
                if (v.vibes) setSelectedVibes(v.vibes.map((v: any) => v.vibe.name));
                if (v.musicTypes) setSelectedMusic(v.musicTypes.map((m: any) => m.musicType.name));
                if (v.facilities) setSelectedFacilities(v.facilities.map((f: any) => f.facility.code));
                if (v.paymentMethods) setSelectedPayments(v.paymentMethods);

                if (v.gallery) {
                    setGallery(v.gallery.filter((g: any) => g.kind === 'image' || g.kind === 'video').map((g: any) => ({ url: g.url, type: g.kind })));
                    setMenuGallery(v.gallery.filter((g: any) => g.kind === 'menu_image' || g.kind === 'menu_pdf').map((g: any) => ({ url: g.url, type: g.kind === 'menu_pdf' ? 'pdf' : 'image' })));
                }

                // Hydrate Floor Plan
                if (v.floorPlan) {
                    const fp = v.floorPlan as any;
                    if (fp.enabled !== undefined) setEnableFloorPlan(fp.enabled);
                    if (fp.scenes && Array.isArray(fp.scenes)) setFloorPlanScenes(fp.scenes);
                }
            }
        });
    }, [urlVenueId]); // ONLY hydrate when URL changes (resume scenario), NOT when venueId is set programmatically

    // Form Data
    const [data, setData] = useState({
        name: "",
        tagline: "",
        description: "",
        address: "",
        city: "",
        neighborhood: "",

        // Contact
        phonePrefix: "+212",
        phone: "", // Local number (e.g. 0612345678)
        email: "",
        website: "",
        instagram: "",
        tiktokUrl: "",
        wazeUrl: "",
        locationUrl: "",

        // Schedule
        dayStart: "",
        dayEnd: "",
        timeStart: "",
        timeEnd: "",

        coverImageUrl: "",
        category: "",
        subcategory: "",
        dressCode: "",
        agePolicy: "",
        parkingAvailable: false,
        valetParking: false,
        reservationsEnabled: true,
        reservationPolicy: "AGORA",
        reservationPhoneNumber: "+212 ",
        reservationUrl: "",
        menuUrl: "",
    });

    const [gallery, setGallery] = useState<any[]>([]);
    const [menuGallery, setMenuGallery] = useState<any[]>([]);

    // Multi-select states
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

    // UI States
    // UI States
    const [cuisinesExpanded, setCuisinesExpanded] = useState(false);
    const [musicExpanded, setMusicExpanded] = useState(false);
    const [vibesExpanded, setVibesExpanded] = useState(false);

    // Floor Plan
    const [floorPlanScenes, setFloorPlanScenes] = useState<Scene[]>([]);
    const [enableFloorPlan, setEnableFloorPlan] = useState(false);

    // Cropping State for Cover
    const [coverCropState, setCoverCropState] = useState<{ src: string; fileType: string } | null>(null);

    // Taxonomy Lists
    // Use directly to avoid stale closers, but referencing here for clarity
    const CUISINES = TAXONOMY.CUISINES;
    const AMBIANCES = TAXONOMY.VIBES;
    const MUSIC_STYLES = TAXONOMY.MUSIC_TYPES;
    const FACILITIES = TAXONOMY.FACILITIES;
    const CATEGORIES = TAXONOMY.CATEGORIES;

    useEffect(() => {
        console.log("Cuisines loaded:", TAXONOMY.CUISINES.length);
    }, []);

    // Security / Sanitization
    const sanitizeInput = (text: string) => {
        // Remove script tags and potentially harmful characters (Basic HTML cleaning)
        // Also remove commonly dangerous chars < >
        return text.replace(/[<>]/g, "").slice(0, 500);
    };

    const updateField = (field: string, value: any) => {
        const cleanValue = typeof value === 'string' ? sanitizeInput(value) : value;
        setData(prev => ({ ...prev, [field]: cleanValue }));
        setIsDirty(true);
    };

    const toggleSelection = (list: string[], setList: (l: string[]) => void, item: string) => {
        setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
        setIsDirty(true);
    };

    // --- Helpers ---

    // 1. Select File -> Open Cropper
    const onSelectCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setCoverCropState({
                    src: reader.result as string,
                    fileType: file.type
                });
            });
            reader.readAsDataURL(file);
            // reset input
            e.target.value = '';
        }
    };

    // 2. Crop Saved -> Upload Blob
    const onCoverCropComplete = async (croppedAreaPixels: any) => {
        if (!coverCropState) return;
        try {
            const croppedBlob = await getCroppedImg(coverCropState.src, croppedAreaPixels);
            if (croppedBlob) {
                // Upload this blob
                await uploadCoverBlob(croppedBlob);
            }
        } catch (e) {
            console.error("Crop error", e);
        }
        setCoverCropState(null);
    };

    async function uploadCoverBlob(blob: Blob) {
        const fd = new FormData();
        fd.append("file", blob);
        fd.append("upload_preset", "agora_uploads");
        fd.append("folder", "venues/covers");

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9"}/image/upload`,
            { method: "POST", body: fd }
        );
        const result = await response.json();
        if (result.secure_url) {
            updateField("coverImageUrl", result.secure_url);
        }
    }

    async function uploadSceneImage(blob: Blob) {
        const fd = new FormData();
        fd.append("file", blob);
        fd.append("upload_preset", "agora_uploads");
        fd.append("folder", "venues/floorplans");

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9"}/image/upload`,
            { method: "POST", body: fd }
        );
        const result = await response.json();
        return result.secure_url;
    }

    function getDaysRange(start: string, end: string) {
        const startIndex = DAYS.indexOf(start);
        const endIndex = DAYS.indexOf(end);
        if (startIndex === -1 || endIndex === -1) return [];

        if (startIndex <= endIndex) {
            return DAYS.slice(startIndex, endIndex + 1);
        } else {
            // Wrap around (e.g. Friday to Tuesday)
            return [...DAYS.slice(startIndex), ...DAYS.slice(0, endIndex + 1)];
        }
    }

    async function handleSaveStep(nextStep?: number) {
        setSaving(true);
        isSavingRef.current = true;

        // OPTIMIZATION: If we already have a venue ID (draft) and nothing changed,
        // just move to next step without saving/delay.
        if (venueId && !isDirty && nextStep) {
            console.log("Optimization: Nothing changed, moving to next step directly.");
            if (nextStep > TOTAL_STEPS) {
                router.push(`/business/dashboard?success=venue-created`);
            } else {
                setCurrentStep(nextStep);
            }
            setSaving(false);
            isSavingRef.current = false;
            return;
        }
        // MANDATORY VALIDATION - ALWAYS RUNS
        // User cannot proceed until all required fields
        // ============================================

        // Step 1: Validation (Mandatory Fields)
        if (currentStep === 1) {
            const missingFields = [];
            if (!data.name?.trim()) missingFields.push("Venue Name");
            if (!data.category) missingFields.push("Primary Category");
            if (!data.subcategory) missingFields.push("Subcategory");
            if (!data.city) missingFields.push("City");
            if (!data.address?.trim()) missingFields.push("Full Street Address");
            if (!data.phone?.trim()) missingFields.push("Phone Number");

            // Mandatory Schedule Fields
            if (!data.dayStart) missingFields.push("Opening Day (From)");
            if (!data.dayEnd) missingFields.push("Opening Day (To)");
            if (!data.timeStart) missingFields.push("Opening Time (Open At)");
            if (!data.timeEnd) missingFields.push("Closing Time (Close At)");

            if (missingFields.length > 0) {
                showNotification("Missing Information", `Please complete ALL mandatory fields before proceeding:\n\n• ${missingFields.join('\n• ')}`, "warning");
                setSaving(false);
                isSavingRef.current = false;
                return;
            }

            // Validate Phone Format
            if (data.phone) {
                const phoneDigits = data.phone.replace(/\D/g, ''); // strip spaces/dashes
                if (!phoneDigits.startsWith('0') || phoneDigits.length !== 10) {
                    showNotification("Invalid Phone Number", "Phone must start with '0' and be 10 digits (e.g. 0612345678).", "error");
                    setSaving(false);
                    isSavingRef.current = false;
                    return;
                }
            }
        }

        // Step 2: Media Validation (Cover Photo + Minimum 5 Gallery Photos - MANDATORY)
        // Note: Menu is OPTIONAL
        if (currentStep === 2) {
            const mediaErrors = [];

            // Cover Photo is MANDATORY
            if (!data.coverImageUrl || !data.coverImageUrl.trim()) {
                mediaErrors.push("Cover Photo is REQUIRED - This will be the main image shown on your venue card");
            }

            // Minimum 5 gallery items is MANDATORY
            if (gallery.length < 5) {
                mediaErrors.push(`Gallery must have at least 5 photos/videos (you have ${gallery.length})`);
            }

            if (mediaErrors.length > 0) {
                showNotification(
                    "⚠️ Media Required",
                    `You cannot proceed until you complete these requirements:\n\n• ${mediaErrors.join('\n• ')}\n\n(Menu upload is optional)`,
                    "error"
                );
                setSaving(false);
                isSavingRef.current = false;
                return;
            }
        }

        // Step 3: Category-Dependent Validation (Vibe & Atmosphere)
        if (currentStep === 3) {
            const category = data.category || '';
            const missingFields: string[] = [];

            // Get requirements based on category
            if (category === 'CAFE') {
                // Café requires: Cuisine + Vibe
                if (!selectedCuisines || selectedCuisines.length === 0) {
                    missingFields.push("Cuisine (at least 1 required for Café)");
                }
                if (!selectedVibes || selectedVibes.length === 0) {
                    missingFields.push("Vibe/Atmosphere (at least 1 required for Café)");
                }
            } else if (category === 'RESTAURANT') {
                // Restaurant requires: Cuisine only
                if (!selectedCuisines || selectedCuisines.length === 0) {
                    missingFields.push("Cuisine (at least 1 required for Restaurant)");
                }
            } else if (category === 'NIGHTLIFE_BARS' || category === 'CLUBS_PARTY') {
                // Nightlife/Clubs require: Vibe + Music
                if (!selectedVibes || selectedVibes.length === 0) {
                    missingFields.push("Vibe/Atmosphere (at least 1 required for " + category + ")");
                }
                if (!selectedMusic || selectedMusic.length === 0) {
                    missingFields.push("Music Type (at least 1 required for " + category + ")");
                }
            }
            // Events, Activities & Fun, Wellness & Health: No mandatory fields

            if (missingFields.length > 0) {
                showNotification(
                    "⚠️ Required for " + category,
                    `Please complete the following fields:\n\n• ${missingFields.join('\n• ')}`,
                    "error"
                );
                setSaving(false);
                isSavingRef.current = false;
                return;
            }
        }

        // Step 4: Reservation & Policies Validation
        if (currentStep === 4 || nextStep === undefined) {
            const step4Errors = [];

            // 1. Mandatory Policies
            if (!data.dressCode) step4Errors.push("Dress Code is required");
            if (!data.agePolicy) step4Errors.push("Age Policy is required");
            if (!selectedPayments || selectedPayments.length === 0) step4Errors.push("At least one Payment Method is required");

            // 2. Conditional Reservation Fields
            if (data.reservationPolicy === 'PHONE_WHATSAPP') {
                if (!data.reservationPhoneNumber || data.reservationPhoneNumber.length < 5) {
                    step4Errors.push("Phone Number is required for Phone/WhatsApp bookings");
                }
            }
            if (data.reservationPolicy === 'EXTERNAL_LINK') {
                if (!data.reservationUrl || data.reservationUrl.length < 5) { // Basic length check
                    step4Errors.push("Booking URL is required for External Website bookings");
                }
            }

            if (step4Errors.length > 0) {
                showNotification(
                    "Missing Details",
                    `Please complete the following:\n\n• ${step4Errors.join('\n• ')}`,
                    "warning"
                );
                setSaving(false);
                isSavingRef.current = false;
                return;
            }
        }

        let currentScenes = floorPlanScenes;
        // Step 5: Upload Scenes if needed
        if (currentStep === 5) {
            try {
                const updatedScenes = await Promise.all(floorPlanScenes.map(async (scene) => {
                    if (scene.image && scene.image.startsWith('blob:')) {
                        const file = await fetch(scene.image).then(r => r.blob());
                        const url = await uploadSceneImage(file);
                        return { ...scene, image: url };
                    }
                    return scene;
                }));
                currentScenes = updatedScenes;
                setFloorPlanScenes(updatedScenes); // Update state to reflect uploaded URLs
            } catch (e) {
                console.error("Scene Upload Error", e);
                alert("Failed to upload floor plan images.");
                setSaving(false);
                return;
            }
        }

        // Prepare Payload
        // Prepare Payload
        let finalPhone = "";
        if (data.phone) {
            // Strip spaces first
            const rawPhone = data.phone.trim().replace(/\s+/g, "");
            // If it starts with 0 (e.g. 06...), remove it before adding prefix (e.g. +212)
            // So +212 + 06... becomes +212 6...
            const phoneWithoutLeadingZero = rawPhone.startsWith("0") ? rawPhone.substring(1) : rawPhone;
            finalPhone = `${data.phonePrefix} ${phoneWithoutLeadingZero}`;
        }

        const submitData = {
            ...data,
            // Combine Prefix & Phone for backend
            phone: finalPhone,

            // Construct schedule items
            startHour: data.timeStart,
            endHour: data.timeEnd,
            openingDays: getDaysRange(data.dayStart, data.dayEnd),
            openingHours: `${data.timeStart} - ${data.timeEnd}`, // Legacy/Display format

            // Mapping Socials
            instagramUrl: data.instagram,
            // tiktokUrl and wazeUrl are directly on data

            media: gallery,
            menus: menuGallery,
            cuisines: selectedCuisines,
            vibes: selectedVibes,
            music: selectedMusic,
            facilities: selectedFacilities,
            paymentMethods: selectedPayments,
            floorPlan: {
                enabled: enableFloorPlan,
                scenes: currentScenes
            }
        };

        try {
            let currentId = venueId;
            if (!currentId) {
                // Determine if we need to create first
                if (data.name && data.category) {
                    const formData = new FormData();
                    formData.append("name", data.name);
                    formData.append("category", data.category);
                    const res = await createVenueDraft(null, formData);
                    if (res?.venueId) {
                        setVenueId(res.venueId);
                        currentId = res.venueId;

                        // 1. Save Data IMMEDIATELY (Before any nav)
                        await updateVenueStep(res.venueId, submitData);

                        // NOTE: We intentionally do NOT update the URL here
                        // Updating the URL triggers useSearchParams to re-evaluate,
                        // which can cause the component to re-render and reset state.
                        // The venue ID is stored in React state only during this session.
                    }
                }
            } else {
                await updateVenueStep(currentId, submitData);
            }

            if (nextStep) {
                if (nextStep > TOTAL_STEPS) {
                    router.push(`/business/dashboard?success=venue-created`);
                } else {
                    setCurrentStep(nextStep);
                }
            }
        } catch (error) {
            console.error("Save error:", error);
            showNotification("Save Failed", "Failed to save. Please try again.", "error");
        } finally {
            setSaving(false);
            isSavingRef.current = false;
            setIsDirty(false);
        }
    }

    // --- Steps Rendering ---
    const visualMedia = gallery.filter(m => m.type === 'image' || m.type === 'video');
    const subcategoriesMap = TAXONOMY.SUBCATEGORIES as Record<string, string[]>;
    const currentSubcategories = subcategoriesMap[data.category] || [];

    // Neighborhoods Logic
    const availableNeighborhoods = CITY_NEIGHBORHOODS[data.city] || [];

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#0a0a0a] to-black text-white flex flex-col">

            {/* Custom Notification Modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={closeNotification}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />

            {/* Top Bar (Progress) */}
            <div className="sticky top-0 bg-black/40 backdrop-blur-md border-b border-white/5 z-50 supports-[backdrop-filter]:bg-black/20">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()} className="text-zinc-400 hover:text-white flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5" />
                            {currentStep === 1 ? 'Exit' : 'Back'}
                        </button>

                        {/* Interactive Stepper */}
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <button
                                    key={step}
                                    onClick={() => {
                                        // Only allow jumping if we have a venueId (draft started)
                                        if (venueId) handleSaveStep(step);
                                    }}
                                    disabled={!venueId}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                        ${currentStep === step
                                            ? 'bg-white text-black scale-110 shadow-lg'
                                            : step < currentStep
                                                ? 'bg-zinc-800 text-green-500 hover:bg-zinc-700'
                                                : 'bg-zinc-900 text-zinc-600 hover:bg-zinc-800'
                                        }
                                    `}
                                >
                                    {step < currentStep ? <Check className="w-3.5 h-3.5" /> : step}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => handleSaveStep(currentStep + 1)} disabled={saving} className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50">
                            {saving ? 'Saving...' : (currentStep === TOTAL_STEPS ? 'Finish' : 'Next Step')}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 w-full mx-auto p-6 pb-20 transition-all duration-500 ${currentStep === 5 ? 'max-w-[95%]' : 'max-w-4xl'}`}>

                {/* STEP 1: ESSENTIALS */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold">Let's start with the basics</h1>
                            <p className="text-zinc-400">Where is your venue located and how can people contact you?</p>
                        </div>

                        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 space-y-6">
                            {/* Basics */}
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Venue Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.name} onChange={e => updateField("name", e.target.value)}
                                    placeholder="e.g. Rick's Café"
                                    className="w-full bg-transparent border-b border-zinc-700 text-2xl font-bold py-2 outline-none focus:border-indigo-500 placeholder-zinc-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Primary Category <span className="text-red-500">*</span></label>
                                    <select
                                        value={data.category} onChange={e => updateField("category", e.target.value)}
                                        className="w-full bg-zinc-800 rounded-lg p-3 outline-none focus:ring-2 ring-indigo-500"
                                    >
                                        <option value="">Select Category...</option>
                                        {CATEGORIES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Subcategory <span className="text-red-500">*</span></label>
                                    <select
                                        value={data.subcategory} onChange={e => updateField("subcategory", e.target.value)}
                                        className="w-full bg-zinc-800 rounded-lg p-3 outline-none focus:ring-2 ring-indigo-500 disabled:opacity-50"
                                        disabled={!currentSubcategories.length}
                                    >
                                        <option value="">Select specific type...</option>
                                        {currentSubcategories.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* Location (City & Neighborhood) */}
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Location <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <select
                                        value={data.city} onChange={e => {
                                            updateField("city", e.target.value);
                                            updateField("neighborhood", ""); // Reset neighborhood on city change
                                        }}
                                        className="bg-zinc-800 rounded-lg p-3 outline-none"
                                    >
                                        <option value="">Select City...</option>
                                        {moroccanCities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>

                                    {availableNeighborhoods.length > 0 ? (
                                        <select
                                            value={data.neighborhood} onChange={e => updateField("neighborhood", e.target.value)}
                                            className="bg-zinc-800 rounded-lg p-3 outline-none"
                                        >
                                            <option value="">Select Neighborhood...</option>
                                            {availableNeighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type="text" placeholder="Neighborhood"
                                            value={data.neighborhood} onChange={e => updateField("neighborhood", e.target.value)}
                                            className="bg-zinc-800 rounded-lg p-3 outline-none"
                                        />
                                    )}
                                </div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-2 mt-3">Street Address <span className="text-red-500">*</span></label>
                                <input
                                    type="text" placeholder="Full Street Address"
                                    value={data.address} onChange={e => updateField("address", e.target.value)}
                                    className="w-full bg-zinc-800 rounded-lg p-3 outline-none mb-3"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1">
                                        <MapPin className="w-5 h-5 text-indigo-400" />
                                        <input
                                            type="text"
                                            placeholder="Google Maps Link"
                                            value={data.locationUrl} onChange={e => updateField("locationUrl", e.target.value)}
                                            className="w-full bg-transparent border-none text-sm py-2 outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1">
                                        <Map className="w-5 h-5 text-blue-400" />
                                        <input
                                            type="text"
                                            placeholder="Waze Link (optional)"
                                            value={data.wazeUrl} onChange={e => updateField("wazeUrl", e.target.value)}
                                            className="w-full bg-transparent border-none text-sm py-2 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* Contact & Hours */}
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Contact & Schedule <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1">
                                        <Phone className="w-5 h-5 text-green-400" />

                                        {/* Phone Prefix Select */}
                                        <select
                                            value={data.phonePrefix}
                                            onChange={e => updateField("phonePrefix", e.target.value)}
                                            className="bg-transparent text-sm border-r border-zinc-600 pr-2 mr-2 outline-none font-mono text-zinc-300 [&>option]:bg-zinc-900 [&>option]:text-white"
                                        >
                                            {phoneCodes.map(c => (
                                                <option key={c.code} value={c.dialCode} className="bg-zinc-900 text-white">{c.flag} {c.dialCode}</option>
                                            ))}
                                        </select>

                                        <input
                                            type="tel" placeholder="06..."
                                            value={data.phone} onChange={e => updateField("phone", e.target.value)}
                                            className="w-full bg-transparent border-none text-sm py-2 outline-none"
                                            maxLength={10}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1">
                                        <Mail className="w-5 h-5 text-yellow-400" />
                                        <input
                                            type="email" placeholder="Contact Email"
                                            value={data.email} onChange={e => updateField("email", e.target.value)}
                                            className="w-full bg-transparent border-none text-sm py-2 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="bg-zinc-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

                                    {/* Days */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">From Day <span className="text-red-500">*</span></label>
                                            <select
                                                value={data.dayStart} onChange={e => updateField("dayStart", e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm outline-none"
                                            >
                                                <option value="">Select...</option>
                                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-500 mt-5" />
                                        <div className="flex-1">
                                            <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">To Day <span className="text-red-500">*</span></label>
                                            <select
                                                value={data.dayEnd} onChange={e => updateField("dayEnd", e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm outline-none"
                                            >
                                                <option value="">Select...</option>
                                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Hours */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Open At <span className="text-red-500">*</span></label>
                                            <select
                                                value={data.timeStart} onChange={e => updateField("timeStart", e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm outline-none"
                                            >
                                                <option value="">Select...</option>
                                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-500 mt-5" />
                                        <div className="flex-1">
                                            <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Close At <span className="text-red-500">*</span></label>
                                            <select
                                                value={data.timeEnd} onChange={e => updateField("timeEnd", e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm outline-none"
                                            >
                                                <option value="">Select...</option>
                                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* Tagline & Description */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Tagline</label>
                                    <input
                                        type="text" placeholder="Short & Catchy (e.g. Best Sunset View in Town)"
                                        value={data.tagline} onChange={e => updateField("tagline", e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Description</label>
                                    <textarea
                                        placeholder="Tell the story of your venue..."
                                        rows={4}
                                        value={data.description} onChange={e => updateField("description", e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* Online Presence */}
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-4">Online Presence</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-xl p-3">
                                        <Globe className="w-5 h-5 text-zinc-500" />
                                        <input
                                            type="url" placeholder="Website URL"
                                            value={data.website} onChange={e => updateField("website", e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-xl p-3">
                                        <Instagram className="w-5 h-5 text-pink-500" />
                                        <input
                                            type="text" placeholder="Instagram handle"
                                            value={data.instagram} onChange={e => updateField("instagram", e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-xl p-3">
                                        <Zap className="w-5 h-5 text-cyan-400" />
                                        <input
                                            type="text" placeholder="TikTok handle"
                                            value={data.tiktokUrl} onChange={e => updateField("tiktokUrl", e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* STEP 2: LOOKS & DESC */}
                {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold">Make it look good</h1>
                            <p className="text-zinc-400">Upload your best photos to attract guests.</p>
                            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl inline-block">
                                <p className="text-amber-400 text-sm font-medium">
                                    <span className="text-red-500">*</span> Required: Cover Photo + Minimum 5 Gallery Images
                                </p>
                                <p className="text-zinc-500 text-xs mt-1">Menu upload is optional</p>
                            </div>
                        </div>

                        {/* Cover */}
                        {/* Cover Loader */}
                        {/* Cover & Preview */}
                        <div className="flex flex-col items-center gap-6">
                            {/* Cropper Modal (Conditional) */}
                            {coverCropState && (
                                <ImageCropper
                                    imageSrc={coverCropState.src}
                                    onCancel={() => setCoverCropState(null)}
                                    onCropComplete={onCoverCropComplete}
                                    aspect={3 / 2}
                                />
                            )}

                            <div className="relative group w-full max-w-sm mx-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] opacity-75 group-hover:opacity-100 transition duration-500 blur"></div>

                                {/* Interactive Card Container */}
                                <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">

                                    {/* Image Area (Click to Upload) */}
                                    <label className="relative block aspect-[3/2] w-full overflow-hidden bg-zinc-800 cursor-pointer group/image">
                                        {data.coverImageUrl ? (
                                            <img
                                                src={data.coverImageUrl}
                                                alt={data.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover/image:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-white/20 bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                                                <div className="flex flex-col items-center gap-2">
                                                    <ImageIcon className="w-12 h-12 text-white/20" />
                                                    <span className="text-white/30 font-bold uppercase tracking-widest text-sm">Upload Cover</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                            <div className="flex flex-col items-center gap-2 transform translate-y-4 group-hover/image:translate-y-0 transition-transform">
                                                <div className="p-3 bg-white rounded-full text-black shadow-lg">
                                                    <Upload className="w-6 h-6" />
                                                </div>
                                                <span className="text-white font-bold text-xs uppercase tracking-wider">Change Photo</span>
                                            </div>
                                        </div>

                                        {/* Input */}
                                        <input type="file" className="hidden" accept="image/*" onChange={onSelectCoverFile} />

                                        {/* Floating Badges (Non-interactive) */}
                                        <div className="absolute top-3 left-3 pointer-events-none">
                                            <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                                                {TAXONOMY.CATEGORIES.find(c => c.value === data.category)?.label || (typeof data.category === 'string' ? data.category : "")}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium backdrop-blur-md border border-white/10 text-white pointer-events-none">
                                            <span>★</span> 5.0
                                        </div>
                                    </label>

                                    {/* Card Content (Preview Only) */}
                                    <div className="p-5 pointer-events-none select-none">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="text-lg font-bold text-white line-clamp-1">{data.name || "Venue Name"}</h3>
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/50">
                                            <span>{typeof data.city === 'string' ? data.city : ""}</span>
                                            <span>•</span>
                                            <span className="text-white/80 font-medium">{selectedVibes?.[0] || selectedCuisines?.[0] || "Vibe"}</span>
                                        </div>

                                        <div className="mt-4 flex items-center gap-2 text-sm text-white/50">
                                            <span className="font-semibold text-white">Réserver</span>
                                            <span>→</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-zinc-500 text-sm max-w-md text-center">
                                Click the image above to upload your cover photo. This is exactly how your venue will appear on the explore page.
                            </p>

                            {/* Preview Side Redundant */}
                            <div className="hidden">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Live Preview</span>
                                </h3>

                                <div className="pointer-events-none select-none transform scale-100 origin-top-left">
                                    {/* Replicated VenueCard Structure */}
                                    <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                                        {/* Image Container */}
                                        <div className="relative aspect-[3/2] w-full overflow-hidden bg-white/5">
                                            {data.coverImageUrl ? (
                                                <img
                                                    src={data.coverImageUrl}
                                                    alt={data.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-white/20 bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                                                    <span className="text-4xl text-white/10 font-bold">AGORA</span>
                                                </div>
                                            )}

                                            {/* Badge overlay */}
                                            <div className="absolute top-3 left-3">
                                                <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                                                    {TAXONOMY.CATEGORIES.find(c => c.value === data.category)?.label || (typeof data.category === 'string' ? data.category : "")}
                                                </span>
                                            </div>
                                            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium backdrop-blur-md border border-white/10 text-white">
                                                <span>★</span> 5.0
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-lg font-bold text-white line-clamp-1">{data.name || "Venue Name"}</h3>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/50">
                                                <span>{typeof data.city === 'string' ? data.city : ""}</span>
                                                <span>•</span>
                                                <span className="text-white/80 font-medium">{selectedVibes?.[0] || selectedCuisines?.[0] || "General"}</span>
                                            </div>

                                            <div className="mt-4 flex items-center gap-2 text-sm text-white/50">
                                                <span className="font-semibold text-white">Réserver</span>
                                                <span>→</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* End Replicated Card */}
                                </div>
                            </div>
                        </div>

                        {/* Gallery */}
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                Gallery <span className="text-red-500">*</span>
                                <span className={`text-sm font-normal ${gallery.length >= 5 ? 'text-green-400' : 'text-amber-400'}`}>
                                    ({gallery.length}/5 minimum)
                                    {gallery.length >= 5 ? ' ✓' : ''}
                                </span>
                            </h3>
                            <p className="text-zinc-500 text-xs mb-4">Upload at least 5 high-quality photos of your venue</p>
                            <MediaUpload
                                initialMedia={gallery}
                                onChange={(g: any) => { setGallery(g); setIsDirty(true); }}
                                maxFiles={15}
                                allowedFormats={['image', 'video']}
                                title="Gallery"
                                description="High quality photos and videos"
                            />
                        </div>

                        {/* Menu Upload */}
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                Digital Menu
                            </h3>
                            <MediaUpload
                                initialMedia={menuGallery}
                                onChange={(g: any) => { setMenuGallery(g); setIsDirty(true); }}
                                maxFiles={10}
                                allowedFormats={['image', 'pdf']}
                                title="Upload Menu"
                                description="Images (Multiple pages) or PDF (Max 3)"
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3: THE VIBE */}
                {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold">Set the Atmosphere</h1>
                            <p className="text-zinc-400">Help guests find exactly what they are looking for.</p>

                            {/* Category-specific requirements banner */}
                            {(data.category === 'CAFE' || data.category === 'RESTAURANT' || data.category === 'NIGHTLIFE_BARS' || data.category === 'CLUBS_PARTY') && (
                                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl inline-block">
                                    <p className="text-amber-400 text-sm font-medium">
                                        <span className="text-red-500">*</span> Required for {TAXONOMY.CATEGORIES.find(c => c.value === data.category)?.label || data.category}:
                                        {data.category === 'CAFE' && ' Cuisine + Vibe'}
                                        {data.category === 'RESTAURANT' && ' Cuisine'}
                                        {(data.category === 'NIGHTLIFE_BARS' || data.category === 'CLUBS_PARTY') && ' Vibe + Music Type'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Vibes */}
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-fuchsia-500" /> What's the Vibe?
                                    {(data.category === 'CAFE' || data.category === 'NIGHTLIFE_BARS' || data.category === 'CLUBS_PARTY') && (
                                        <span className="text-red-500">*</span>
                                    )}
                                    {selectedVibes.length > 0 && (
                                        <span className="text-xs text-green-400 font-normal">({selectedVibes.length} selected ✓)</span>
                                    )}
                                </h3>
                                <div className="flex flex-col gap-6">
                                    {(vibesExpanded ? Object.entries(TAXONOMY.VIBE_GROUPS) : Object.entries(TAXONOMY.VIBE_GROUPS).slice(0, 1)).map(([groupName, items]) => (
                                        <div key={groupName}>
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">{groupName}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map(a => (
                                                    <button key={a} onClick={() => toggleSelection(selectedVibes, setSelectedVibes, a)}
                                                        className={`px-4 py-2 rounded-full text-sm border transition-all ${selectedVibes.includes(a) ? 'bg-fuchsia-500 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(232,121,249,0.3)]' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                                                    >
                                                        {a}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {!vibesExpanded && (
                                        <button
                                            onClick={() => setVibesExpanded(true)}
                                            className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2 group"
                                        >
                                            <Sparkles className="w-4 h-4 text-fuchsia-500 group-hover:scale-110 transition-transform" />
                                            Show All Vibes
                                            <ChevronLeft className="w-4 h-4 -rotate-90 group-hover:translate-y-1 transition-transform" />
                                        </button>
                                    )}
                                    {vibesExpanded && (
                                        <button
                                            onClick={() => setVibesExpanded(false)}
                                            className="text-sm text-zinc-500 hover:text-white hover:underline self-center flex items-center gap-1 py-2"
                                        >
                                            Show Less <ChevronLeft className="w-3 h-3 rotate-90" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Music */}
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Music className="w-5 h-5 text-cyan-500" /> Music & Sounds
                                    {(data.category === 'NIGHTLIFE_BARS' || data.category === 'CLUBS_PARTY') && (
                                        <span className="text-red-500">*</span>
                                    )}
                                    {selectedMusic.length > 0 && (
                                        <span className="text-xs text-green-400 font-normal">({selectedMusic.length} selected ✓)</span>
                                    )}
                                </h3>
                                <div className="flex flex-col gap-6">
                                    {(musicExpanded ? Object.entries(TAXONOMY.MUSIC_GROUPS) : Object.entries(TAXONOMY.MUSIC_GROUPS).slice(1, 2)).map(([groupName, items]) => (
                                        // Default showing 'Electronic & Dance' or 'Live & Acoustic' based on typical preference, 
                                        // or maybe just the first one. Let's show the first two groups or just the first widely popular one?
                                        // Actually, let's show "Live & Acoustic" and "Electronic & Dance" (indices 0 and 1) or just index 0.
                                        // Let's show index 1 (Electronic) as default since it's very popular for venues, or let's show all if needed.
                                        // Let's stick to slice(0, 1) which is "Live & Acoustic" based on my taxonomy order.
                                        <div key={groupName}>
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">{groupName}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map(m => (
                                                    <button key={m} onClick={() => toggleSelection(selectedMusic, setSelectedMusic, m)}
                                                        className={`px-4 py-2 rounded-full text-sm border transition-all ${selectedMusic.includes(m) ? 'bg-cyan-500 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {!musicExpanded && (
                                        <button
                                            onClick={() => setMusicExpanded(true)}
                                            className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2 group"
                                        >
                                            <Music className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                                            Show All Music Styles
                                            <ChevronLeft className="w-4 h-4 -rotate-90 group-hover:translate-y-1 transition-transform" />
                                        </button>
                                    )}
                                    {musicExpanded && (
                                        <button
                                            onClick={() => setMusicExpanded(false)}
                                            className="text-sm text-zinc-500 hover:text-white hover:underline self-center flex items-center gap-1 py-2"
                                        >
                                            Show Less <ChevronLeft className="w-3 h-3 rotate-90" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Cuisines */}
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-orange-500" /> Cuisine & Food
                                    {(data.category === 'CAFE' || data.category === 'RESTAURANT') && (
                                        <span className="text-red-500">*</span>
                                    )}
                                    {selectedCuisines.length > 0 && (
                                        <span className="text-xs text-green-400 font-normal">({selectedCuisines.length} selected ✓)</span>
                                    )}
                                </h3>
                                <div className="flex flex-col gap-6">
                                    {(cuisinesExpanded ? Object.entries(TAXONOMY.CUISINE_GROUPS) : Object.entries(TAXONOMY.CUISINE_GROUPS).slice(0, 1)).map(([groupName, items]) => (
                                        <div key={groupName}>
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">{groupName}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map(c => (
                                                    <button key={c} onClick={() => toggleSelection(selectedCuisines, setSelectedCuisines, c)}
                                                        className={`px-4 py-2 rounded-full text-sm border transition-all ${selectedCuisines.includes(c) ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {!cuisinesExpanded && (
                                        <button
                                            onClick={() => setCuisinesExpanded(true)}
                                            className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2 group"
                                        >
                                            <Sparkles className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                                            Show All Food Categories
                                            <ChevronLeft className="w-4 h-4 -rotate-90 group-hover:translate-y-1 transition-transform" />
                                        </button>
                                    )}
                                    {cuisinesExpanded && (
                                        <button
                                            onClick={() => setCuisinesExpanded(false)}
                                            className="text-sm text-zinc-500 hover:text-white hover:underline self-center flex items-center gap-1 py-2"
                                        >
                                            Show Less <ChevronLeft className="w-3 h-3 rotate-90" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: OPERATIONS */}
                {currentStep === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold">Important Details</h1>
                            <p className="text-zinc-400">Socials, policies, and facilities.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Policies */}
                            {/* Left Column: Reservation Policy */}
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
                                <h3 className="font-bold text-lg mb-2">Booking & Reservations</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { value: "AGORA", label: "Agora Reservations", desc: "Guests receive a QR code. Verify & check-in directly from your dashboard.", icon: AgoraIcon },
                                            { value: "WALK_IN_ONLY", label: "No Reservations", desc: "First come, first served.", icon: ShieldCheck },
                                            { value: "PHONE_WHATSAPP", label: "Phone / WhatsApp", desc: "Accept bookings via Phone or WhatsApp.", icon: Phone },
                                            { value: "EXTERNAL_LINK", label: "External Website", desc: "Link to your own booking system.", icon: LinkIcon },
                                        ].map((opt) => (
                                            <div key={opt.value}>
                                                <div
                                                    onClick={() => {
                                                        updateField("reservationPolicy", opt.value);
                                                        if (opt.value === 'WALK_IN_ONLY') updateField("reservationsEnabled", false);
                                                        else updateField("reservationsEnabled", true);
                                                    }}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${data.reservationPolicy === opt.value ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'}`}
                                                >
                                                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${data.reservationPolicy === opt.value ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-400'}`}>
                                                        <opt.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold text-sm ${data.reservationPolicy === opt.value ? 'text-white' : 'text-zinc-300'}`}>{opt.label}</div>
                                                        <div className="text-xs text-zinc-500">{opt.desc}</div>
                                                    </div>
                                                    {data.reservationPolicy === opt.value && <div className="ml-auto w-4 h-4 rounded-full bg-indigo-500 border-2 border-black"></div>}
                                                </div>

                                                {/* Nested Input: Phone/WhatsApp */}
                                                {opt.value === 'PHONE_WHATSAPP' && data.reservationPolicy === 'PHONE_WHATSAPP' && (
                                                    <div className="mt-2 ml-14 animate-in fade-in slide-in-from-top-2 bg-zinc-800/50 p-4 rounded-xl border border-dashed border-indigo-500/30">
                                                        <label className="text-xs font-bold text-indigo-400 mb-1 block">WhatsApp / Phone Number <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={data.reservationPhoneNumber}
                                                            onChange={e => updateField("reservationPhoneNumber", e.target.value)}
                                                            placeholder="+212 6..."
                                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 placeholder:text-zinc-600"
                                                        />
                                                    </div>
                                                )}

                                                {/* Nested Input: External URL */}
                                                {opt.value === 'EXTERNAL_LINK' && data.reservationPolicy === 'EXTERNAL_LINK' && (
                                                    <div className="mt-2 ml-14 animate-in fade-in slide-in-from-top-2 bg-zinc-800/50 p-4 rounded-xl border border-dashed border-indigo-500/30">
                                                        <label className="text-xs font-bold text-indigo-400 mb-1 block">Booking URL <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="url"
                                                            value={data.reservationUrl}
                                                            onChange={e => updateField("reservationUrl", e.target.value)}
                                                            placeholder="https://..."
                                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 placeholder:text-zinc-600"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: House Rules (Dress Code, Age, Payments) */}
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-6 h-fit">
                                <h3 className="font-bold text-lg mb-2">House Rules</h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-400 block">Dress Code <span className="text-red-500">*</span></label>
                                        <select
                                            value={data.dressCode}
                                            onChange={e => updateField("dressCode", e.target.value)}
                                            className="w-full bg-zinc-800 rounded-xl p-3 text-sm outline-none border border-zinc-700 focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="">Select Dress Code...</option>
                                            {DRESS_CODES.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-400 block">Age Policy <span className="text-red-500">*</span></label>
                                        <select
                                            value={data.agePolicy}
                                            onChange={e => updateField("agePolicy", e.target.value)}
                                            className="w-full bg-zinc-800 rounded-xl p-3 text-sm outline-none border border-zinc-700 focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="">Select Age Policy...</option>
                                            {AGE_POLICIES.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-400 block">Payment Methods <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {PAYMENT_METHODS.map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => toggleSelection(selectedPayments, setSelectedPayments, p)}
                                                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${selectedPayments.includes(p) ? 'bg-green-600/20 border-green-500 text-green-500 font-medium' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Facilities Checklist */}
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold text-lg mb-4">Facilities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {FACILITIES.map(f => (
                                    <label key={f.code} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedFacilities.includes(f.code) ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'}`}>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedFacilities.includes(f.code) ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-600'}`}>
                                            {selectedFacilities.includes(f.code) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={selectedFacilities.includes(f.code)} onChange={() => toggleSelection(selectedFacilities, setSelectedFacilities, f.code)} />
                                        <span className={`text-sm ${selectedFacilities.includes(f.code) ? 'text-white font-medium' : 'text-zinc-400'}`}>{f.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: FLOOR PLAN */}
                {currentStep === 5 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
                        <div className="text-center space-y-4 max-w-2xl mx-auto mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Choose Your Reservation Experience</h1>
                            <p className="text-lg text-zinc-300">
                                Do you want to offer a quick, simple booking flow, or invite guests to a <span className="text-indigo-400 font-bold">Virtual Experience</span> where they can explore the venue and hand-pick their perfect table?
                            </p>
                        </div>

                        {!data.reservationsEnabled ? (
                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-12 text-zinc-500 bg-zinc-900/10">
                                <ShieldCheck className="w-16 h-16 mb-4 text-zinc-600" />
                                <h3 className="text-xl font-bold text-white mb-2">Reservations Disabled</h3>
                                <p className="mb-6">You've turned off reservations for this venue, so a floor plan isn't needed.</p>
                                <button
                                    onClick={() => updateField("reservationsEnabled", true)}
                                    className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform"
                                >
                                    Enable Reservations
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
                                    <button
                                        onClick={() => { setEnableFloorPlan(false); setIsDirty(true); }}
                                        className={`group relative p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${!enableFloorPlan
                                            ? 'bg-zinc-900 border-white text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                                            : 'bg-zinc-900/50 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:bg-zinc-900'}`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-full ${!enableFloorPlan ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'}`}>
                                                <Zap className="w-6 h-6" />
                                            </div>
                                            {!enableFloorPlan && <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">Selected</div>}
                                        </div>
                                        <h3 className={`text-xl font-bold mb-2 ${!enableFloorPlan ? 'text-white' : 'text-zinc-300'}`}>Simple Booking</h3>
                                        <p className="text-sm leading-relaxed opacity-80">
                                            The classic approach. Guests select a date, time, and party size. Fast, familiar, and efficient.
                                        </p>
                                    </button>

                                    <button
                                        onClick={() => { setEnableFloorPlan(true); setIsDirty(true); }}
                                        className={`group relative p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${enableFloorPlan
                                            ? 'bg-indigo-900/20 border-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                                            : 'bg-zinc-900/50 border-zinc-700 text-zinc-500 hover:border-indigo-500/50 hover:bg-indigo-900/10'}`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-full ${enableFloorPlan ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-indigo-600/50 group-hover:text-white'}`}>
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            {enableFloorPlan && <div className="px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">Recommended</div>}
                                        </div>
                                        <h3 className={`text-xl font-bold mb-2 ${enableFloorPlan ? 'text-white' : 'text-zinc-300'}`}>Immersive Virtual Tour</h3>
                                        <p className="text-sm leading-relaxed opacity-80">
                                            Wow your guests. Let them virtually navigate your venue and choose the exact table they want.
                                        </p>
                                    </button>
                                </div>

                                {enableFloorPlan ? (
                                    <div className="flex-1 min-h-[600px] border border-zinc-800 rounded-2xl overflow-hidden">
                                        <FloorPlanEditor
                                            initialScenes={floorPlanScenes}
                                            onSave={(scenes) => { setFloorPlanScenes(scenes); setIsDirty(true); }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-12 text-zinc-500">
                                        <CheckCircle2 className="w-16 h-16 mb-4 text-green-500" />
                                        <h3 className="text-xl font-bold text-white mb-2">You're all set!</h3>
                                        <p>Guests will book without selecting a specific table.</p>
                                        <p className="text-xs text-zinc-500 mt-4">Click "Next Step" to review.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
