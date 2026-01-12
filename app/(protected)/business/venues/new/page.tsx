"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewVenuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("Restaurant");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && role !== "BUSINESS" && role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [status, role, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/business/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city, category, address, description }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data?.error || "Erreur lors de la création.");
      return;
    }

    router.push("/business/venues");
  }

  if (status === "loading") return <div className="text-white/80">Chargement...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold text-white">Créer un lieu</h1>
      <p className="text-white/60 mt-2">Ajoutez votre restaurant / lieu / event.</p>

      <form onSubmit={onSubmit} className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
        <Field label="Nom *">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ville *">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              required
            />
          </Field>

          <Field label="Catégorie *">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option>Restaurant</option>
              <option>Café</option>
              <option>Club</option>
              <option>Event</option>
              <option>Other</option>
            </select>
          </Field>
        </div>

        <Field label="Adresse">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[120px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />
        </Field>

        {error && (
          <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
            ❌ {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            disabled={loading}
            className="rounded-2xl bg-white text-black px-5 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/business/venues")}
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-white hover:bg-white/15"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
