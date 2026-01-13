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
    mediaUrl: z.string().optional()
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
        mediaUrl: formData.get("mediaUrl")
    };

    const validated = EventSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: "Invalid data" };
    }
    const data = validated.data;

    // Verify ownership
    const venue = await prisma.venue.findUnique({ where: { id: data.venueId } });
    if (!venue || venue.ownerId !== (session.user as any).id) return { error: "Forbidden" };

    try {
        await prisma.event.create({
            data: {
                venueId: data.venueId,
                name: data.name,
                description: data.description,
                date: new Date(data.date),
                startTime: data.startTime,
                endTime: data.endTime,
                mediaUrl: data.mediaUrl
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

    if (!event || event.venue.ownerId !== (session.user as any).id) return { error: "Forbidden" };

    try {
        await prisma.event.delete({ where: { id: eventId } });
        revalidatePath(`/business/edit-venue/${event.venueId}`);
        return { success: true };
    } catch (e) {
        return { error: "Failed to delete event" };
    }
}
