"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// @ts-ignore
import QRCode from "qrcode";

type Reservation = {
  id: string;
  dateTime: string;
  status: string;
  createdAt: string;
  checkinToken: string;
  venue: { id: string; name: string; city: string; category: string; address?: string | null };
};

export default function ReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/reservations");
    const data = await res.json().catch(() => ({}));
    const list = Array.isArray(data?.reservations) ? data.reservations : [];
    setItems(list);
    setLoading(false);

    const next: Record<string, string> = {};
    for (const r of list) {
      next[r.id] = await QRCode.toDataURL(r.checkinToken, { margin: 2, scale: 6 });
    }
    setQrMap(next);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Mes réservations</h1>
          <p className="text-white/60 mt-1">{loading ? "Chargement..." : `${items.length} réservation(s)`}</p>
        </div>

        <Link href="/explore" className="rounded-2xl bg-white text-black px-4 py-2 font-semibold hover:opacity-90">
          Explorer
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {!loading &&
          items.map((r) => (
            <div key={r.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-white font-bold text-lg">{r.venue.name}</div>
                <StatusBadge status={r.status} />
              </div>

              <div className="text-white/60 mt-1">
                {r.venue.city} • {r.venue.category}
              </div>

              <div className="mt-3 text-white/80">
                <span className="text-white/60">Date:</span>{" "}
                <span className="font-semibold">{new Date(r.dateTime).toLocaleString()}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-4 items-start">
                <div className="relative rounded-3xl border border-white/10 bg-white p-3">
                  {qrMap[r.id] ? (
                    <>
                      <img src={qrMap[r.id]} alt="QR" className="w-48 h-48 rounded-2xl" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="px-3 py-1 rounded-xl bg-black text-white font-extrabold tracking-widest text-sm">
                          AGORA
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-black/60">QR...</div>
                  )}
                </div>

                <div className="flex-1 min-w-[220px] text-white/70">
                  <div className="font-semibold text-white">Check-in</div>
                  <p className="mt-1 text-sm text-white/60">
                    QR signé et vérifié côté serveur. Seul le BUSINESS propriétaire du lieu peut valider.
                  </p>
                  <div className="mt-3">
                    <Link href={`/venue/${r.venue.id}`} className="text-white/80 underline hover:text-white">
                      Voir le lieu
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {!loading && items.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
            Aucune réservation.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const base = "px-3 py-1 rounded-full text-xs font-semibold border";
  if (s === "ACCEPTED") return <span className={`${base} border-emerald-300/30 bg-emerald-500/10 text-emerald-100`}>ACCEPTED</span>;
  if (s === "DECLINED") return <span className={`${base} border-red-300/30 bg-red-500/10 text-red-100`}>DECLINED</span>;
  if (s === "CHECKED_IN") return <span className={`${base} border-indigo-300/30 bg-indigo-500/10 text-indigo-100`}>CHECKED_IN</span>;
  return <span className={`${base} border-white/15 bg-white/5 text-white/80`}>PENDING</span>;
}
