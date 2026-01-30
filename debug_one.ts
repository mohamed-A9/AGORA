
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
dotenv.config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY?.trim();

async function debugOne(name: string, city: string) {
    console.log(`Searching for: "${name}" in "${city}"`);
    const query = encodeURIComponent(`${name} ${city}`);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchUrl}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_PLACES_API_KEY}`;
    // Wait I had a bug in the URL in my mental model or the previous script?
    // Let me check the previous script url.
}
