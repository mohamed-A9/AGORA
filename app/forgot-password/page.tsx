"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Sparkles, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setError(null);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
            } else {
                setError(data.error || "Une erreur est survenue");
                setStatus("idle");
            }
        } catch (e) {
            setError("Erreur de connexion");
            setStatus("idle");
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 relative">
                {/* Decorative elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/5 border border-white/10 mb-2">
                        <Mail className="w-8 h-8 text-indigo-400" />
                    </div>

                    <h1 className="text-4xl font-black text-white tracking-tight">Mot de passe oublié ?</h1>
                    <p className="text-white/50 text-lg">Indiquez votre adresse email et nous vous enverrons un lien de réinitialisation.</p>

                    {status === "success" ? (
                        <div className="rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 p-8 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Lien envoyé !</h3>
                            <p className="text-emerald-200/60 leading-relaxed mb-8">
                                Si un compte est associé à <span className="text-emerald-400 font-bold">{email}</span>, vous recevrez un email sous peu.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors font-bold"
                            >
                                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-6 text-left">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@domain.com"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full h-14 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl text-white font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {status === "loading" ? "Chargement..." : "Envoyer le lien"}
                            </button>

                            <div className="text-center pt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors font-bold text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Je m'en souviens finalement
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
