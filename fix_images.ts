
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixImages() {
    console.log("🛠️ Fixing images for Espressolab and PAUL...");

    // Espressolab
    const espressolab = await prisma.venue.findFirst({ where: { name: "Espressolab" } });
    if (espressolab) {
        await prisma.venue.update({
            where: { id: espressolab.id },
            data: {
                coverImageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1000"
            }
        });
        // Update gallery
        await prisma.venueMedia.deleteMany({ where: { venueId: espressolab.id } });
        await prisma.venueMedia.createMany({
            data: [
                { venueId: espressolab.id, url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1000", kind: 'image', sortOrder: 0 },
                { venueId: espressolab.id, url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000", kind: 'image', sortOrder: 1 },
                { venueId: espressolab.id, url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000", kind: 'image', sortOrder: 2 }
            ]
        });
        console.log("✅ Espressolab images updated.");
    }

    // PAUL
    const paul = await prisma.venue.findFirst({ where: { name: "PAUL" } });
    if (paul) {
        await prisma.venue.update({
            where: { id: paul.id },
            data: {
                coverImageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1000"
            }
        });
        // Update gallery
        await prisma.venueMedia.deleteMany({ where: { venueId: paul.id } });
        await prisma.venueMedia.createMany({
            data: [
                { venueId: paul.id, url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1000", kind: 'image', sortOrder: 0 },
                { venueId: paul.id, url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1000", kind: 'image', sortOrder: 1 },
                { venueId: paul.id, url: "https://images.unsplash.com/photo-1601205741712-b261aff33a7d?auto=format&fit=crop&q=80&w=1000", kind: 'image', sortOrder: 2 }
            ]
        });
        console.log("✅ PAUL images updated.");
    }

    console.log("🏁 Image fix complete.");
}

fixImages();
