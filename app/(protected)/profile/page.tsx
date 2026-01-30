"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { moroccanCities, VENUE_CATEGORIES, AMBIANCES } from "@/lib/constants";
import { Check, Settings, MapPin, Sparkles, Utensils, Lock, ShieldCheck, Eye, EyeOff, LayoutDashboard, Plus } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    preferredCities: [] as string[],
    preferredCategories: [] as string[],
    preferredAmbiances: [] as string[],
  });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated") fetchPrefs();
  }, [status, router]);

  async function fetchPrefs() {
    try {
      const res = await fetch("/api/user/preferences");
      const data = await res.json();
      if (data) {
        setPrefs({
          preferredCities: data.preferredCities || [],
          preferredCategories: data.preferredCategories || [],
          preferredAmbiances: data.preferredAmbiances || [],
        });
      }
    } catch (e) {
      console.error("Failed to fetch preferences", e);
    } finally {
      setLoading(false);
    }
  }

  async function savePrefs() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        // Show success maybe?
      }
    } catch (e) {
      console.error("Failed to save preferences", e);
    } finally {
      setSaving(false);
    }
  }

  const togglePref = (key: keyof typeof prefs, val: string) => {
    setPrefs(prev => {
      const current = prev[key];
      if (current.includes(val)) {
        return { ...prev, [key]: current.filter(v => v !== val) };
      } else {
        return { ...prev, [key]: [...current, val] };
      }
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  const user = session?.user as any;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Header Info */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Profil</h1>
        <p className="text-white/40 text-lg">
          {user?.role === "BUSINESS"
            ? "Gérez votre compte professionnel et accédez à vos outils de gestion."
            : "Gérez vos informations personnelles et vos préférences de découverte."}
        </p>
      </div>

      <div className="grid gap-8">
        {/* Core Info */}
        <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Informations Générales</h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Info label="Nom" value={user?.name || "—"} />
            <Info label="Email" value={user?.email || "—"} />
          </div>

          {/* Connected Accounts Section for Business Users */}
          {(user?.role === "BUSINESS" || user?.role === "ADMIN") && (
            <>
              <div className="h-px bg-white/10 w-full my-10" />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Comptes Connectés</h3>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-bold">Google</div>
                        <div className="text-white/40 text-sm">{user?.email || "—"}</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      Connecté
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="h-px bg-white/10 w-full my-10" />

          {/* Moved Password Change here */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Changer le mot de passe</h3>
            </div>
            <PasswordChangeForm />
          </div>

        </section>

        {/* Business Management Section - Added for Business Role */}
        {(user?.role === "BUSINESS" || user?.role === "ADMIN") && (
          <section className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-8 backdrop-blur-xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Gestion Business</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/business/my-venues"
                className="group flex flex-col p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Gérer</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Mes Établissements</h3>
                <p className="text-white/40 text-sm">Modifiez vos fiches, mettez à jour vos photos et gérez vos événements.</p>
              </Link>

              <Link
                href="/business/add-venue"
                className="group flex flex-col p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 hover:border-indigo-500/40 transition-all shadow-lg shadow-indigo-500/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Créer</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ajouter un Lieu</h3>
                <p className="text-white/40 text-sm">Référencez un nouvel établissement sur la plateforme AGORA.</p>
              </Link>
            </div>
          </section>
        )}

        {/* Preferences Section - Hidden for Business & Admin Users */}
        {user?.role === "USER" && (
          <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl space-y-10 relative overflow-hidden">

            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles className="w-48 h-48" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Vos Préférences</h2>
                  <p className="text-white/40 text-sm">Nous utiliserons ces réglages pour personnaliser votre navigation.</p>
                </div>
              </div>
              <button
                onClick={savePrefs}
                disabled={saving}
                className={`px-8 py-3 rounded-2xl font-bold transition-all ${saving
                  ? "bg-zinc-800 text-white/20 cursor-not-allowed"
                  : "bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                  }`}
              >
                {saving ? "Enregistrement..." : "Enregistrer les préférences"}
              </button>
            </div>

            <div className="space-y-10 relative z-10">
              {/* Cities */}
              <PrefGroup
                title="Villes favorites"
                icon={MapPin}
                iconColor="text-indigo-400"
                items={moroccanCities}
                selected={prefs.preferredCities}
                onToggle={(v: string) => togglePref("preferredCities", v)}
              />

              {/* Categories */}
              <PrefGroup
                title="Types d'établissements"
                icon={Utensils}
                iconColor="text-fuchsia-400"
                items={VENUE_CATEGORIES}
                selected={prefs.preferredCategories}
                onToggle={(v: string) => togglePref("preferredCategories", v)}
              />

              {/* Ambiances */}
              <PrefGroup
                title="Vibes & Ambiances"
                icon={Sparkles}
                iconColor="text-amber-400"
                items={AMBIANCES}
                selected={prefs.preferredAmbiances}
                onToggle={(v: string) => togglePref("preferredAmbiances", v)}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setError(data.error || "Une erreur est survenue");
        setStatus("error");
      }
    } catch (e) {
      setError("Erreur réseau");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handlePasswordChange} className="grid gap-6 max-w-2xl">
      {status === "success" && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
          ✅ Mot de passe mis à jour avec succès !
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 col-span-full sm:col-span-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Ancien mot de passe</span>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-4 text-white outline-none focus:border-indigo-500/50 transition-all font-medium"
            placeholder="••••••••"
          />
        </label>

        <div className="hidden sm:block" /> {/* Spacer */}

        <label className="block space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Nouveau mot de passe</span>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-4 text-white outline-none focus:border-indigo-500/50 transition-all font-medium"
            placeholder="••••••••"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Confirmer nouveau</span>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-4 text-white outline-none focus:border-indigo-500/50 transition-all font-medium"
            placeholder="••••••••"
          />
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-8 py-3 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50 active:scale-95"
        >
          {status === "loading" ? "Chargement..." : "Changer le mot de passe"}
        </button>
      </div>
    </form>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-1">
      <div className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">{label}</div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  );
}

function PrefGroup({ title, icon: Icon, iconColor, items, selected, onToggle }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h3 className="text-sm font-black uppercase tracking-widest text-white/60">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item: string) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => onToggle(item)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isSelected
                ? "bg-white border-white text-black shadow-lg shadow-white/5 scale-105"
                : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
                }`}
            >
              <div className="flex items-center gap-2">
                {item}
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
