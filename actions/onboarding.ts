"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

export async function completeOnboarding(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    const userId = (session.user as any).id;

    // Fetch existing user to check email status
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) return { error: "User not found" };

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const birthday = formData.get("birthday") as string;
    const gender = formData.get("gender") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !birthday || !gender || !password || !email) {
        return { error: "Tous les champs sont obligatoires." };
    }

    if (password !== confirmPassword) {
        return { error: "Les mots de passe ne correspondent pas." };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine if verification is needed
        let needsVerification = false;

        // If email changed, or it was never verified
        if (existingUser.email !== email || !existingUser.emailVerified) {
            needsVerification = true;
        }

        const dataToUpdate: any = {
            name,
            email,
            birthday: new Date(birthday),
            gender,
            password: hashedPassword,
            isOnboardingCompleted: true
        };

        if (needsVerification) {
            const token = crypto.randomBytes(32).toString('hex');
            dataToUpdate.emailVerificationToken = token;
            dataToUpdate.emailVerified = null; // Mark as unverified
            dataToUpdate.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h expiry

            // Send email
            await sendVerificationEmail(email, token);
        }

        await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate
        });

        return { success: true };
    } catch (e: any) {
        console.error("Onboarding Error:", e);
        if (e.code === 'P2002' && e.meta?.target?.includes('email')) {
            return { error: "Cet adresse email est déjà utilisée par un autre compte." };
        }
        return { error: `Erreur technique: ${e.message}` };
    }
}
