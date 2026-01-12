"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Venue = {
  id: string;
  name: string;
  city: string;
  category: string;
  address?: string | null;
  createdAt: string;
};

export default function BusinessVenuesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [items, setItems] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && role !== "BUSINESS" && role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [status, role, router]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/business/venues");
        const data = await res.json();
        setItems(Array.isArray(data?.venues) ? data.venues : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (v) =>
        v.name.toLowerCase().includes(s) ||
        v.city.toLowerCase().includes(s) ||
        v.category.toLowerCase().includes(s)
    );
  }, [items, q]);

  if (status === "loading" || loading) return <div className="text-white/80">Chargement...</div>;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Mes lieux</h1>
          <p className="text-white/60 mt-1">{filtered.length} lieu(x)</p>
        </div>

        <div className="flex gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher…"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-white outline-none"
          />
          <button
            onClick={() => router.push("/business/venues/new")}
            className="rounded-2xl bg-white text-black px-4 py-2 font-semibold"
          >
            + Nouveau
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {filtered.map((v) => (
          <div key={v.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-bold text-white">{v.name}</div>
            <div className="text-white/60 mt-1">
              {v.city} • {v.category}
            </div>
            {v.address && <div className="text-white/50 mt-2 text-sm">{v.address}</div>}
            <div className="text-white/40 mt-4 text-xs">Créé le: {new Date(v.createdAt).toLocaleString()}</div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
            Aucun lieu trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
