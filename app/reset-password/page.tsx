"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    if (!token) {
        return (
            <div className="text-center space-y-6 max-w-md mx-auto py-20">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white">Lien invalide</h1>
                <p className="text-white/50">Ce lien de réinitialisation est incomplet ou corrompu.</p>
                <Link href="/login" className="inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all">
                    Retour à la connexion
                </Link>
            </div>
        );
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setStatus("loading");
        setError(null);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
            } else {
                setError(data.error || "Une erreur est survenue");
                setStatus("error");
            }
        } catch (e) {
            setError("Erreur de connexion");
            setStatus("error");
        }
    }

    if (status === "success") {
        return (
            <div className="text-center space-y-8 max-w-md mx-auto py-10 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-white tracking-tight">Mot de passe mis à jour !</h1>
                    <p className="text-white/40 text-lg">Votre nouveau mot de passe est maintenant actif. Vous pouvez vous connecter à nouveau.</p>
                </div>
                <Link
                    href="/login"
                    className="block w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                >
                    Se connecter
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-10 space-y-10">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Lock className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">Nouveau mot de passe</h1>
                <p className="text-white/40">Choisissez un mot de passe fort pour protéger votre compte Agora.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Nouveau mot de passe</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 text-white placeholder:text-white/20 outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Confirmer</label>
                        <div className="relative group">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full h-14 bg-white text-black rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                    {status === "loading" ? "Mise à jour..." : "Réinitialiser"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 relative flex-col">
            {/* Decorative backgrounds */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <Suspense fallback={<div className="text-white/50">Chargement...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
