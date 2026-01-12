"use client";

import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  dateTime: string;
  status: string;
  qrToken: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  venue: { id: string; name: string; city: string; category: string };
};

type StatusFilter = "ALL" | "PENDING" | "ACCEPTED" | "DECLINED" | "CHECKED_IN";

export default function BusinessReservationsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/business/reservations");
    const data = await res.json().catch(() => ({}));
    setItems(Array.isArray(data?.reservations) ? data.reservations : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: "ACCEPTED" | "DECLINED" | "CHECKED_IN") {
    setBusyId(id);

    const res = await fetch(`/api/business/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await res.json().catch(() => ({}));
    setBusyId(null);

    if (!res.ok) {
      alert(data?.error || "Erreur update status");
      return;
    }

    await load();
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return items.filter((r) => {
      const matchText =
        !s ||
        r.venue.name.toLowerCase().includes(s) ||
        r.venue.city.toLowerCase().includes(s) ||
        r.venue.category.toLowerCase().includes(s) ||
        (r.user.name || "").toLowerCase().includes(s) ||
        r.user.email.toLowerCase().includes(s) ||
        (r.user.phone || "").toLowerCase().includes(s) ||
        (r.qrToken || "").toLowerCase().includes(s);

      const matchStatus =
        statusFilter === "ALL" ? true : r.status.toUpperCase() === statusFilter;

      return matchText && matchStatus;
    });
  }, [items, q, statusFilter]);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Réservations reçues</h1>
          <p className="text-white/60 mt-1">
            {loading ? "Chargement..." : `${filtered.length} / ${items.length} réservation(s)`}
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-2xl bg-white text-black px-4 py-2 font-semibold hover:opacity-90"
        >
          Rafraîchir
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Recherche (lieu, ville, client, email, phone...)"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PENDING">PENDING</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="DECLINED">DECLINED</option>
          <option value="CHECKED_IN">CHECKED_IN</option>
        </select>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 text-sm">
          Règles: PENDING → Accept/Decline, ACCEPTED → Check-in. Sinon boutons grisés.
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {!loading &&
          filtered.map((r) => {
            const s = r.status.toUpperCase();
            const isPending = s === "PENDING";
            const isAccepted = s === "ACCEPTED";

            const acceptDisabled = busyId === r.id || !isPending;
            const declineDisabled = busyId === r.id || !isPending;
            const checkinDisabled = busyId === r.id || !isAccepted;

            return (
              <div key={r.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-bold text-lg">{r.venue.name}</div>
                    <div className="text-white/60">
                      {r.venue.city} • {r.venue.category}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-white/50">Client</div>
                    <div className="mt-1 text-white">{r.user.name || "—"}</div>
                    <div className="text-white/60 text-sm">{r.user.email}</div>
                    <div className="text-white/60 text-sm">
                      📞 {r.user.phone || "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-white/50">Date</div>
                    <div className="mt-1 text-white font-semibold">
                      {new Date(r.dateTime).toLocaleString()}
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      QR(DB legacy): <span className="font-mono break-all">{r.qrToken}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    disabled={acceptDisabled}
                    onClick={() => setStatus(r.id, "ACCEPTED")}
                    className="rounded-2xl bg-white text-black px-4 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {busyId === r.id ? "..." : "Accepter"}
                  </button>

                  <button
                    disabled={declineDisabled}
                    onClick={() => setStatus(r.id, "DECLINED")}
                    className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Refuser
                  </button>

                  <button
                    disabled={checkinDisabled}
                    onClick={() => setStatus(r.id, "CHECKED_IN")}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-white hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check-in
                  </button>
                </div>

                <div className="mt-3 text-xs text-white/45">
                  Reservation ID: <span className="font-mono">{r.id}</span>
                </div>
              </div>
            );
          })}

        {!loading && filtered.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
            Aucune réservation trouvée.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const base = "px-3 py-1 rounded-full text-xs font-semibold border";
  if (s === "ACCEPTED")
    return <span className={`${base} border-emerald-300/30 bg-emerald-500/10 text-emerald-100`}>ACCEPTED</span>;
  if (s === "DECLINED")
    return <span className={`${base} border-red-300/30 bg-red-500/10 text-red-100`}>DECLINED</span>;
  if (s === "CHECKED_IN")
    return <span className={`${base} border-indigo-300/30 bg-indigo-500/10 text-indigo-100`}>CHECKED_IN</span>;
  return <span className={`${base} border-white/15 bg-white/5 text-white/80`}>PENDING</span>;
}
