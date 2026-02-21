/**
 * fix-cloudinary-pdfs.ts
 *
 * This script finds all private/restricted PDF files in the Cloudinary "venues" folder
 * and updates their access_mode to "public" so they can be viewed without authentication.
 *
 * Run with: npx ts-node -e "require('./scripts/fix-cloudinary-pdfs.ts')"
 * OR: npx tsx scripts/fix-cloudinary-pdfs.ts
 */

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9",
    api_key: process.env.CLOUDINARY_API_KEY || "853549478416266",
    api_secret: process.env.CLOUDINARY_API_SECRET || "r_Zleryezk-Gz7x7BVGSz_g3USM",
});

async function fixPdfAccess() {
    console.log("🔍 Searching for PDF files in /venues folder...\n");

    let nextCursor: string | undefined = undefined;
    let totalFixed = 0;
    let totalFailed = 0;
    let totalFound = 0;

    try {
        do {
            // Fetch all raw resources (PDFs are stored as "raw" resource_type in Cloudinary)
            const result: any = await cloudinary.api.resources({
                resource_type: "raw",
                type: "upload",
                prefix: "venues/",
                max_results: 100,
                next_cursor: nextCursor,
            });

            const resources: any[] = result.resources || [];
            nextCursor = result.next_cursor;

            const pdfs = resources.filter((r: any) => r.format === "pdf");
            totalFound += pdfs.length;

            if (pdfs.length === 0 && !nextCursor) {
                console.log("ℹ️  No PDFs found in /venues folder as raw resources.");
            }

            for (const pdf of pdfs) {
                const publicId = pdf.public_id;
                const currentAccess = pdf.access_mode || "unknown";

                if (currentAccess === "public") {
                    console.log(`✅ Already public: ${publicId}`);
                    totalFixed++;
                    continue;
                }

                try {
                    await cloudinary.api.update(publicId, {
                        resource_type: "raw",
                        access_mode: "public",
                    });
                    console.log(`✅ Fixed: ${publicId} (was: ${currentAccess})`);
                    totalFixed++;
                } catch (err: any) {
                    console.error(`❌ Failed to fix: ${publicId} — ${err.message}`);
                    totalFailed++;
                }
            }
        } while (nextCursor);

        // Also check image resource_type (sometimes uploaded as image/pdf)
        nextCursor = undefined;
        const imageResult: any = await cloudinary.api.resources({
            resource_type: "image",
            type: "upload",
            prefix: "venues/",
            max_results: 500,
        });

        const imagePdfs = (imageResult.resources || []).filter((r: any) => r.format === "pdf");
        totalFound += imagePdfs.length;

        for (const pdf of imagePdfs) {
            const publicId = pdf.public_id;
            const currentAccess = pdf.access_mode || "unknown";

            if (currentAccess === "public") {
                console.log(`✅ Already public (image type): ${publicId}`);
                totalFixed++;
                continue;
            }

            try {
                await cloudinary.api.update(publicId, {
                    resource_type: "image",
                    access_mode: "public",
                });
                console.log(`✅ Fixed (image type): ${publicId} (was: ${currentAccess})`);
                totalFixed++;
            } catch (err: any) {
                console.error(`❌ Failed to fix (image type): ${publicId} — ${err.message}`);
                totalFailed++;
            }
        }

    } catch (err: any) {
        console.error("❌ Error fetching Cloudinary resources:", err.message);
        process.exit(1);
    }

    console.log("\n──────────────────────────────────────");
    console.log(`📊 Summary:`);
    console.log(`   PDFs found:  ${totalFound}`);
    console.log(`   Fixed:       ${totalFixed}`);
    console.log(`   Failed:      ${totalFailed}`);
    console.log("──────────────────────────────────────\n");

    if (totalFailed === 0) {
        console.log("🎉 All PDF files are now publicly accessible!");
    } else {
        console.log("⚠️  Some files could not be updated. Check the errors above.");
    }
}

fixPdfAccess().catch(console.error);
