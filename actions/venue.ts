"use server";

import fs from 'fs';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sanitizeVenueData, sanitizeString } from "@/lib/sanitize";


export async function getVenueDraft(venueId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    const userId = (session.user as any).id;

    // Check if user owns venue (or is admin)
    const venue = await prisma.venue.findFirst({
        where: { id: venueId },
        include: {
            city: true,
            cuisines: { include: { cuisine: true } },
            vibes: { include: { vibe: true } },
            musicTypes: { include: { musicType: true } },
            facilities: { include: { facility: true } },
            subcategories: { include: { subcategory: true } },
            gallery: { orderBy: { sortOrder: 'asc' } }
        }
    });

    if (!venue) return { error: "Venue not found" };

    // Simple authorization check
    // We fetch role to be sure
    const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (venue.ownerId !== userId && dbUser?.role !== "ADMIN") {
        return { error: "Unauthorized access to this venue" };
    }

    return { venue };
}

export async function createVenueDraft(prevState: any, formData: FormData) {
    const logFile = 'venue_creation_log.txt';
    const timestamp = new Date().toISOString();

    try {
        const session = await getServerSession(authOptions);
        // Sanitize user input immediately
        const name = sanitizeString(formData.get("name") as string);
        const category = formData.get("category") as string; // Category is from predefined list
        const description = sanitizeString(formData.get("description") as string);

        fs.appendFileSync(logFile, `\n[${timestamp}] Attempt: Name="${name}", Cat="${category}"\n`);

        if (!session || !session.user) {
            fs.appendFileSync(logFile, `[${timestamp}] FAILED: Unauthorized (No Session)\n`);
            return { error: "Unauthorized" };
        }

        const userId = (session.user as any).id as string;
        fs.appendFileSync(logFile, `[${timestamp}] UserID: ${userId}\n`);

        if (!userId) {
            fs.appendFileSync(logFile, `[${timestamp}] FAILED: User ID missing in session\n`);
            return { error: "Authentication Error: User ID missing. Please log out and log in again." };
        }

        // ... rest of function


        // 1. CHECK FOR EXISTING DRAFT (Dup Check)
        fs.appendFileSync(logFile, `[${timestamp}] Checking DB for existing draft... (Owner=${userId}, Name=${name})\n`);
        const existingDraft = await prisma.venue.findFirst({
            where: {
                ownerId: userId,
                name: name,
                status: "DRAFT"
            },
            select: { id: true, name: true }
        });
        fs.appendFileSync(logFile, `[${timestamp}] DB Check Result: ${existingDraft ? existingDraft.id : "None"}\n`);

        if (existingDraft) {
            console.log(`✅ Found existing draft for "${name}" (${existingDraft.id}). Resuming...`);
            return { success: true, venueId: existingDraft.id, isExisting: true };
        }

        // 2. PREPARE DATA FOR CREATION
        console.log(`🔧 Creating NEW draft for "${name}"...`);

        // Safer Slug Generation
        // Handle Arabic or special chars by fallback to random if empty
        let safeSlugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (safeSlugBase.length < 2) safeSlugBase = "venue";
        const slug = `${safeSlugBase}-${Math.floor(Math.random() * 100000)}`;

        // Proper Category Handling
        // Input is likely "NIGHTLIFE_BARS" or "Nightlife & Bars"
        let mainCategoryInput = category.trim();
        // Try exact match first (if it's already an enum key)
        // If not, try to transform Label -> Enum
        if (mainCategoryInput === "Nightlife & Bars") mainCategoryInput = "NIGHTLIFE_BARS";
        else if (mainCategoryInput === "Clubs & Party") mainCategoryInput = "CLUBS_PARTY";
        else if (mainCategoryInput === "Activities & Fun") mainCategoryInput = "ACTIVITIES_FUN";
        else if (mainCategoryInput === "Wellness & Health") mainCategoryInput = "WELLNESS_HEALTH";

        // Final sanitization for Enum
        // transform "Nightlife & Bars" -> "NIGHTLIFE_&_BARS" (Invalid) -> Correct to "NIGHTLIFE_BARS" if needed
        let mainCategory = mainCategoryInput.toUpperCase().replace(/\s+/g, "_");

        // Specific Fixes for Prisma Enum Mismatches
        if (mainCategory === "NIGHTLIFE_&_BARS") mainCategory = "NIGHTLIFE_BARS";
        if (mainCategory === "CLUBS_&_PARTY") mainCategory = "CLUBS_PARTY";
        if (mainCategory === "ACTIVITIES_&_FUN") mainCategory = "ACTIVITIES_FUN";
        if (mainCategory === "WELLNESS_&_HEALTH") mainCategory = "WELLNESS_HEALTH";

        fs.appendFileSync(logFile, `[${timestamp}] About to create venue with Cat: ${mainCategory}, Slug: ${slug}\n`);

        const venue = await prisma.venue.create({
            data: {
                name,
                slug,
                mainCategory: mainCategory as any,
                description: description || "",
                ownerId: userId,
                status: "DRAFT",
                wizardStep: 1,
                isVerified: false,
                isActive: false
            }
        });

        console.log("✅ New Draft Created:", venue.id);
        fs.appendFileSync(logFile, `[${timestamp}] ✅ SUCCESS: Created ID ${venue.id}\n`);
        return { success: true, venueId: venue.id };

    } catch (e: any) {
        fs.appendFileSync(logFile, `[${timestamp}] ❌ ERROR: ${e.message}\n`);
        console.error("❌ Draft Creation Failed:", e);
        // Return clear error message to frontend
        return { error: `Creation failed: ${e.message}` };
    }
}

export async function updateVenueStep(venueId: string, data: any) {
    const logFile = 'venue_update_log.txt';
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `\n[${timestamp}] START Update: ID=${venueId}\n`);

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        fs.appendFileSync(logFile, `[${timestamp}] FAIL: Unauthorized\n`);
        return {
            error: "UNAUTHORIZED",
            message: "You must be logged in",
            statusCode: 401
        };
    }

    try {
        const userId = (session.user as any).id as string;
        const userRole = (session.user as any).role;

        // ============================================
        // PRE-FLIGHT CHECK: Verify venue exists
        // ============================================
        console.log(`🔍 [updateVenueStep] Checking if venue exists: ${venueId}`);

        const existingVenue = await prisma.venue.findUnique({
            where: { id: venueId },
            select: { id: true, ownerId: true, name: true, wizardStep: true }
        });

        if (!existingVenue) {
            fs.appendFileSync(logFile, `[${timestamp}] FAIL: Venue not found\n`);
            console.log(`❌ Venue not found in database: ${venueId}`);
            return {
                error: "VENUE_NOT_FOUND",
                message: "This venue draft no longer exists",
                statusCode: 404
            };
        }

        console.log(`📦 Venue found: ${existingVenue.name} (owner: ${existingVenue.ownerId})`);
        fs.appendFileSync(logFile, `[${timestamp}] Venue Found: ${existingVenue.name}\n`);


        // ============================================
        // OWNERSHIP CHECK (unless admin)
        // ============================================
        if (userRole !== "ADMIN" && existingVenue.ownerId !== userId) {
            console.log(`❌ Permission denied. User ${userId} is not owner of venue ${venueId}`);
            return {
                error: "NOT_OWNER",
                message: "You don't have permission to edit this venue",
                statusCode: 403
            };
        }

        console.log(`✅ Ownership verified. Proceeding with update...`);

        // ============================================
        // SANITIZE ALL INPUT DATA (Security)
        // ============================================
        // ============================================
        // SANITIZE ALL INPUT DATA (Security)
        // ============================================
        // Capture wizardStep BEFORE sanitization (in case sanitizer strips it)
        const rawWizardStep = data.wizardStep;

        const sanitizedData = sanitizeVenueData(data);

        // Prepare data for Prisma
        const updateData = { ...sanitizedData };
        delete updateData.tagline; // Not in schema

        // Parse wizardStep as integer (might come as string from frontend)
        let wizardStep: number | undefined = undefined;
        if (rawWizardStep !== undefined && rawWizardStep !== null) {
            const parsed = typeof rawWizardStep === 'string' ? parseInt(rawWizardStep) : rawWizardStep;
            if (!isNaN(parsed) && parsed > 0) {
                wizardStep = parsed;
                console.log(`✅ Parsed wizardStep: ${wizardStep}`);
            } else {
                console.log(`⚠️ Invalid wizardStep value: ${rawWizardStep}`);
            }
        }

        if (updateData.wizardStep) delete updateData.wizardStep; // Cleanup if it survived sanitization

        // Handle City Relation
        if (updateData.city) {
            const citySlug = updateData.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            updateData.city = {
                connectOrCreate: {
                    where: { name: updateData.city },
                    create: {
                        name: updateData.city,
                        slug: citySlug,
                        country: "Morocco"
                    }
                }
            };
        }

        // Category handling...
        if (updateData.category) {
            updateData.mainCategory = updateData.category.toUpperCase().replace(" ", "_");
            delete updateData.category;
        }

        // Handle subcategory relation
        // Handle subcategory relation
        if (updateData.subcategory !== undefined) {
            // First, clear existing subcategories
            // separate query to avoid complexity in the main update
            await prisma.venueSubcategory.deleteMany({
                where: { venueId: venueId }
            });

            if (updateData.subcategory && typeof updateData.subcategory === "string") {
                const subName = updateData.subcategory;
                const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                // Get Main Category
                let mainCategory = updateData.mainCategory;
                if (!mainCategory) {
                    const existingVenue = await prisma.venue.findUnique({
                        where: { id: venueId },
                        select: { mainCategory: true }
                    });
                    mainCategory = existingVenue?.mainCategory;
                }

                if (mainCategory) {
                    // Find or Create Subcategory independently
                    const subParams = {
                        name: subName,
                        slug: subSlug,
                        mainCategory: mainCategory
                    };

                    const subCat = await prisma.subcategory.upsert({
                        where: { slug: subSlug },
                        update: subParams,
                        create: subParams
                    });

                    // We will create the relation separately or add to update
                    // but since we are inside 'updateVenueStep', let's just do it here to ensure it works
                    await prisma.venueSubcategory.create({
                        data: {
                            venueId: venueId,
                            subcategoryId: subCat.id
                        }
                    });
                }
            }
            // Remove from main update payload to avoid conflict
            delete updateData.subcategories;
            delete updateData.subcategory;
        }

        // Handle Cuisines (Array/String)
        if (updateData.cuisines || updateData.cuisine) {
            const input = updateData.cuisines || updateData.cuisine;
            const rawItems = Array.isArray(input) ? input : (input ? [input] : []);

            // Deduplicate by slug
            const uniqueMap = new Map();
            rawItems.forEach((name: string) => {
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                if (slug && !uniqueMap.has(slug)) {
                    uniqueMap.set(slug, name);
                }
            });
            const items = Array.from(uniqueMap.values());

            updateData.cuisines = {
                deleteMany: {},
                create: items.map((name: string) => ({
                    cuisine: {
                        connectOrCreate: {
                            where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                            create: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
                        }
                    }
                }))
            };
            delete updateData.cuisine;
        }

        // Handle Vibes (Array/String)
        if (updateData.vibes || updateData.ambiance) {
            const input = updateData.vibes || updateData.ambiance;
            const rawItems = Array.isArray(input) ? input : (input ? [input] : []);

            // Deduplicate by slug
            const uniqueMap = new Map();
            rawItems.forEach((name: string) => {
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                if (slug && !uniqueMap.has(slug)) {
                    uniqueMap.set(slug, name);
                }
            });
            const items = Array.from(uniqueMap.values());

            updateData.vibes = {
                deleteMany: {},
                create: items.map((name: string) => ({
                    vibe: {
                        connectOrCreate: {
                            where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                            create: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
                        }
                    }
                }))
            };
            delete updateData.ambiance;
        }

        // Handle Facilities (Array)
        if (updateData.facilities) {
            const rawItems = Array.isArray(updateData.facilities) ? updateData.facilities : [updateData.facilities];
            const items = Array.from(new Set(rawItems)); // Deduplicate (Facilities use strict codes)

            updateData.facilities = {
                deleteMany: {},
                create: items.map((code: string) => ({
                    facility: {
                        connectOrCreate: {
                            where: { code: code },
                            create: { code: code, label: code.replace(/_/g, ' ') }
                        }
                    }
                }))
            };
        }

        // Handle Music (Array)
        if (updateData.music) {
            const rawItems = Array.isArray(updateData.music) ? updateData.music : [updateData.music];

            // Deduplicate by slug
            const uniqueMap = new Map();
            rawItems.forEach((name: string) => {
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                if (slug && !uniqueMap.has(slug)) {
                    uniqueMap.set(slug, name);
                }
            });
            const items = Array.from(uniqueMap.values());

            updateData.musicTypes = {
                deleteMany: {},
                create: items.map((name: string) => ({
                    musicType: {
                        connectOrCreate: {
                            where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                            create: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
                        }
                    }
                }))
            };
            delete updateData.music;
        }

        // Handle media/gallery and menus
        // We construct a single update operation for the 'gallery' relation
        const galleryUpdate: any = {};
        const mediaCreates: any[] = [];
        const menuCreates: any[] = [];
        const deleteConditions: any[] = [];

        // 1. Handle Gallery Media (Images/Videos)
        if (updateData.media !== undefined) {
            // We are updating the main gallery.
            // Mark existing gallery items (image/video) for deletion
            deleteConditions.push({ kind: { in: ['image', 'video'] } });

            if (Array.isArray(updateData.media) && updateData.media.length > 0) {
                updateData.media.forEach((m: any, idx: number) => {
                    mediaCreates.push({
                        url: m.url,
                        kind: m.type, // 'image' or 'video'
                        sortOrder: idx
                    });
                });
            }
            delete updateData.media;
        }

        // 2. Handle Menu Items (Menu Images/PDFs)
        if (updateData.menus !== undefined) {
            // We are updating the menus.
            // Mark existing menu items for deletion
            deleteConditions.push({ kind: { in: ['menu_image', 'menu_pdf'] } });

            if (Array.isArray(updateData.menus) && updateData.menus.length > 0) {
                updateData.menus.forEach((m: any, idx: number) => {
                    // Map type to menu_kind
                    // Frontend sends 'image' or 'pdf'. We map to 'menu_image' or 'menu_pdf'
                    let kind = 'menu_image';
                    if (m.type === 'pdf') kind = 'menu_pdf';
                    else if (m.type === 'image') kind = 'menu_image';

                    menuCreates.push({
                        url: m.url,
                        kind: kind,
                        sortOrder: idx
                    });
                });
            }
            delete updateData.menus;
        }

        // Apply if any updates needed
        if (deleteConditions.length > 0) {
            updateData.gallery = {
                deleteMany: {
                    OR: deleteConditions
                },
                create: [...mediaCreates, ...menuCreates]
            };
        }

        // Create structured weeklySchedule for persistence
        if (data.startHour || data.endHour || data.openingDays) {
            updateData.weeklySchedule = {
                startHour: data.startHour,
                endHour: data.endHour,
                openingDays: data.openingDays,
                // Add inferred dayStart/dayEnd for easier frontend hydration if useful
                dayStart: data.openingDays && data.openingDays.length > 0 ? data.openingDays[0] : undefined,
                dayEnd: data.openingDays && data.openingDays.length > 0 ? data.openingDays[data.openingDays.length - 1] : undefined
            };
        }

        // Handle Reservation Policy Logic
        if (updateData.reservationPolicy) {
            const policy = updateData.reservationPolicy;
            // Sync legacy boolean
            updateData.reservationsEnabled = (policy !== "WALK_IN_ONLY" && policy !== "NO_RESERVATION");
            // Note: Enum in DB is WALK_IN_ONLY, but guarding against potential frontend string mismatch if any
        }

        // Cleanup UI-only fields that are not in Schema
        delete updateData.phonePrefix;
        delete updateData.timeStart;
        delete updateData.timeEnd;
        delete updateData.dayStart;
        delete updateData.dayEnd;
        delete updateData.instagram; // Mapped to instagramUrl
        delete updateData.menuUrl; // Temporary fix until client generation works
        delete updateData.startHour;
        delete updateData.endHour;
        delete updateData.openingDays;

        // Cleanup Protected Fields
        delete updateData.id;
        delete updateData.ownerId;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // ============================================
        // UPDATE VENUE (ownership already verified in pre-flight check)
        // ============================================
        console.log("💾 Updating venue in database...");
        fs.appendFileSync(logFile, `[${timestamp}] Ready to Update DB...\n`);

        // DEBUG: Log wizardStep before update
        console.log(`📊 WizardStep Update: Current=${existingVenue.wizardStep}, New=${wizardStep}`);
        fs.appendFileSync(logFile, `[${timestamp}] WizardStep: ${existingVenue.wizardStep} -> ${wizardStep}\n`);

        const updatedVenue = await prisma.venue.update({
            where: { id: venueId }, // Ownership already verified above
            data: {
                ...updateData,
                // Always update wizardStep if provided (simplified for debugging)
                ...(wizardStep !== undefined && { wizardStep })
            }
        });

        console.log("✅ Venue updated successfully:", updatedVenue.id);

        revalidatePath("/business/my-venues");
        revalidatePath("/business/dashboard");
        revalidatePath("/dashboard");

        return { success: true };
    } catch (e: any) {
        console.error("❌ Update Step Error:", e);

        // Handle specific error: venue not found (shouldn't happen with pre-flight check)
        if (e.code === 'P2025') {
            console.error("❌ P2025 Error - Venue not found:", venueId);
            return {
                error: "VENUE_NOT_FOUND",
                message: "This venue draft no longer exists",
                statusCode: 404
            };
        }

        return {
            error: "UPDATE_FAILED",
            message: e.message || "Failed to update venue",
            statusCode: 500
        };
    }
}

const VenueSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    city: z.string().min(1, "City is required"),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().optional(),
    specialization: z.string().optional(),
    address: z.string().optional(),
    locationUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    wazeUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    menuUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    reservationsEnabled: z.boolean().optional(),
    ambiance: z.string().optional(),
    cuisine: z.string().optional(),
    musicStyle: z.string().optional(),
    openingHours: z.string().optional(),
    weeklySchedule: z.any().optional(),
    openingDays: z.array(z.string()).optional(),
    startHour: z.string().optional(),
    endHour: z.string().optional(),
    startDate: z.string().optional(), // Receive as string from form
    endDate: z.string().optional(),   // Receive as string from form
    eventTypes: z.array(z.string()).optional(),
    venueTypeId: z.number().optional(), // New field
    attributes: z.record(z.string(), z.any()).optional(), // Dynamic attributes
    hasDanceFloor: z.boolean().optional(),
    wheelchairAccessible: z.boolean().optional(),
    hasGlutenFreeOptions: z.boolean().optional(),
    hasSugarFreeOptions: z.boolean().optional(),
    hasSaltFreeOptions: z.boolean().optional(),
    hasBabyChairs: z.boolean().optional(),
    media: z.array(z.object({
        url: z.string().url(),
        type: z.enum(["image", "video", "pdf"])
    })).optional()
});

export async function createVenue(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { error: "Unauthorized" };
    }

    // @ts-ignore
    const role = session.user.role;
    // @ts-ignore
    const userId = (session.user as any).id;

    if (role !== "BUSINESS" && role !== "ADMIN") {
        return { error: "Forbidden: Only Business accounts can create venues" };
    }

    // Parse Media items from hidden input "mediaJson"
    const mediaJson = formData.get("mediaJson") as string;
    let mediaItems = [];
    try {
        if (mediaJson) {
            mediaItems = JSON.parse(mediaJson);
        }
    } catch (e) {
        return { error: "Invalid media data" };
    }

    // Simple Slugify
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + Math.floor(Math.random() * 10000);

    // Prepare Facilities
    const facilitiesToConnect = [];
    if (formData.get("wheelchairAccessible") === "on") facilitiesToConnect.push("DISABLED_ACCESS");
    if (formData.get("hasBabyChairs") === "on") facilitiesToConnect.push("BABY_CHAIR");
    // Add others if mapped in constants

    // Prepare Policies
    const policiesToConnect = [];
    if (formData.get("hasDanceFloor") === "on") {
        // Maybe dance floor is a facility or vibe? For now, let's skip/comment or assume it's a Tag? 
        // Schema doesn't have DANCE_FLOOR in Enum? Let's check. 
        // Assuming it's ok to skip strict mapping for now or map to a Tag if needed.
    }

    const rawCategory = formData.get("category") as string;
    // Ensure category matches Enum Uppercase
    const mainCategory = rawCategory.toUpperCase().replace(" ", "_"); // e.g. "Nightlife & Bars" -> "NIGHTLIFE_&_BARS" (Need to match exact ENUM)
    // Actually our TAXONOMY.CATEGORIES values are correct (e.g. "NIGHTLIFE_BARS"). 
    // We trust the form sends the Value, not the Label.

    const city = formData.get("city") as string;
    const subcategorySlug = (formData.get("subcategory") as string)?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cuisineSlug = (formData.get("cuisine") as string)?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const vibeSlug = (formData.get("ambiance") as string)?.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
        const newVenue = await prisma.venue.create({
            data: {
                name,
                // @ts-ignore
                slug,
                description: (formData.get("description") as string) || "",
                mainCategory: mainCategory as any, // Cast to any or Enum if imported

                // Location
                city: { connect: { name: city } } as any, // Cast to any (Stale types)
                address: (formData.get("address") as string) || "",
                locationUrl: (formData.get("locationUrl") as string) || null,

                // Contact
                website: (formData.get("website") as string) || null,
                phone: (formData.get("phone") as string) || null,

                // Relations
                // Connect subcategory if present
                subcategories: subcategorySlug ? {
                    create: {
                        subcategory: {
                            connect: { slug: subcategorySlug }
                        }
                    }
                } : undefined,

                // Connect cuisine if present
                cuisines: cuisineSlug ? {
                    create: {
                        cuisine: { connect: { slug: cuisineSlug } }
                    }
                } : undefined,

                // Connect vibe if present
                vibes: vibeSlug ? {
                    create: {
                        vibe: { connect: { slug: vibeSlug } }
                    }
                } : undefined,

                // Facilities
                facilities: facilitiesToConnect.length > 0 ? {
                    create: facilitiesToConnect.map(code => ({
                        facility: { connect: { code } }
                    }))
                } : undefined,

                // Media
                gallery: {
                    create: mediaItems.map((m: any, idx: number) => ({
                        url: m.url,
                        kind: m.type,
                        sortOrder: idx
                    }))
                },

                // Meta
                ownerId: userId,
                status: "PENDING"
            }
        });

        revalidatePath("/business/dashboard");
    } catch (error: any) {
        console.error("Venue creation error:", error);
        return { error: `Failed to create venue: ${error.message}` };
    }

    redirect("/business/dashboard");
}

export async function deleteVenue(venueId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    const userId = (session.user as any).id as string;

    try {
        // Fetch fresh user for role check
        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        const role = dbUser?.role || "USER";

        const whereClause = role === "ADMIN"
            ? { id: venueId }
            : { id: venueId, ownerId: userId };

        await prisma.venue.delete({
            where: whereClause
        });

        revalidatePath("/business/dashboard");
        return { success: true };
    } catch (e: any) {
        console.error("Delete Venue Error:", e);
        // Clean error message
        return { error: `Delete failed: ${e.message}` };
    }
}
