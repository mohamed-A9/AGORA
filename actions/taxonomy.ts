"use server";

import { prisma } from "@/lib/prisma";

export async function getVenueTypes(lang: "en" | "fr" | "ar" = "en") {
    // Legacy: This function used to query a "VenueType" table.
    // Now we query the standard Subcategory table.
    // We group by MainCategory.

    // @ts-ignore
    const subcats = await (prisma as any).subcategory.findMany({
        orderBy: { name: 'asc' }
    });

    // Group by MainCategory
    // Since we don't have separate localized names in the new simple schema (yet),
    // we use "name" for all languages or add a map if needed.
    // The previous implementation returned a grouped structure.

    const grouped: Record<string, any> = {};

    for (const sc of subcats) {
        // Use MainCategory as code
        const catCode = sc.mainCategory;

        if (!grouped[catCode]) {
            // Need a label for the MainCategory. We can use TAXONOMY constants or just title case the Enum.
            grouped[catCode] = {
                code: catCode,
                name: catCode.replace(/_/g, " "), // Simple formatting
                subcategories: []
            };
        }

        grouped[catCode].subcategories.push({
            id: sc.id,
            code: sc.slug, // Use slug as code
            name: sc.name,
            icon: "" // No icon in new schema yet
        });
    }

    return Object.values(grouped);
}
