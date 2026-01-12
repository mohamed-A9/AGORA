"use server";

import { prisma } from "@/lib/prisma";

export async function getVenueTypes(lang: "en" | "fr" | "ar" = "en") {
    const types = await prisma.venueType.findMany({
        where: { is_active: true },
        orderBy: { category_name_en: 'asc' }
    });

    // Group by category
    const grouped = types.reduce((acc, type) => {
        const catCode = type.category_code;
        if (!acc[catCode]) {
            acc[catCode] = {
                code: catCode,
                name: lang === "fr" ? type.category_name_fr : lang === "ar" ? type.category_name_ar : type.category_name_en,
                subcategories: []
            };
        }
        acc[catCode].subcategories.push({
            id: type.id,
            code: type.subcategory_code,
            name: lang === "fr" ? type.subcategory_name_fr : lang === "ar" ? type.subcategory_name_ar : type.subcategory_name_en,
            icon: type.icon
        });
        return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
}
