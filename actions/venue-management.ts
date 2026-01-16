"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const UpdateVenueSchema = z.object({
    id: z.string(),
    name: z.string().min(3),
    description: z.string().optional(),
    city: z.string().min(1),
    category: z.string().min(1),
    subcategory: z.string().optional(),
    specialization: z.string().optional(),
    address: z.string().optional(),
    locationUrl: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    phone: z.string().optional(),
    reservationsEnabled: z.boolean().optional(),
    ambiance: z.string().optional(),
    cuisine: z.string().optional(),
    musicStyle: z.string().optional(),
    openingHours: z.string().optional(),
    weeklySchedule: z.any().optional(),
    eventTypes: z.array(z.string()).optional(),
    venueTypeId: z.number().optional(),
    media: z.array(z.object({
        url: z.string().url(),
        type: z.enum(["image", "video", "pdf"])
    })).optional()
});

export async function updateVenue(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    const rawData = {
        id: formData.get("id"),
        name: formData.get("name"),
        description: formData.get("description"),
        city: formData.get("city"),
        category: formData.get("category"),
        subcategory: formData.get("subcategory") || undefined,
        specialization: formData.get("specialization") || undefined,
        address: formData.get("address"),
        locationUrl: formData.get("locationUrl") || undefined,
        website: formData.get("website") || undefined,
        phone: formData.get("phone") || undefined,
        reservationsEnabled: formData.get("reservationsEnabled") === "on",
        ambiance: formData.get("ambiance") || undefined,
        cuisine: formData.get("cuisine") || undefined,
        musicStyle: formData.get("musicStyle") || undefined,
        openingHours: formData.get("openingHours") || undefined,
        weeklySchedule: formData.get("weeklySchedule") ? JSON.parse(formData.get("weeklySchedule") as string) : undefined,
        eventTypes: formData.get("eventTypes") ? JSON.parse(formData.get("eventTypes") as string) : [],
        venueTypeId: formData.get("venueTypeId") ? parseInt(formData.get("venueTypeId") as string) : undefined,
        media: JSON.parse(formData.get("mediaJson") as string || "[]")
    };

    const validated = UpdateVenueSchema.safeParse(rawData);
    if (!validated.success) {
        console.log(validated.error);
        return { error: "Validation failed: " + validated.error.issues.map(e => e.path + ": " + e.message).join(", ") };
    }
    const data = validated.data;

    // Verify ownership or Admin
    const venue = await prisma.venue.findUnique({ where: { id: data.id } });

    // Fetch fresh role
    const dbUser = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { role: true }
    });
    const role = dbUser?.role || "USER";

    // @ts-ignore
    if (!venue || (venue.ownerId !== session.user.id && role !== "ADMIN")) return { error: "Forbidden" };

    try {
        // Transaction to update details and media
        await prisma.$transaction(async (tx: any) => {
            // Update basic fields
            await tx.venue.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    description: data.description,
                    city: data.city,
                    category: data.category,
                    subcategory: data.subcategory,
                    specialization: data.specialization,
                    venueTypeId: data.venueTypeId,
                    address: data.address,
                    locationUrl: data.locationUrl,
                    website: data.website,
                    phone: data.phone,
                    reservationsEnabled: data.reservationsEnabled,
                    ambiance: data.ambiance,
                    cuisine: data.cuisine,
                    musicStyle: data.musicStyle,
                    openingHours: data.openingHours,
                    weeklySchedule: data.weeklySchedule ?? undefined,
                    // eventTypes: data.eventTypes // TODO: Add to schema or attributes
                }
            });

            // Handle Media: Simple strategy -> Delete all and recreate (or smarter diffing)
            // For simplicity and to ensure order, we can delete old and create new.
            // BUT this loses potential "createdAt".
            // Better: The input `media` is the NEW state.

            await tx.media.deleteMany({ where: { venueId: data.id } });
            if (data.media && data.media.length > 0) {
                await tx.media.createMany({
                    data: data.media.map(m => ({
                        venueId: data.id,
                        url: m.url,
                        type: m.type
                    }))
                });
            }
        });



        const updatedVenue = await prisma.venue.findUnique({
            where: { id: data.id },
            include: { media: true }
        });

        revalidatePath(`/venue/${data.id}`);
        revalidatePath("/business/my-venues");
        return { success: true, venue: updatedVenue };
    } catch (e) {
        console.error(e);
        return { error: "Update failed" };
    }
}

export async function deleteVenue(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    const venue = await prisma.venue.findUnique({ where: { id } });

    // Fetch fresh role
    const dbUser = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { role: true }
    });
    const role = dbUser?.role || "USER";

    // @ts-ignore
    if (!venue || (venue.ownerId !== session.user.id && role !== "ADMIN")) return { error: "Forbidden" };

    try {
        await prisma.venue.delete({ where: { id } });
        revalidatePath("/business/my-venues");
        return { success: true };
    } catch (e) {
        return { error: "Delete failed" };
    }
}
