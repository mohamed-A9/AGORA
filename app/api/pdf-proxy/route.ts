import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9",
    api_key: process.env.CLOUDINARY_API_KEY || "853549478416266",
    api_secret: process.env.CLOUDINARY_API_SECRET || "r_Zleryezk-Gz7x7BVGSz_g3USM",
    secure: true,
});

/**
 * PDF Proxy — /api/pdf-proxy?url=CLOUDINARY_URL
 *
 * Fetches the PDF via Cloudinary's authenticated API and streams it back
 * to the browser so it renders inline without any 401 or CORS issues.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get("url");

    if (!pdfUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    // Security: only allow Cloudinary URLs
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9";
    if (!pdfUrl.includes("cloudinary.com") || !pdfUrl.includes(cloudName)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        // Extract the public_id from the URL
        // URL format: https://res.cloudinary.com/{cloud}/raw/upload/v123456/venues/menus/abc.pdf
        //         or: https://res.cloudinary.com/{cloud}/image/upload/v123456/venues/menus/abc.pdf
        const urlObj = new URL(pdfUrl);
        const pathParts = urlObj.pathname.split("/");

        // Find 'upload' index and take everything after it (stripping version vXXXX if present)
        const uploadIndex = pathParts.indexOf("upload");
        if (uploadIndex === -1) {
            return new NextResponse("Invalid Cloudinary URL", { status: 400 });
        }

        // Parts after 'upload': could be ['v123456', 'venues', 'menus', 'file.pdf'] or ['venues', 'menus', 'file.pdf']
        let afterUpload = pathParts.slice(uploadIndex + 1);
        if (afterUpload[0]?.match(/^v\d+$/)) {
            afterUpload = afterUpload.slice(1); // strip version segment
        }

        // public_id is everything without the extension
        const fullPublicIdWithExt = afterUpload.join("/");
        const publicId = fullPublicIdWithExt.replace(/\.pdf$/i, "");
        const resourceType = pathParts[uploadIndex - 1] as "image" | "video" | "raw";

        // Generate a signed URL that expires in 1 hour
        const signedUrl = cloudinary.url(publicId, {
            resource_type: resourceType === "raw" ? "raw" : "image",
            format: "pdf",
            type: "upload",
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            secure: true,
        });

        // Fetch using the signed URL
        const response = await fetch(signedUrl, {
            headers: { "Accept": "application/pdf,*/*" },
            redirect: "follow",
        });

        if (!response.ok) {
            // Last resort: try the original URL with API credentials via Basic Auth
            const apiKey = process.env.CLOUDINARY_API_KEY || "853549478416266";
            const apiSecret = process.env.CLOUDINARY_API_SECRET || "r_Zleryezk-Gz7x7BVGSz_g3USM";
            const authResponse = await fetch(pdfUrl, {
                headers: {
                    "Accept": "application/pdf,*/*",
                    "Authorization": "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64"),
                },
            });

            if (!authResponse.ok) {
                return new NextResponse(`Failed to fetch PDF: ${authResponse.status}`, { status: authResponse.status });
            }

            const pdfBuffer = await authResponse.arrayBuffer();
            return new NextResponse(pdfBuffer, {
                status: 200,
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "inline",
                    "Cache-Control": "public, max-age=3600",
                },
            });
        }

        const pdfBuffer = await response.arrayBuffer();
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
                "Cache-Control": "public, max-age=86400",
                "Content-Length": pdfBuffer.byteLength.toString(),
            },
        });

    } catch (error: any) {
        console.error("PDF Proxy Error:", error);
        return new NextResponse(`Proxy error: ${error.message}`, { status: 500 });
    }
}
