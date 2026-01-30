"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const EventSchema = z.object({
    venueId: z.string(),
    name: z.string().min(3),
    description: z.string().optional(),
    date: z.string(), // ISO String or YYYY-MM-DD
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    type: z.string().optional(),
    genre: z.string().optional(),
    ambiance: z.string().optional(),
    musicStyle: z.string().optional(),
    ticketsEnabled: z.boolean().optional(),
    ticketingUrl: z.string().url().optional().or(z.literal("")),
    media: z.array(z.object({
        url: z.string().url(),
        type: z.enum(["image", "video", "pdf"])
    })).optional()
});

export async function createEvent(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    const rawData = {
        venueId: formData.get("venueId"),
        name: formData.get("name"),
        description: formData.get("description"),
        date: formData.get("date"),
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
        type: formData.get("type"),
        genre: formData.get("genre"),
        ambiance: formData.get("ambiance"),
        musicStyle: formData.get("musicStyle"),
        ticketsEnabled: formData.get("ticketsEnabled") === "true",
        ticketingUrl: formData.get("ticketingUrl"),
        media: JSON.parse(formData.get("mediaJson") as string || "[]")
    };

    const validated = EventSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: "Invalid data" };
    }
    const data = validated.data;

    // Verify ownership or Admin & Fetch City
    const venue = await prisma.venue.findUnique({
        where: { id: data.venueId },
        select: { ownerId: true, cityId: true, city: true }
    });

    // Fetch fresh role
    const dbUser = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { role: true }
    });
    const role = dbUser?.role || "USER";

    if (!venue || (venue.ownerId !== (session.user as any).id && role !== "ADMIN")) return { error: "Forbidden" };
    if (!venue.cityId) return { error: "Venue must have a city assigned to create events." };

    try {
        await prisma.$transaction(async (tx: any) => {
            // Slugify
            const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + Math.floor(Math.random() * 10000);

            // Dates
            // minimal handling: combine date + time. Assumes local time / UTC string usage.
            const startStr = `${data.date}T${data.startTime || "00:00"}:00`;
            const startsAt = new Date(startStr);

            let endsAt = null;
            if (data.endTime) {
                const endStr = `${data.date}T${data.endTime}:00`;
                endsAt = new Date(endStr);
                // If ends before starts, assume next day? Naive check.
                if (endsAt < startsAt) {
                    endsAt.setDate(endsAt.getDate() + 1);
                }
            }

            // Relations
            // musicStyle -> MusicType
            // ambiance -> Vibe
            const musicSlug = data.musicStyle?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vibeSlug = data.ambiance?.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            const event = await tx.event.create({
                data: {
                    venueId: data.venueId,
                    cityId: venue.cityId, // Required
                    title: data.name,
                    slug,
                    description: data.description,
                    startsAt,
                    endsAt,
                    isTicketed: data.ticketsEnabled,
                    ticketingUrl: data.ticketingUrl,

                    // Relations
                    musicTypes: musicSlug ? {
                        create: { musicType: { connect: { slug: musicSlug } } }
                    } : undefined,

                    vibes: vibeSlug ? {
                        create: { vibe: { connect: { slug: vibeSlug } } }
                    } : undefined,
                }
            });

            if (data.media && data.media.length > 0) {
                await tx.media.createMany({
                    data: data.media.map((m: any) => ({
                        eventId: event.id,
                        url: m.url,
                        type: m.type
                    }))
                });
            }
        });

        revalidatePath(`/business/edit-venue/${data.venueId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Create Event Error", e);
        return { error: `Failed to create event: ${e.message}` };
    }
}

export async function deleteEvent(eventId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { venue: true }
    });

    // Fetch fresh role
    const dbUser = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { role: true }
    });
    const role = dbUser?.role || "USER";

    if (!event || !event.venue || (event.venue.ownerId !== (session.user as any).id && role !== "ADMIN")) return { error: "Forbidden" };

    try {
        await prisma.event.delete({ where: { id: eventId } });
        revalidatePath(`/business/edit-venue/${event.venueId}`);
        return { success: true };
    } catch (e) {
        return { error: "Failed to delete event" };
    }
}

/**
 * Automatically delete events that have already passed.
 * The user requested to delete events after the date doesn't match current date.
 */
export async function cleanupPastEvents() {
    const now = new Date();
    try {
        // We delete events where endsAt is in the past, or startsAt + 24h if endsAt is null
        // To be safe and meet the user's specific request: "after the date of that event not matching the current date"
        // We delete anything that ended before today (midnight).
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const result = await prisma.event.deleteMany({
            where: {
                OR: [
                    {
                        endsAt: { lt: todayAtMidnight }
                    },
                    {
                        endsAt: null,
                        startsAt: { lt: todayAtMidnight }
                    }
                ]
            }
        });

        if (result.count > 0) {
            console.log(`[Scheduled Cleanup] Deleted ${result.count} past events.`);
        }
        return { success: true, count: result.count };
    } catch (e) {
        console.error("Cleanup Error:", e);
        return { success: false };
    }
}
