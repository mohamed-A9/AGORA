'use server'

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export async function getVenueTypeFields(subcategory_code: string) {
    // Legacy: This function used to query VenueTypeField.
    // The new schema uses explicit Subcategory/Facility relations.
    // We return empty array to prevent crashes in legacy UI components.
    return [];
}
