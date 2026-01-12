import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: "dt5sqovt9",
    api_key: "853549478416266",
    api_secret: "r_Zleryezk-Gz7x7BVGSz_g3USM",
});

export async function POST(request: Request) {
    const body = await request.json();
    const { paramsToSign } = body;

    console.log("Cloudinary Config Check:");
    console.log("Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Present" : "Missing");

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({ signature });
}
