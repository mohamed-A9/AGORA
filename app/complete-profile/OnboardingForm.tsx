"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/actions/onboarding";
import { Calendar, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import DatePicker from "@/components/ui/DatePicker";

// Initial state for the form action

export default function OnboardingForm({ user }: { user: any }) {
    const { update } = useSession();
    const [state, formAction, isPending] = useActionState(completeOnboarding, null);
    const router = useRouter();
    const isEmailLocked = !!user?.email;

    useEffect(() => {
        if (state?.success) {
            // Force refresh session token using update() then redirect
            update().then(async () => {
                router.refresh();
                // Short delay to ensure cookie propagation and router refresh
                await new Promise((resolve) => setTimeout(resolve, 500));
                window.location.href = "/dashboard";
            });
        }
    }, [state?.success, router, update]);

    return (
        <div className="w-full max-w-lg mx-auto bg-zinc-900 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <UserIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Finaliser votre inscription</h1>
                <p className="text-zinc-400 text-sm">
                    Veuillez confirmer vos informations et définir un mot de passe pour sécuriser votre compte.
                </p>
            </div>

            <form action={formAction} className="space-y-6">

                {state?.error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {state.error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Nom Complet</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                            <input
                                name="name"
                                type="text"
                                defaultValue={user?.name || ""}
                                placeholder="Votre nom"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                            <input
                                name="email"
                                type="email"
                                defaultValue={user?.email || ""}
                                placeholder="exemple@email.com"
                                required
                                readOnly={isEmailLocked}
                                className={`w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:border-indigo-500 outline-none transition-all ${isEmailLocked ? 'opacity-50 cursor-not-allowed bg-white/5' : ''}`}
                            />
                            {isEmailLocked && (
                                <Lock className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500" />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Birthday */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Date de naissance</label>
                            <div className="relative">
                                <DatePicker
                                    name="birthday"
                                    placeholder="DD / MM / YYYY"
                                    enableYearSelection={true}
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Genre</label>
                            <select
                                name="gender"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-indigo-500 outline-none transition-all appearance-none"
                            >
                                <option value="" className="text-black">Sélectionner</option>
                                <option value="male" className="text-black">Homme</option>
                                <option value="female" className="text-black">Femme</option>
                                <option value="other" className="text-black">Autre</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-6" />

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Confirmer mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                            <input
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-8">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Traitement en cours..." : "Valider et Accéder"}
                    </button>

                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-2 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter / Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}
