import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9",
    api_key: process.env.CLOUDINARY_API_KEY || "853549478416266",
    api_secret: process.env.CLOUDINARY_API_SECRET || "r_Zleryezk-Gz7x7BVGSz_g3USM",
});

const PUBLIC_ID = "venues/lqx2umytica5rtogxlyx"; // from the URL in the screenshot

async function checkAndFix() {
    console.log(`\n🔍 Checking: ${PUBLIC_ID}\n`);

    // Try image resource type
    try {
        const r = await cloudinary.api.resource(PUBLIC_ID, { resource_type: "image" });
        console.log("Found as IMAGE resource:");
        console.log(`  access_mode: ${r.access_mode}`);
        console.log(`  secure_url:  ${r.secure_url}`);
        console.log(`  format:      ${r.format}`);

        if (r.access_mode !== "public") {
            console.log("\n⚙️  Fixing access_mode...");
            await cloudinary.api.update(PUBLIC_ID, {
                resource_type: "image",
                access_mode: "public",
            });
            console.log("✅ Fixed! access_mode set to public");
        } else {
            console.log("\n✅ Already public! The URL itself should work.");
            console.log(`\n🔗 Direct URL: ${r.secure_url}`);
        }
    } catch (e1: any) {
        console.log(`Not found as image: ${e1.message}`);

        // Try raw resource type
        try {
            const r = await cloudinary.api.resource(PUBLIC_ID, { resource_type: "raw" });
            console.log("Found as RAW resource:");
            console.log(`  access_mode: ${r.access_mode}`);
            console.log(`  secure_url:  ${r.secure_url}`);
            console.log(`  format:      ${r.format}`);

            if (r.access_mode !== "public") {
                console.log("\n⚙️ Fixing access_mode...");
                await cloudinary.api.update(PUBLIC_ID, {
                    resource_type: "raw",
                    access_mode: "public",
                });
                console.log("✅ Fixed! access_mode set to public");
            } else {
                console.log("\n✅ Already public!");
                console.log(`\n🔗 Correct URL should be (raw): https://res.cloudinary.com/dt5sqovt9/raw/upload/${PUBLIC_ID}.pdf`);
            }
        } catch (e2: any) {
            console.log(`Not found as raw either: ${e2.message}`);
        }
    }
}

checkAndFix().catch(console.error);
