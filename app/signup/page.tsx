"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = "USER" | "BUSINESS";

import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "business" ? "BUSINESS" : "USER";
  const [role, setRole] = useState<Role>(initialRole);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data?.error || "Erreur lors de l’inscription.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="h-[calc(100vh-5rem)] bg-[#070A12] text-white flex items-center justify-center px-6 overflow-hidden">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl font-extrabold tracking-tight">AGORA</div>
          <p className="text-white/70 mt-2">Créer un compte</p>
        </div>

        {/* Choix role */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("USER")}
            className={`rounded-2xl px-4 py-3 border transition ${role === "USER"
              ? "bg-white text-black border-white"
              : "border-white/15 hover:bg-white/5"
              }`}
          >
            Utilisateur
            <div className="text-xs opacity-70">Réserver & explorer</div>
          </button>

          <button
            type="button"
            onClick={() => setRole("BUSINESS")}
            className={`rounded-2xl px-4 py-3 border transition ${role === "BUSINESS"
              ? "bg-white text-black border-white"
              : "border-white/15 hover:bg-white/5"
              }`}
          >
            Business
            <div className="text-xs opacity-70">Publier un lieu / event</div>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <div className="text-sm text-red-300">{error}</div>}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-white text-black font-semibold py-3 disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <div className="text-center text-sm text-white/70 mt-5">
          Déjà un compte ?{" "}
          <Link className="text-white underline" href="/login">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
