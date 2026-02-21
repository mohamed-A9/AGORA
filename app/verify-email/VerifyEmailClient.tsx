"use client";

import { useTransition } from "react";
// @ts-ignore
import { resendVerificationEmail } from "@/actions/verification";
import { LogOut, RefreshCw } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function VerifyEmailClient() {
    const [isPending, startTransition] = useTransition();
    const { update } = useSession();
    const router = useRouter();

    const handleResend = () => {
        startTransition(async () => {
            const res = await resendVerificationEmail();
            if (res.success) {
                alert("Email renvoyé avec succès !");
            } else if (res.error === "Email already verified") {
                // Force session update and redirect
                await update();
                router.refresh();
                router.push("/dashboard");
            } else {
                alert("Erreur: " + res.error);
            }
        });
    };

    return (
        <div className="space-y-4 pt-4 border-t border-white/10">
            <button
                onClick={handleResend}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
                {isPending ? "Traitement..." : "Renvoyer l'e-mail / Vérifier statut"}
            </button>

            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm"
            >
                <LogOut className="w-4 h-4" />
                Se déconnecter
            </button>
        </div>
    );
}
