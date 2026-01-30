
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();
const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY?.trim();
const FAILURES_FILE = 'update_failures.json';

function logFailure(venue: any, reason: string) {
    console.log(`  ❌ FAILURE for [${venue.name}]: ${reason}`);
    let failures = [];
    if (fs.existsSync(FAILURES_FILE)) {
        try { failures = JSON.parse(fs.readFileSync(FAILURES_FILE, 'utf-8')); } catch (e) { }
    }
    failures.push({
        id: venue.id,
        name: venue.name,
        city: venue.city?.name,
        reason,
        timestamp: new Date().toISOString()
    });
    fs.writeFileSync(FAILURES_FILE, JSON.stringify(failures, null, 2));
}

async function getPlaceId(name: string, city: string) {
    let query = encodeURIComponent(`${name} ${city}`);
    let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${GOOGLE_PLACES_API_KEY}`;
    try {
        let res = await fetch(url);
        let data: any = await res.json();
        if (data.status === 'OK' && data.candidates?.length > 0) return data.candidates[0].place_id;

        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_PLACES_API_KEY}`;
        res = await fetch(url);
        data = await res.json();
        if (data.status === 'OK' && data.results?.length > 0) return data.results[0].place_id;
        return null;
    } catch { return null; }
}

async function getPlaceDetails(placeId: string) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_PLACES_API_KEY}`;
    try {
        const res = await fetch(url);
        const data: any = await res.json();
        return data.result;
    } catch { return null; }
}

async function uploadToCloudinary(url: string, publicId: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        const dataUrl = `data:${response.headers.get('content-type') || 'image/jpeg'};base64,${Buffer.from(buffer).toString('base64')}`;
        const result = await cloudinary.uploader.upload(dataUrl, {
            folder: 'agora/venues_real',
            public_id: publicId,
            overwrite: true,
            resource_type: 'image'
        });
        return result.secure_url;
    } catch { return null; }
}

async function processVenue(venue: any) {
    if (venue.coverImageUrl?.includes('agora/venues_real')) return;

    console.log(`Processing: [${venue.name}]`);
    const placeId = await getPlaceId(venue.name, venue.city?.name || 'Casablanca');
    if (!placeId) {
        logFailure(venue, "Place ID not found");
        return;
    }

    const details = await getPlaceDetails(placeId);
    if (!details || !details.photos) {
        logFailure(venue, "No photos found on Google");
        return;
    }

    const photos = details.photos;
    const uploadedUrls: string[] = [];
    const maxPhotos = Math.min(photos.length, 5);

    for (let i = 0; i < maxPhotos; i++) {
        const photoRef = photos[i].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`;
        const publicId = `${venue.slug}_${i}_${Date.now()}`;
        const cloudinaryUrl = await uploadToCloudinary(photoUrl, publicId);
        if (cloudinaryUrl) uploadedUrls.push(cloudinaryUrl);
    }

    if (uploadedUrls.length > 0) {
        await prisma.$transaction([
            prisma.venue.update({ where: { id: venue.id }, data: { coverImageUrl: uploadedUrls[0] } }),
            prisma.venueMedia.deleteMany({ where: { venueId: venue.id, kind: 'image' } }),
            prisma.venueMedia.createMany({
                data: uploadedUrls.map((url, index) => ({ venueId: venue.id, url, kind: 'image', sortOrder: index }))
            })
        ]);
        console.log(`✅ DONE: ${venue.name}`);
    } else {
        logFailure(venue, "Failed to upload any photos");
    }
}

async function main() {
    if (!GOOGLE_PLACES_API_KEY) return console.error("Missing API Key");
    const venues = await prisma.venue.findMany({ include: { city: true } });
    const toProcess = venues.filter(v => !v.coverImageUrl?.includes('agora/venues_real'));
    console.log(`Found ${toProcess.length} venues to update.`);

    const batchSize = 5;
    for (let i = 0; i < toProcess.length; i += batchSize) {
        const batch = toProcess.slice(i, i + batchSize);
        console.log(`\nBatch ${i / batchSize + 1} / ${Math.ceil(toProcess.length / batchSize)}`);
        await Promise.all(batch.map(v => processVenue(v)));
        await new Promise(r => setTimeout(r, 1000)); // Be kind to APIs
    }
    console.log("\n🏁 ALL DONE");
}

main().catch(console.error).finally(() => prisma.$disconnect());
