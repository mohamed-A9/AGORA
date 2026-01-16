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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Reservations</h1>
          <p className="text-white/60 mt-2 text-lg">
            {loading ? "Loading..." : `Manage ${filtered.length} booking(s)`}
          </p>
        </div>

        <button
          onClick={load}
          className="group flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-2xl font-semibold hover:bg-white/20 transition-all"
        >
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-10 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
        <div className="md:col-span-4 relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search (venue, guest, email...)"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer appearance-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Declined</option>
            <option value="CHECKED_IN">Checked In</option>
          </select>
        </div>

        <div className="md:col-span-3 flex items-center justify-center text-xs text-white/50 text-center px-2">
          Action required for Pending items.
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {!loading &&
          filtered.map((r) => {
            const s = r.status.toUpperCase();
            const isPending = s === "PENDING";
            const isAccepted = s === "ACCEPTED";

            const acceptDisabled = busyId === r.id || !isPending;
            const declineDisabled = busyId === r.id || !isPending;
            const checkinDisabled = busyId === r.id || !isAccepted;

            return (
              <div key={r.id} className="relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-2xl">
                      📅
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg leading-tight">{r.venue.name}</div>
                      <div className="text-white/60 text-sm mt-0.5">
                        {r.venue.city} • {r.venue.category}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-black/20 rounded-2xl p-4 border border-white/5">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Guest Details</div>
                    <div className="font-semibold text-white">{r.user.name || "Guest"}</div>
                    <div className="text-sm text-white/60">{r.user.email}</div>
                    <div className="text-sm text-white/60">{r.user.phone || "No phone"}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Reservation Time</div>
                    <div className="font-semibold text-white text-lg">
                      {new Date(r.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm text-white/60">
                      {new Date(r.dateTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="space-y-1 lg:col-span-1 md:col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Verification</div>
                    <div className="font-mono text-xs bg-white/5 p-2 rounded border border-white/10 text-white/70 break-all">
                      {r.qrToken || "NO-TOKEN"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 justify-end border-t border-white/5 pt-4">
                  {isPending && (
                    <>
                      <button
                        disabled={acceptDisabled}
                        onClick={() => setStatus(r.id, "ACCEPTED")}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                      >
                        {busyId === r.id ? "Processing..." : "Accept Booking"}
                      </button>
                      <button
                        disabled={declineDisabled}
                        onClick={() => setStatus(r.id, "DECLINED")}
                        className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm disabled:opacity-50 transition-all"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      disabled={checkinDisabled}
                      onClick={() => setStatus(r.id, "CHECKED_IN")}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      Check-in Guest
                    </button>
                  )}

                  {!isPending && !isAccepted && (
                    <span className="text-white/30 text-sm italic py-2">No actions available</span>
                  )}
                </div>
              </div>
            );
          })}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-white">No reservations found</h3>
            <p className="text-white/50 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const base = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border";
  if (s === "ACCEPTED")
    return <span className={`${base} border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]`}>Accepted</span>;
  if (s === "DECLINED")
    return <span className={`${base} border-red-500/30 bg-red-500/10 text-red-300`}>Declined</span>;
  if (s === "CHECKED_IN")
    return <span className={`${base} border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]`}>Checked In</span>;
  return <span className={`${base} border-amber-500/30 bg-amber-500/10 text-amber-300 animate-pulse`}>Pending Approval</span>;
}
