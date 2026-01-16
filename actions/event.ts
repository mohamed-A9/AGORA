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

    // Verify ownership or Admin
    const venue = await prisma.venue.findUnique({ where: { id: data.venueId } });

    // Fetch fresh role
    const dbUser = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { role: true }
    });
    const role = dbUser?.role || "USER";

    if (!venue || (venue.ownerId !== (session.user as any).id && role !== "ADMIN")) return { error: "Forbidden" };

    try {
        await prisma.$transaction(async (tx: any) => {
            const event = await tx.event.create({
                data: {
                    venueId: data.venueId,
                    name: data.name,
                    description: data.description,
                    date: new Date(data.date),
                    startTime: data.startTime,
                    endTime: data.endTime,
                    type: data.type,
                    genre: data.genre,
                    ambiance: data.ambiance,
                    musicStyle: data.musicStyle,
                    ticketsEnabled: data.ticketsEnabled,
                    ticketingUrl: data.ticketingUrl,
                    // mediaUrl: legacy, ignored
                }
            });

            if (data.media && data.media.length > 0) {
                await tx.media.createMany({
                    data: data.media.map(m => ({
                        eventId: event.id,
                        url: m.url,
                        type: m.type
                    }))
                });
            }
        });

        revalidatePath(`/business/edit-venue/${data.venueId}`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create event" };
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

    if (!event || (event.venue.ownerId !== (session.user as any).id && role !== "ADMIN")) return { error: "Forbidden" };

    try {
        await prisma.event.delete({ where: { id: eventId } });
        revalidatePath(`/business/edit-venue/${event.venueId}`);
        return { success: true };
    } catch (e) {
        return { error: "Failed to delete event" };
    }
}
