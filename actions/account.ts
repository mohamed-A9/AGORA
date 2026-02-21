"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function deleteMyAccount(password: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "Non autorisé" };

    const userId = (session.user as any).id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Enforce password check if user has one
        if (user?.password) {
            if (!password) return { error: "Mot de passe requis pour confirmer la suppression." };
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return { error: "Mot de passe incorrect." };
        } else {
            // For OAuth users without password, require explicit confirmation logic if needed, 
            // but here we just proceed as they are authenticated in session.
        }

        // Delete Venues (Manual clean up since Schema might not cascade)
        await prisma.venue.deleteMany({ where: { ownerId: userId } });

        // Delete User
        await prisma.user.delete({ where: { id: userId } });

        return { success: true };
    } catch (e: any) {
        console.error("Delete Account Error:", e);
        return { error: "Une erreur est survenue lors de la suppression." };
    }
}
