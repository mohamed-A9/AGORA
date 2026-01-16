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
  const [selectedForReview, setSelectedForReview] = useState<Reservation | null>(null);

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
                  <div className="mt-4 flex flex-wrap gap-4 items-center">
                    <Link href={`/venue/${r.venue.id}`} className="text-white/80 underline hover:text-white text-sm">
                      Voir le lieu
                    </Link>
                    {r.status === "CHECKED_IN" && (
                      <button
                        onClick={() => setSelectedForReview(r)}
                        className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold hover:bg-emerald-500/20 transition-all"
                      >
                        Laisser un avis
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

        {selectedForReview && (
          <ReviewModal
            reservation={selectedForReview}
            onClose={() => setSelectedForReview(null)}
            onSuccess={() => {
              setSelectedForReview(null);
              // Optionnel: rafraîchir ou marquer comme déjà noté
              load();
            }}
          />
        )}

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

function ReviewModal({ reservation, onClose, onSuccess }: { reservation: Reservation; onClose: () => void; onSuccess: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/user/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId: reservation.venue.id, rating, comment }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Une erreur est survenue");
    } else {
      onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-zinc-900 p-8 shadow-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h3 className="text-2xl font-bold text-white">Votre avis sur {reservation.venue.name}</h3>
          <p className="text-white/40 text-sm">Partagez votre expérience avec la communauté.</p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-white/10'}`}
            >
              <svg className="w-10 h-10 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Écrivez votre commentaire ici..."
            className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-4 text-white placeholder:text-white/20 outline-none focus:border-indigo-500 transition-colors resize-none"
          />

          {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-white/5 text-white/50 font-bold py-3 hover:bg-white/10 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="flex-1 rounded-xl bg-white text-black font-bold py-3 hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {saving ? "Envoi..." : "Publier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
