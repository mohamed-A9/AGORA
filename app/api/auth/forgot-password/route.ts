import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email est requis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            // Don't reveal if user exists for security
            return NextResponse.json({ message: "Si cet email existe, un lien a été envoyé." });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpiresAt: expires,
            },
        });

        // Send real email
        try {
            await sendPasswordResetEmail(user.email!, token);
        } catch (mailError) {
            console.error("Failed to send reset email:", mailError);
            // We still return success to the user for security, 
            // but log the error for the developer.
        }

        console.log("-----------------------------------------");
        console.log("PASSWORD RESET REQUEST");
        console.log(`User: ${user.email}`);
        // Still logging for dev convenience
        console.log(`Link (also sent via email): ${process.env.NEXTAUTH_URL}/reset-password?token=${token}`);
        console.log("-----------------------------------------");

        return NextResponse.json({ message: "Si cet email existe, un lien a été envoyé." });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
