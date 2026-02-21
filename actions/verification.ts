"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

export async function resendVerificationEmail() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Unauthorized" };

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return { error: "User not found" };
    if (user.emailVerified) return { error: "Email already verified" };
    if (!user.email) return { error: "No email found" };

    // Limit resend frequency? (Simple token refresh)
    // If token exists and is fresh (< 2 min), maybe block?
    // For now, allow overwrite.

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
        where: { id: userId },
        data: {
            emailVerificationToken: token,
            emailVerificationExpiresAt: expires
        }
    });

    await sendVerificationEmail(user.email, token);

    return { success: true };
}
