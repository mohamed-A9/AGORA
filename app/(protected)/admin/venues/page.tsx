"use client";

import { useEffect, useState } from "react";

type Venue = {
  id: string;
  name: string;
  city: string;
  category: string;
  address: string | null;
  status: "PENDING" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED" | "LIVE" | "DRAFT";
  rejectionReason?: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  owner: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
  } | null;
};

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "DRAFT";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("PENDING"); // Default filter

  async function load() {
    setLoading(true);
    // API handles "PENDING" as PENDING + PENDING_APPROVAL
    const res = await fetch(`/api/admin/venues?status=${filter}&q=${encodeURIComponent(q)}`);
    const data = await res.json().catch(() => ({}));
    setVenues(Array.isArray(data?.venues) ? data.venues : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setStatus(id: string, status: Venue["status"], reason?: string) {
    if (!confirm(`Confirm status change to ${status}?`)) return;

    setBusyId(id);
    const res = await fetch(`/api/admin/venues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason: reason }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);

    if (!res.ok) {
      alert(data?.error || "Error updating venue");
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
            {loading ? "Loading..." : `${venues.length} venue(s)`}
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-2xl bg-white text-black px-4 py-2 font-semibold hover:opacity-90 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (name, city, category, email...)"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/30 transition-colors"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/30 transition-colors"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved / Live</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
          <option value="DRAFT">Drafts</option>
        </select>

        <button
          onClick={load}
          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white hover:bg-white/15 transition-colors"
        >
          Search
        </button>
      </div>

      <div className="grid gap-4">
        {!loading &&
          venues.map((v) => {
            const locked = busyId === v.id;
            const isPending = v.status === "PENDING" || v.status === "PENDING_APPROVAL";

            return (
              <div key={v.id} className={`rounded-3xl border border-white/10 bg-white/5 p-6 transition-all ${isPending ? 'ring-1 ring-amber-500/30' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-white font-extrabold text-lg flex items-center gap-2">
                      {v.name}
                      {isPending && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                    </div>
                    <div className="text-white/60 text-sm">
                      {v.city} • {v.category} {v.address ? `• ${v.address}` : ""}
                    </div>
                    <div className="text-white/45 text-xs mt-1 font-mono select-all">
                      ID: {v.id}
                    </div>
                  </div>

                  <StatusBadge status={v.status} />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-1">
                    <div className="text-xs uppercase tracking-wide text-white/50 font-bold">Owner Details</div>
                    <div className="text-white font-medium">
                      {v.owner?.name || "Unknown"} <span className="text-white/40 text-xs">({v.owner?.role || "N/A"})</span>
                    </div>
                    <div className="text-white/60 text-sm">{v.owner?.email || "No Email"}</div>
                    <div className="text-white/60 text-sm select-all">{v.owner?.phone || "No phone"}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-1">
                    <div className="text-xs uppercase tracking-wide text-white/50 font-bold">Status Log</div>
                    {v.approvedAt && (
                      <div className="text-white/80 text-sm">
                        Approved: <span className="text-white">{new Date(v.approvedAt).toLocaleDateString()}</span> by {v.approvedBy}
                      </div>
                    )}
                    {v.rejectionReason && (
                      <div className="text-red-300 text-sm bg-red-500/10 p-2 rounded-lg mt-1 border border-red-500/20">
                        <strong>Rejection Reason:</strong> {v.rejectionReason}
                      </div>
                    )}
                    <div className="text-white/40 text-xs mt-1">Created: {new Date(v.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 pt-4 border-t border-white/5">
                  {/* View/Review Button */}
                  <a
                    href={`/venue/${v.id}?preview=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-200 px-4 py-2 font-bold text-sm transition-all flex items-center gap-2"
                  >
                    👁️ Review Content
                  </a>

                  {/* Approve Button - Only if NOT approved/live */}
                  {(v.status !== 'APPROVED' && v.status !== 'LIVE') && (
                    <button
                      disabled={locked}
                      onClick={() => setStatus(v.id, "APPROVED")}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      Approve
                    </button>
                  )}

                  <button
                    disabled={locked}
                    onClick={() => {
                      const reason = prompt("Reason for rejection (will be sent to user):");
                      if (reason) setStatus(v.id, "REJECTED", reason);
                    }}
                    className="rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-200 px-4 py-2 font-bold text-sm transition-all disabled:opacity-50"
                  >
                    Reject
                  </button>

                  <button
                    disabled={locked}
                    onClick={() => setStatus(v.id, "SUSPENDED")}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white px-4 py-2 font-medium text-sm transition-all disabled:opacity-50"
                  >
                    Suspend
                  </button>

                  {v.status === 'REJECTED' || v.status === 'SUSPENDED' ? (
                    <button
                      disabled={locked}
                      onClick={() => setStatus(v.id, "PENDING_APPROVAL")}
                      className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white px-4 py-2 font-medium text-sm transition-all disabled:opacity-50 ml-auto"
                    >
                      Reset to Pending
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}

        {!loading && venues.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-white/60 text-lg">No venues found matching current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Venue["status"] }) {
  const base = "px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider";

  if (status === "APPROVED")
    return <span className={`${base} border-emerald-500/30 bg-emerald-500/10 text-emerald-400`}>Approved</span>;
  if (status === "LIVE")
    return <span className={`${base} border-emerald-500/30 bg-emerald-500/20 text-emerald-300 shadow shadow-emerald-500/20`}>Live</span>;
  if (status === "SUSPENDED")
    return <span className={`${base} border-amber-500/30 bg-amber-500/10 text-amber-400`}>Suspended</span>;
  if (status === "REJECTED")
    return <span className={`${base} border-red-500/30 bg-red-500/10 text-red-400`}>Rejected</span>;
  if (status === "DRAFT")
    return <span className={`${base} border-zinc-500/30 bg-zinc-500/10 text-zinc-400`}>Draft</span>;

  // Pending
  return <span className={`${base} border-blue-500/30 bg-blue-500/10 text-blue-400 animate-pulse`}>Pending Review</span>;
}
