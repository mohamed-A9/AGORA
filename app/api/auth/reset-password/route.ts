import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpiresAt: { gte: new Date() },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Le lien est invalide ou a expiré" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpiresAt: null,
            },
        });

        return NextResponse.json({ message: "Votre mot de passe a été mis à jour avec succès" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
