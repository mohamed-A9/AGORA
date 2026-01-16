import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { sendPasswordChangedNotificationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "L'ancien mot de passe est incorrect" }, { status: 400 });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword },
        });

        try {
            if (user.email) {
                await sendPasswordChangedNotificationEmail(user.email);
            }
        } catch (mailError) {
            console.error("Failed to send password change notification:", mailError);
        }

        return NextResponse.json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
