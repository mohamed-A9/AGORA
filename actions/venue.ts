"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createVenueDraft(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const tagline = formData.get("tagline") as string;
    const description = formData.get("description") as string;

    if (!name || !category) {
        return { error: "Name and Category are required." };
    }

    try {
        const venue = await prisma.venue.create({
            data: {
                name,
                category,
                tagline,
                description,
                city: "Pending",
                address: "",
                ownerId: (session.user as any).id as string,
                status: "DRAFT"
            }
        });
        return { success: true, venueId: venue.id };
    } catch (e: any) {
        console.error("Draft Error", e);
        return { error: `Failed to create draft: ${e.message}` };
    }
}

export async function updateVenueStep(venueId: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    try {
        await prisma.venue.update({
            where: { id: venueId, ownerId: (session.user as any).id as string },
            data: data
        });
        return { success: true };
    } catch (e: any) {
        console.error("Update Step Error:", e);
        return { error: `Update failed: ${e.message}` };
    }
}

const VenueSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    city: z.string().min(1, "City is required"),
    category: z.string().min(1, "Category is required"),
    address: z.string().optional(),
    locationUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    phone: z.string().optional(),
    reservationsEnabled: z.boolean().optional(),
    ambiance: z.string().optional(),
    musicStyle: z.string().optional(),
    openingHours: z.string().optional(),
    weeklySchedule: z.any().optional(),
    startDate: z.string().optional(), // Receive as string from form
    endDate: z.string().optional(),   // Receive as string from form
    eventTypes: z.array(z.string()).optional(),
    venueTypeId: z.number().optional(), // New field
    attributes: z.record(z.string(), z.any()).optional(), // Dynamic attributes
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

    // @ts-ignore - session.user.role is typed as any in auth.ts
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

    // Parse Weekly Schedule and Event Types
    let weeklySchedule = undefined;
    try {
        const ws = formData.get("weeklySchedule") as string;
        if (ws) weeklySchedule = JSON.parse(ws);
    } catch (e) { }

    let eventTypes: string[] = [];
    try {
        const et = formData.get("eventTypes") as string;
        if (et) eventTypes = JSON.parse(et);
    } catch (e) { }


    let attributes = {};
    try {
        const attr = formData.get("attributesJson") as string;
        if (attr) attributes = JSON.parse(attr);
    } catch (e) { }


    // Combine Opening Hours if provided separately
    let openingHours = formData.get("openingHours") as string;
    const opensAt = formData.get("opensAt") as string;
    const closesAt = formData.get("closesAt") as string;

    if (!openingHours && opensAt && closesAt) {
        openingHours = `${opensAt} - ${closesAt}`;
    }

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        city: formData.get("city"),
        category: formData.get("category"),
        address: formData.get("address"),
        locationUrl: formData.get("locationUrl"),
        website: formData.get("website"),
        phone: formData.get("phone"),
        reservationsEnabled: formData.get("reservationsEnabled") === "on",
        ambiance: formData.get("ambiance"),
        musicStyle: formData.get("musicStyle"),
        openingHours: openingHours,
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        weeklySchedule: weeklySchedule,
        eventTypes: eventTypes,
        venueTypeId: formData.get("venueTypeId") ? parseInt(formData.get("venueTypeId") as string) : undefined,
        attributes: attributes,
        media: mediaItems
    };

    const validated = VenueSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            error: "Validation failed",
            fieldErrors: validated.error.flatten().fieldErrors
        };
    }

    const data = validated.data;

    try {
        const newVenue = await prisma.venue.create({
            data: {
                name: data.name,
                description: data.description || "",
                city: data.city,
                category: data.category,
                venueTypeId: data.venueTypeId, // Save ID
                address: data.address || "",
                locationUrl: data.locationUrl || null,
                website: data.website || null,
                phone: data.phone || null,
                reservationsEnabled: data.reservationsEnabled ?? true,
                // ambiance: data.ambiance || null,
                // musicStyle: data.musicStyle || null,
                openingHours: data.openingHours || null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                weeklySchedule: data.weeklySchedule ?? undefined,
                // eventTypes: data.eventTypes ?? [],
                ownerId: userId,
                status: "PENDING", // Default status

                // Save Dynamic Attributes
                attributes: {
                    create: Object.entries(data.attributes || {}).map(([key, value]) => ({
                        field_key: key,
                        value_json: value as any
                    }))
                },

                media: {
                    create: data.media?.map(m => ({
                        url: m.url,
                        type: m.type
                    }))
                }
            }
        });

        revalidatePath("/business/dashboard");
    } catch (error) {
        console.error("Venue creation error:", error);
        return { error: "Failed to create venue in database." };
    }

    redirect("/business/dashboard");
}
