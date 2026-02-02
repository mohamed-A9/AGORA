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
import TimePicker from "@/components/ui/TimePicker";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
    const [completedStep, setCompletedStep] = useState(0); // Highest step saved to DB
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


    // Persistence: Save ID & Step (write-only, for session continuity)
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

        console.log(`🔄 Hydrating venue data for ID: ${urlVenueId}`);

        getVenueDraft(urlVenueId).then((result) => {
            if (result && result.venue) {
                const v = result.venue as any;

                console.log(`📖 Loaded from DB: wizardStep=${v.wizardStep}`);

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
                let loadedSchedule = null;
                if (v.weeklySchedule && Array.isArray(v.weeklySchedule) && v.weeklySchedule.length === 7) {
                    loadedSchedule = v.weeklySchedule;
                }


                // Restore Step from DB if valid (but NOT if we're currently saving)
                if (!isSavingRef.current) {
                    console.log(`🔍 Processing wizardStep from DB: ${v.wizardStep}`);

                    if (v.wizardStep && v.wizardStep >= 1 && v.wizardStep <= TOTAL_STEPS) {
                        console.log(`✅ Setting currentStep to ${v.wizardStep} from database`);
                        setCurrentStep(v.wizardStep);
                        // If we're on step N, then steps 1 through N-1 are completed
                        const completed = Math.max(0, v.wizardStep - 1);
                        setCompletedStep(completed);
                        console.log(`✅ Setting completedStep to ${completed}`);
                    } else if (v.wizardStep && v.wizardStep > TOTAL_STEPS) {
                        // If finished, go to last step
                        console.log(`✅ Venue completed (step ${v.wizardStep}), going to step ${TOTAL_STEPS}`);
                        setCurrentStep(TOTAL_STEPS);
                        setCompletedStep(TOTAL_STEPS); // All steps completed
                    } else {
                        console.log(`⚠️ No valid wizardStep in DB (value: ${v.wizardStep}), staying at step 1`);
                        setCompletedStep(0); // Nothing completed yet
                    }
                } else {
                    console.log(`⏸️ Skipping step restoration (currently saving)`);
                }

                // Populate Form
                setData(prev => ({
                    ...prev,
                    name: v.name,
                    description: v.description || "",
                    address: v.address || "",
                    city: v.city?.name || "",
                    neighborhood: v.neighborhood || "",
                    tagline: v.tagline || "", // Populate Tagline
                    phone: loadedPhone,
                    phonePrefix: loadedPrefix,
                    email: v.email || "",
                    website: v.website || "",
                    instagram: v.instagramUrl || "",
                    tiktokUrl: v.tiktokUrl || "",
                    wazeUrl: v.wazeUrl || "",
                    locationUrl: v.locationUrl || "",

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

                // Populate Schedule
                if (loadedSchedule) {
                    setScheduleRows(loadedSchedule);
                    // Check if schedule is advanced (any day different from Mon, or strictly checks variation)
                    const first = loadedSchedule[0];
                    const isAdvanced = loadedSchedule.some((r: any) =>
                        r.open !== first.open || r.close !== first.close || r.closed !== first.closed
                    );
                    setIsAdvancedSchedule(isAdvanced);

                    // Try to detect simple start/end days
                    const openDays = loadedSchedule.filter((r: any) => !r.closed);
                    if (openDays.length > 0) {
                        setSimpleStartDay(openDays[0].day);
                        // Find last open day, handling wrap-around logic is hard here, so simpler heuristic:
                        // Just take the last one in the list for now.
                        setSimpleEndDay(openDays[openDays.length - 1].day);
                    }
                }

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

    // Schedule State: 7 Fixed Rows for Mon-Sun
    const [isAdvancedSchedule, setIsAdvancedSchedule] = useState(false);
    const [simpleStartDay, setSimpleStartDay] = useState("Mon");
    const [simpleEndDay, setSimpleEndDay] = useState("Sun");

    const [scheduleRows, setScheduleRows] = useState<any[]>(() => {
        return DAYS.map(day => ({
            day: day,
            open: "09:00",
            close: "00:00",
            closed: false
        }));
    });

    const updateSimpleSchedule = (updates: { start?: string, end?: string, open?: string, close?: string, is24h?: boolean }) => {
        const sDay = updates.start || simpleStartDay;
        const eDay = updates.end || simpleEndDay;

        // If 24h is toggled ON, force 00:00 - 00:00 (next day) or 00:00-23:59.
        // Let's use 06:00 to 06:00 or just keep inputs as is but override logic? 
        // Best approach: updates.is24h sets time to "00:00" - "00:00" 

        let sTime = updates.open || scheduleRows.find(r => !r.closed)?.open || "09:00";
        let eTime = updates.close || scheduleRows.find(r => !r.closed)?.close || "00:00";

        if (updates.is24h) {
            sTime = "00:00";
            eTime = "00:00"; // Assuming 00:00 to 00:00 implies 24h cycle
        }

        // Update state helpers
        if (updates.start) setSimpleStartDay(updates.start);
        if (updates.end) setSimpleEndDay(updates.end);

        // Calculate indices
        const sIdx = DAYS.indexOf(sDay);
        const eIdx = DAYS.indexOf(eDay);

        const newRows = scheduleRows.map((row, idx) => {
            // Check if idx is in range
            let inRange = false;
            if (sIdx <= eIdx) {
                inRange = idx >= sIdx && idx <= eIdx;
            } else {
                inRange = idx >= sIdx || idx <= eIdx; // Wrap-around case
            }

            return {
                ...row,
                open: sTime,
                close: eTime,
                closed: !inRange
            };
        });

        setScheduleRows(newRows);
        setIsDirty(true);
    };

    const updateScheduleRow = (idx: number, field: string, value: any) => {
        const newRows = [...scheduleRows];
        newRows[idx][field] = value;
        setScheduleRows(newRows);
        setIsDirty(true);
    };

    const toggleClosed = (idx: number) => {
        const newRows = [...scheduleRows];
        newRows[idx].closed = !newRows[idx].closed;
        setScheduleRows(newRows);
        setIsDirty(true);
    };


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
    const onCoverCropComplete = async (croppedAreaPixels: any, rotation: number = 0) => {
        if (!coverCropState) return;
        try {
            const croppedBlob = await getCroppedImg(coverCropState.src, croppedAreaPixels, rotation);
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

    async function handleSaveStep(nextStep?: number) {
        setSaving(true);
        isSavingRef.current = true;

        // MANDATORY VALIDATION - ALWAYS RUNS (BUT ONLY WHEN MOVING FORWARD)
        // User cannot proceed until all required fields IF moving forward.
        // Moving backward is allowed to review previous steps.
        // ============================================

        const isMovingForward = nextStep === undefined || nextStep > currentStep;

        if (isMovingForward) {
            // Step 1: Validation (Mandatory Fields)
            if (currentStep === 1) {
                const missingFields = [];
                if (!data.name?.trim()) missingFields.push("Venue Name");
                if (!data.category) missingFields.push("Primary Category");
                if (!data.subcategory) missingFields.push("Subcategory");
                if (!data.city) missingFields.push("City");
                if (!data.address?.trim()) missingFields.push("Full Street Address");
                if (!data.phone?.trim()) missingFields.push("Phone Number");

                // Schedule Validation: At least one day must be open
                const hasOpenDays = scheduleRows.some(row => !row.closed);
                if (!hasOpenDays) {
                    missingFields.push("Opening Hours (Venue must be open at least one day)");
                }

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
                    // Café requires: Vibe only
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
        }

        // OPTIMIZATION: If we already have a venue ID (draft) and nothing changed,
        // just move to next step without saving/delay.
        // MOVED AFTER VALIDATION TO PREVENT JUMPING STEPS WITH INVALID DATA
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

        // Construct openingHours string
        // Format: "Mon: 09:00-22:00, Tue: Closed, ..." (Human Readable)
        const formattedHours = scheduleRows.map(row => {
            if (row.closed) return `${row.day}: Closed`;
            return `${row.day}: ${row.open} - ${row.close}`;
        }).join(", ");

        const submitData = {
            ...data,
            // Combine Prefix & Phone for backend
            phone: finalPhone,

            // Construct schedule items
            openingHours: formattedHours,
            weeklySchedule: scheduleRows,

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
            },
            // Send next step as the new wizard step (backend will ensure it only increases)
            wizardStep: nextStep ? nextStep : undefined
        };

        // DEBUG: Log what we're sending
        console.log(`🚀 Sending wizardStep=${submitData.wizardStep} (nextStep=${nextStep}, currentStep=${currentStep})`);

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
                    // Update completed step to be the one we just finished
                    if (currentStep > completedStep) {
                        setCompletedStep(currentStep);
                    }
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


            {/* Top Bar Removed as requested - Progress is now in the bottom bar */}

            {/* DEBUG BANNER - Remove after testing */}
            <div className="bg-yellow-500/20 border-b border-yellow-500 p-2 text-center text-xs font-mono">
                DEBUG: currentStep={currentStep} | completedStep={completedStep} | venueId={venueId}
            </div>

            {/* Main Content */}
            <div className={`flex-1 w-full mx-auto p-4 md:p-6 pb-20 transition-all duration-500 ${currentStep === 5 ? 'max-w-[95%]' : 'max-w-4xl'}`}>

                {/* STEP 1: ESSENTIALS */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold">Let's start with the basics</h1>
                            <p className="text-zinc-400">Where is your venue located and how can people contact you?</p>
                        </div>

                        <div className="bg-zinc-900/50 p-4 md:p-8 rounded-2xl border border-white/5 space-y-6">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                                <div className="bg-zinc-800 rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-semibold text-white">Opening Hours</h4>
                                        <div className="text-xs text-zinc-500 italic">Set your weekly schedule</div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Toggle */}
                                        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${isAdvancedSchedule ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">Daily Schedule</div>
                                                    <div className="text-xs text-zinc-500">Configure different hours for specific days</div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isAdvancedSchedule}
                                                    onChange={() => setIsAdvancedSchedule(!isAdvancedSchedule)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>

                                        {/* Content */}
                                        {isAdvancedSchedule ? (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                {scheduleRows.map((row, idx) => (
                                                    <div key={row.day} className={`flex flex-col md:flex-row gap-3 items-center bg-zinc-900/50 p-2 rounded-lg border ${row.closed ? 'border-red-900/20 opacity-60' : 'border-white/5'}`}>

                                                        {/* Day & Toggle */}
                                                        <div className="flex items-center justify-between w-full md:w-32">
                                                            <span className="font-semibold text-zinc-300 w-12 text-sm">{row.day}</span>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <div className={`w-8 h-4 rounded-full transition-colors relative ${!row.closed ? 'bg-indigo-600' : 'bg-zinc-600'}`}>
                                                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${!row.closed ? 'left-4.5' : 'left-0.5'}`} style={{ left: !row.closed ? 'calc(100% - 14px)' : '2px' }}></div>
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={!row.closed}
                                                                    onChange={() => toggleClosed(idx)}
                                                                />
                                                            </label>
                                                        </div>

                                                        <div className="hidden md:block w-px h-6 bg-white/10 mx-2"></div>

                                                        {/* Time Pickers */}
                                                        {row.closed ? (
                                                            <div className="flex-1 text-sm text-zinc-500 italic text-center md:text-left">
                                                                Closed
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 w-full animate-in fade-in">
                                                                {row.open === "00:00" && row.close === "00:00" ? (
                                                                    <div className="flex-1 flex items-center justify-center text-xs font-bold text-green-400 bg-green-900/20 px-3 py-2 rounded border border-green-900/50">
                                                                        OPEN 24 HOURS
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex flex-col gap-1 flex-1">
                                                                            <span className="sm:hidden text-[10px] text-zinc-500 font-bold uppercase">Open</span>
                                                                            <TimePicker
                                                                                value={row.open}
                                                                                onChange={(val) => updateScheduleRow(idx, 'open', val)}
                                                                                className="w-full"
                                                                            />
                                                                        </div>
                                                                        <span className="hidden sm:block text-zinc-500">-</span>
                                                                        <div className="flex flex-col gap-1 flex-1">
                                                                            <span className="sm:hidden text-[10px] text-zinc-500 font-bold uppercase">Close</span>
                                                                            <TimePicker
                                                                                value={row.close}
                                                                                onChange={(val) => updateScheduleRow(idx, 'close', val)}
                                                                                className="w-full"
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}

                                                                {/* 24h Toggle */}
                                                                <button
                                                                    onClick={() => {
                                                                        const is24h = row.open === "00:00" && row.close === "00:00";
                                                                        if (is24h) {
                                                                            updateScheduleRow(idx, 'open', "09:00");
                                                                            updateScheduleRow(idx, 'close', "00:00");
                                                                        } else {
                                                                            updateScheduleRow(idx, 'open', "00:00");
                                                                            updateScheduleRow(idx, 'close', "00:00");
                                                                        }
                                                                    }}
                                                                    className={`sm:ml-2 text-[10px] px-2 py-2 sm:py-1 rounded border transition-colors w-full sm:w-auto text-center ${row.open === "00:00" && row.close === "00:00"
                                                                        ? "bg-green-500/20 border-green-500/50 text-green-300"
                                                                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                                                                        }`}
                                                                >
                                                                    24h
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl flex flex-col md:flex-row items-center gap-6 animate-in fade-in">
                                                {/* Days Range - Expanded */}
                                                <div className="flex items-center gap-4 flex-1 w-full">
                                                    <div className="flex flex-col flex-1">
                                                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1">From <span className="text-red-500">*</span></label>
                                                        <select
                                                            value={simpleStartDay}
                                                            onChange={(e) => updateSimpleSchedule({ start: e.target.value })}
                                                            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg p-2.5 text-sm text-white outline-none"
                                                        >
                                                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col flex-1">
                                                        <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1">To <span className="text-red-500">*</span></label>
                                                        <select
                                                            value={simpleEndDay}
                                                            onChange={(e) => updateSimpleSchedule({ end: e.target.value })}
                                                            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg p-2.5 text-sm text-white outline-none"
                                                        >
                                                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Divider */}
                                                <div className="hidden md:block w-px h-12 bg-white/10"></div>

                                                {/* Hours - Expanded */}
                                                <div className="flex flex-col flex-1 w-full">
                                                    {/* Inputs Row with Open 24h inline */}
                                                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-opacity ${scheduleRows.find(r => !r.closed)?.open === "00:00" && scheduleRows.find(r => !r.closed)?.close === "00:00" ? 'opacity-50 pointer-events-none' : 'opacity-100'
                                                        }`}>
                                                        <div className="flex flex-col flex-1 w-full">
                                                            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Opens at <span className="text-red-500">*</span></label>
                                                            <TimePicker
                                                                className="w-full flex-1"
                                                                value={scheduleRows.find(r => !r.closed)?.open || "09:00"}
                                                                onChange={(val) => updateSimpleSchedule({ open: val })}
                                                            />
                                                        </div>

                                                        {/* Divider / Arrow */}
                                                        <div className="hidden sm:block text-zinc-500 font-medium pt-5">-</div>

                                                        <div className="flex flex-col flex-1 w-full">
                                                            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Closes at <span className="text-red-500">*</span></label>
                                                            <TimePicker
                                                                className="w-full flex-1"
                                                                value={scheduleRows.find(r => !r.closed)?.close || "22:00"}
                                                                onChange={(val) => updateSimpleSchedule({ close: val })}
                                                            />
                                                        </div>

                                                        {/* Open 24h toggle - inline on the right */}
                                                        <label className="flex items-center gap-1.5 cursor-pointer group whitespace-nowrap pt-5">
                                                            <div className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${scheduleRows.find(r => !r.closed)?.open === "00:00" && scheduleRows.find(r => !r.closed)?.close === "00:00"
                                                                ? "bg-green-500 border-green-500"
                                                                : "border-zinc-600 group-hover:border-zinc-500"
                                                                }`}>
                                                                {(scheduleRows.find(r => !r.closed)?.open === "00:00" && scheduleRows.find(r => !r.closed)?.close === "00:00") && <Check className="w-2 h-2 text-black" strokeWidth={4} />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={scheduleRows.find(r => !r.closed)?.open === "00:00" && scheduleRows.find(r => !r.closed)?.close === "00:00"}
                                                                onChange={(e) => updateSimpleSchedule({ is24h: e.target.checked })}
                                                            />
                                                            <span className="text-[10px] uppercase font-bold text-green-400 group-hover:text-green-300 selection:bg-none">24h</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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

                {/* STEP 2: VISUALS */}
                {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold">Showcase your Venue</h1>
                            <p className="text-zinc-400">Great photos are the #1 driver of new customers.</p>
                        </div>

                        {/* Cover Image */}
                        <div className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-indigo-400" />
                                Cover Image
                            </h3>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="relative w-full md:w-1/2 aspect-video bg-zinc-800 rounded-xl overflow-hidden border-2 border-dashed border-zinc-700 hover:border-indigo-500 transition-colors group">
                                    {data.coverImageUrl ? (
                                        <img src={data.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                                            <Upload className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-sm">Click to upload cover</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onSelectCoverFile}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {data.coverImageUrl && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="flex gap-2">
                                                <button className="bg-white text-black px-3 py-1.5 rounded-full text-sm font-bold">Change</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2 text-sm text-zinc-400">
                                    <p className="font-semibold text-white">Guidelines:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-1">
                                        <li>High resolution (1920x1080 recommended)</li>
                                        <li>Bright, well-lit space</li>
                                        <li>Horizontal orientation</li>
                                        <li>No text or logos overlaid</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Gallery */}
                        <div className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-pink-400" />
                                Gallery ({gallery.length})
                            </h3>
                            <MediaUpload
                                initialMedia={gallery}
                                onChange={setGallery}
                                maxFiles={20}
                            />
                            <p className="text-xs text-zinc-500 mt-2 text-center">Add at least 5 photos/videos of the interior, food, and atmosphere.</p>
                        </div>

                        {/* Menu */}
                        <div className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-yellow-400" />
                                Menu (Optional)
                            </h3>
                            <MediaUpload
                                initialMedia={menuGallery}
                                onChange={setMenuGallery}
                                maxFiles={5}
                                allowedFormats={['image', 'pdf']}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3: THE VIBE */}
                {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold">Define the Experience</h1>
                            <p className="text-zinc-400">Help people find you based on what they're looking for.</p>
                        </div>

                        {/* Cuisines */}
                        <div className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-white/5">
                            <button onClick={() => setCuisinesExpanded(!cuisinesExpanded)} className="w-full flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-orange-400" />
                                    Cuisine {data.category === 'RESTAURANT' && <span className="text-red-500">*</span>}
                                </h3>
                                <span className="text-xs text-zinc-500">{selectedCuisines.length} selected</span>
                            </button>
                            <div className="flex flex-wrap gap-2">
                                {CUISINES.slice(0, cuisinesExpanded ? undefined : 12).map(c => (
                                    <button
                                        key={c}
                                        onClick={() => toggleSelection(selectedCuisines, setSelectedCuisines, c)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all border ${selectedCuisines.includes(c)
                                            ? "bg-orange-500/20 text-orange-200 border-orange-500/50"
                                            : "bg-black/40 text-zinc-400 border-zinc-800 hover:border-orange-500/30"
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                                {!cuisinesExpanded && CUISINES.length > 12 && (
                                    <button onClick={() => setCuisinesExpanded(true)} className="px-4 py-2 rounded-full text-sm bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700">
                                        +{CUISINES.length - 12} more
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Vibes */}
                        <div className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-white/5">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    Vibe & Atmosphere {(data.category === 'CAFE' || data.category === 'NIGHTLIFE_BARS' || data.category === 'CLUBS_PARTY') && <span className="text-red-500">*</span>}
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {AMBIANCES.map(v => (
                                    <button
                                        key={v}
                                        onClick={() => toggleSelection(selectedVibes, setSelectedVibes, v)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all border ${selectedVibes.includes(v)
                                            ? "bg-purple-500/20 text-purple-200 border-purple-500/50"
                                            : "bg-black/40 text-zinc-400 border-zinc-800 hover:border-purple-500/30"
                                            }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Music */}
                        <div className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-white/5">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Music className="w-5 h-5 text-pink-400" />
                                    Music {(data.category === 'NIGHTLIFE_BARS' || data.category === 'CLUBS_PARTY') && <span className="text-red-500">*</span>}
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {MUSIC_STYLES.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => toggleSelection(selectedMusic, setSelectedMusic, m)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all border ${selectedMusic.includes(m)
                                            ? "bg-pink-500/20 text-pink-200 border-pink-500/50"
                                            : "bg-black/40 text-zinc-400 border-zinc-800 hover:border-pink-500/30"
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Facilities */}
                        <div className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-white/5">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Armchair className="w-5 h-5 text-emerald-400" />
                                    Facilities & Amenities
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {FACILITIES.map(f => (
                                    <button
                                        key={f.code}
                                        onClick={() => toggleSelection(selectedFacilities, setSelectedFacilities, f.code)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all border ${selectedFacilities.includes(f.code)
                                            ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/50"
                                            : "bg-black/40 text-zinc-400 border-zinc-800 hover:border-emerald-500/30"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: POLICIES */}
                {currentStep === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold">Policies & Booking</h1>
                            <p className="text-zinc-400">Set the rules and how people book with you.</p>
                        </div>

                        <div className="bg-zinc-900/50 p-4 md:p-8 rounded-2xl border border-white/5 space-y-6">
                            {/* Policies */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Dress Code <span className="text-red-500">*</span></label>
                                    <select
                                        value={data.dressCode} onChange={e => updateField("dressCode", e.target.value)}
                                        className="w-full bg-zinc-800 rounded-lg p-3 outline-none"
                                    >
                                        <option value="">Select Dress Code...</option>
                                        {DRESS_CODES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Age Policy <span className="text-red-500">*</span></label>
                                    <select
                                        value={data.agePolicy} onChange={e => updateField("agePolicy", e.target.value)}
                                        className="w-full bg-zinc-800 rounded-lg p-3 outline-none"
                                    >
                                        <option value="">Select Age Policy...</option>
                                        {AGE_POLICIES.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <label className="flex items-center gap-3 bg-zinc-800 p-4 rounded-xl flex-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.parkingAvailable}
                                        onChange={e => updateField("parkingAvailable", e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-indigo-600"
                                    />
                                    <span className="font-medium">Parking Available</span>
                                </label>
                                <label className="flex items-center gap-3 bg-zinc-800 p-4 rounded-xl flex-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.valetParking}
                                        onChange={e => updateField("valetParking", e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-indigo-600"
                                    />
                                    <span className="font-medium">Valet Service</span>
                                </label>
                            </div>

                            <hr className="border-white/5" />

                            {/* Payment Types */}
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-4">Payment Methods <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {PAYMENT_METHODS.map(method => (
                                        <label key={method} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedPayments.includes(method) ? 'bg-indigo-900/30 border-indigo-500/50 text-white' : 'bg-black/20 border-zinc-800 text-zinc-400'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedPayments.includes(method)}
                                                onChange={() => toggleSelection(selectedPayments, setSelectedPayments, method)}
                                            />
                                            <span className="text-sm">{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* Booking Configuration */}
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-4">Reservations</label>
                                <div className="bg-zinc-800 rounded-xl overflow-hidden p-1 flex mb-6">
                                    {[
                                        { id: 'AGORA', label: 'Use Agora System', icon: Sparkles },
                                        { id: 'PHONE_WHATSAPP', label: 'Phone / WhatsApp', icon: Phone },
                                        { id: 'EXTERNAL_LINK', label: 'External Website', icon: LinkIcon },
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => updateField("reservationPolicy", type.id)}
                                            className={`flex-1 flex gap-2 items-center justify-center py-3 rounded-lg text-sm font-bold transition-all ${data.reservationPolicy === type.id
                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                : 'hover:bg-zinc-700 text-zinc-400'
                                                }`}
                                        >
                                            <type.icon className="w-4 h-4" />
                                            {type.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Conditional Config */}
                                {data.reservationPolicy === 'AGORA' && (
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-4">
                                        <div className="p-2 bg-indigo-500/20 rounded-full">
                                            <Sparkles className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm mb-1">Smart Reservations</h4>
                                            <p className="text-zinc-400 text-xs">Agora will handle your bookings. You'll get notified in the dashboard and can manage tables, customer logs, and deposits automatically.</p>
                                        </div>
                                    </div>
                                )}

                                {data.reservationPolicy === 'PHONE_WHATSAPP' && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Booking Phone Number</label>
                                        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-700 focus-within:border-indigo-500">
                                            <Phone className="w-5 h-5 text-green-400" />
                                            <input
                                                type="text"
                                                placeholder="06..."
                                                value={data.reservationPhoneNumber}
                                                onChange={e => updateField("reservationPhoneNumber", e.target.value)}
                                                className="w-full bg-transparent border-none text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {data.reservationPolicy === 'EXTERNAL_LINK' && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-xs uppercase font-bold text-zinc-500 mb-2">Booking URL</label>
                                        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-700 focus-within:border-indigo-500">
                                            <LinkIcon className="w-5 h-5 text-blue-400" />
                                            <input
                                                type="url"
                                                placeholder="https://sevenrooms.com/..."
                                                value={data.reservationUrl}
                                                onChange={e => updateField("reservationUrl", e.target.value)}
                                                className="w-full bg-transparent border-none text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>
                )}

                {/* STEP 5: FLOOR PLAN */}
                {currentStep === 5 && (
                    <div className="space-y-4 animate-in fade-in h-full flex flex-col">
                        <div className="text-center space-y-1 mb-4">
                            <h1 className="text-2xl font-bold">Interactive Floor Plan</h1>
                            <p className="text-zinc-400 text-sm">Design your venue layout for immersive reservations.</p>
                        </div>

                        <div className="flex-1 bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden flex flex-col relative h-[600px] md:h-[700px]">
                            {!enableFloorPlan ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                                    <div className="max-w-md text-center space-y-4 p-8 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl">
                                        <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Map className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Enable Floor Plan?</h3>
                                        <p className="text-zinc-400 text-sm">Allow guests to choose their specific table. This boosts conversion by 30%.</p>
                                        <button
                                            onClick={() => { setEnableFloorPlan(true); setIsDirty(true); }}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
                                        >
                                            Enable Designer
                                        </button>
                                        <button
                                            onClick={() => handleSaveStep(6)} // Skip to finish
                                            className="text-zinc-500 hover:text-white text-sm"
                                        >
                                            Skip, use simple list view
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            {/* The Editor */}
                            <FloorPlanEditor
                                initialScenes={floorPlanScenes}
                                onSave={(scenes: any) => {
                                    setFloorPlanScenes(scenes);
                                    setIsDirty(true);
                                }}
                            />
                        </div>
                        {/* Helper for floor plan if needed */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => { setEnableFloorPlan(false); setIsDirty(true); }}
                                className="text-xs text-red-500 hover:text-red-400"
                            >
                                Disable Floor Plan (Reset)
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Cropper Modal */}
            {coverCropState && (
                <ImageCropper
                    imageSrc={coverCropState.src}
                    aspect={16 / 9}
                    onCropComplete={onCoverCropComplete}
                    onCancel={() => setCoverCropState(null)}
                />
            )}

            {/* Bottom Navigation Bar - Global (Visible on all screens) */}
            <div className="fixed bottom-0 left-0 w-full bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 p-4 z-50 flex items-center justify-between safe-area-pb">
                <button
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}
                    className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-bold text-sm active:scale-95 transition-transform hover:bg-zinc-700 scale-95 origin-left"
                >
                    {currentStep === 1 ? 'Exit' : 'Back'}
                </button>

                {/* Stepper Moved Here */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <button
                            key={step}
                            onClick={() => {
                                if (venueId) handleSaveStep(step);
                            }}
                            disabled={!venueId}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${currentStep === step
                                    ? 'bg-white text-black scale-110 shadow-lg'
                                    : step <= completedStep
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600' // Green for submitted/completed steps
                                        : 'bg-zinc-900 text-zinc-600 hover:bg-zinc-800'
                                }
                            `}
                        >
                            {step <= completedStep ? <Check size={14} strokeWidth={3} /> : step}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => handleSaveStep(currentStep + 1)}
                    disabled={saving}
                    className="px-8 py-3 rounded-xl bg-white text-black font-bold text-sm shadow-lg shadow-white/10 active:scale-90 transition-transform disabled:opacity-50 hover:bg-indigo-50 scale-95 origin-right"
                >
                    {saving ? 'Saving...' : (currentStep === TOTAL_STEPS ? 'Finish' : 'Next')}
                </button>
            </div>

        </div>
    );
}
