'use server'

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export async function getVenueTypeFields(subcategory_code: string) {
    if (!subcategory_code) return [];

    try {
        const fields = await prisma.venueTypeField.findMany({
            where: {
                subcategory_code: subcategory_code,
                is_active: true
            },
            orderBy: {
                sort_order: 'asc'
            }
        });

        return fields;
    } catch (error) {
        console.error("Error fetching fields:", error);
        return [];
    }
}
