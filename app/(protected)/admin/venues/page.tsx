"use client";

import { useEffect, useState } from "react";

type Venue = {
  id: string;
  name: string;
  city: string;
  category: string;
  address: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  owner: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
  };
};

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/venues?status=${filter}&q=${encodeURIComponent(q)}`);
    const data = await res.json().catch(() => ({}));
    setVenues(Array.isArray(data?.venues) ? data.venues : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setStatus(id: string, status: Venue["status"]) {
    setBusyId(id);
    const res = await fetch(`/api/admin/venues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);

    if (!res.ok) {
      alert(data?.error || "Erreur update venue");
      return;
    }
    load();
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin — Venues</h1>
          <p className="text-white/60 mt-1">
            {loading ? "Chargement..." : `${venues.length} venue(s)`}
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-2xl bg-white text-black px-4 py-2 font-semibold hover:opacity-90"
        >
          Rafraîchir
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Recherche (nom, ville, catégorie, email, phone...)"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        >
          <option value="ALL">Tous</option>
          <option value="PENDING">PENDING (à valider)</option>
          <option value="APPROVED">APPROVED (visible users)</option>
          <option value="SUSPENDED">SUSPENDED (retard paiement)</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <button
          onClick={load}
          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white hover:bg-white/15"
        >
          Rechercher
        </button>
      </div>

      <div className="grid gap-4">
        {!loading &&
          venues.map((v) => {
            const locked = busyId === v.id;

            return (
              <div key={v.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-white font-extrabold text-lg">{v.name}</div>
                    <div className="text-white/60 text-sm">
                      {v.city} • {v.category} {v.address ? `• ${v.address}` : ""}
                    </div>
                    <div className="text-white/45 text-xs mt-1">
                      ID: <span className="font-mono">{v.id}</span>
                    </div>
                  </div>

                  <StatusBadge status={v.status} />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-white/50">Owner</div>
                    <div className="mt-1 text-white">
                      {v.owner.name || "—"} <span className="text-white/50">({v.owner.role})</span>
                    </div>
                    <div className="text-white/60 text-sm">{v.owner.email}</div>
                    <div className="text-white/60 text-sm">📞 {v.owner.phone || "—"}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-white/50">Validation</div>
                    <div className="mt-1 text-white/80 text-sm">
                      approvedAt:{" "}
                      <span className="text-white">
                        {v.approvedAt ? new Date(v.approvedAt).toLocaleString() : "—"}
                      </span>
                    </div>
                    <div className="text-white/80 text-sm">
                      approvedBy: <span className="text-white">{v.approvedBy || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    disabled={locked}
                    onClick={() => setStatus(v.id, "APPROVED")}
                    className="rounded-2xl bg-white text-black px-4 py-2 font-semibold disabled:opacity-50"
                  >
                    Approve
                  </button>

                  <button
                    disabled={locked}
                    onClick={() => setStatus(v.id, "SUSPENDED")}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-white hover:bg-black/30 disabled:opacity-50"
                  >
                    Suspendre (retard paiement)
                  </button>

                  <button
                    disabled={locked}
                    onClick={() => setStatus(v.id, "REJECTED")}
                    className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white hover:bg-white/15 disabled:opacity-50"
                  >
                    Reject
                  </button>

                  <button
                    disabled={locked}
                    onClick={() => setStatus(v.id, "PENDING")}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-white hover:bg-black/30 disabled:opacity-50"
                  >
                    Remettre Pending
                  </button>
                </div>

                <div className="mt-3 text-xs text-white/45">
                  Note: <b>SUSPENDED</b> = le business existe mais tu bloques sa visibilité/réservation tant que paiement pas OK.
                </div>
              </div>
            );
          })}

        {!loading && venues.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
            Aucun venue trouvé.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Venue["status"] }) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold border";
  if (status === "APPROVED")
    return <span className={`${base} border-emerald-300/30 bg-emerald-500/10 text-emerald-100`}>APPROVED</span>;
  if (status === "SUSPENDED")
    return <span className={`${base} border-amber-300/30 bg-amber-500/10 text-amber-100`}>SUSPENDED</span>;
  if (status === "REJECTED")
    return <span className={`${base} border-red-300/30 bg-red-500/10 text-red-100`}>REJECTED</span>;
  return <span className={`${base} border-white/15 bg-white/5 text-white/80`}>PENDING</span>;
}
