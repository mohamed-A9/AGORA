"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VerifySuccessPage() {
    const { update, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            const refreshSession = async () => {
                try {
                    await update();
                    router.refresh();
                    router.push("/dashboard");
                } catch (error) {
                    console.error("Session update failed, retrying...", error);
                    setTimeout(refreshSession, 2000);
                }
            };
            refreshSession();
        } else if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, update, router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h1 className="text-white text-xl font-bold">Vérification réussie !</h1>
                <p className="text-zinc-400">Mise à jour de votre session...</p>
            </div>
        </div>
    );
}
