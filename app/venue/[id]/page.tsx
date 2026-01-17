"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Globe, Phone, Share, Heart, X, ChevronLeft, ChevronRight, Play, FileText, Edit, Trash2, Star, User, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import { deleteVenue } from "@/actions/venue";

export default function VenueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: session } = useSession();

  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reservation
  const [dateTime, setDateTime] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/venues/${id}`);
      const data = await res.json().catch(() => ({}));
      setVenue(data?.venue || null);
      setLoading(false);
    })();
  }, [id]);

  async function createReservation() {
    if (!session) {
      router.push("/login"); // Auth Check
      return;
    }

    if (!venue?.id || !dateTime) return;
    setMsg(null);
    setSaving(true);

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId: venue.id, dateTime }),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setMsg(data?.error || "Error");
      return;
    }
    setMsg("✅ Request sent! Check 'My Reservations'.");
    setDateTime("");
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this venue? This cannot be undone.")) return;
    const res = await deleteVenue(venue.id);
    if (res?.success) {
      router.push("/business/dashboard");
    } else {
      alert(res?.error || "Delete failed");
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/50">Loading magic...</div>;
  if (!venue) return <div className="min-h-screen flex items-center justify-center text-white/50">Venue not found.</div>;

  // Visual Media (Images + Videos) for Gallery
  const visualMedia = venue.media?.filter((m: any) => m.type === 'image' || m.type === 'video') || [];
  const pdfs = venue.media?.filter((m: any) => m.type === 'pdf') || [];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev < visualMedia.length - 1 ? prev + 1 : 0));
  };
  const prevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : visualMedia.length - 1));
  };

  // Permission Check
  // @ts-ignore
  const role = session?.user?.role;
  // @ts-ignore
  const userId = session?.user?.id; // Note: id might be directly on user or sub
  // Standard NextAuth structure depends on callback. Assuming id is available as verified in actions.
  // We'll check carefully. Use uid from token in logic, here relying on session shape.
  // Actually, usually session.user.id if configured.

  const isOwner = userId === venue.ownerId;
  const isAdmin = role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  return (
    <div className="max-w-7xl mx-auto pb-20 pt-4 px-4 sm:px-6">

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-50">
            <X className="w-8 h-8" />
          </button>

          <button onClick={prevLightbox} className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-50 hidden md:block">
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="relative w-full h-full p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {visualMedia[lightboxIndex].type === 'video' ? (
              <video
                src={visualMedia[lightboxIndex].url}
                controls
                autoPlay
                className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
              />
            ) : (
              <img
                src={visualMedia[lightboxIndex].url}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                alt="Full view"
              />
            )}
          </div>

          <button onClick={nextLightbox} className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-50 hidden md:block">
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightboxIndex + 1} / {visualMedia.length}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{venue.name}</h1>
          <div className="flex gap-2">
            {canEdit && (
              <>
                <button
                  onClick={() => router.push(`/business/edit-venue/${venue.id}`)}
                  className="p-2 rounded-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors"
                  title="Edit Venue"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                  title="Delete Venue"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="w-px h-8 bg-white/10 mx-1"></div>
              </>
            )}
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
              <Share className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm md:text-base">
          <span className="font-semibold text-white">
            {venue.reviews?.length > 0
              ? `★ ${(venue.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / venue.reviews.length).toFixed(1)}`
              : '★ Nouveau'}
          </span>
          <span>•</span>
          <span className="text-white hover:underline cursor-pointer">{venue.city}, Morocco</span>
          <span>•</span>
          <span>{venue.category}</span>
        </div>
      </div>

      {/* Bento Grid (Mixed Media) */}
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] rounded-2xl overflow-hidden mb-10 bg-black">
        {/* Main Item (Left Half) */}
        <div
          className="md:col-span-2 h-full relative group cursor-pointer"
          onClick={() => visualMedia[0] && openLightbox(0)}
        >
          {visualMedia[0] ? (
            <>
              {visualMedia[0].type === 'video' ? (
                <video
                  src={visualMedia[0].url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
              ) : (
                <img src={visualMedia[0].url} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="Main" />
              )}
              {visualMedia[0].type === 'video' && (
                <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full pointer-events-none">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20">No Image</div>
          )}
        </div>

        {/* Small Items (Right Halves) */}
        <div className="hidden md:grid md:col-span-2 grid-cols-2 grid-rows-2 gap-2 h-full">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/5 relative overflow-hidden group cursor-pointer border border-white/5"
              onClick={() => visualMedia[i] && openLightbox(i)}
            >
              {visualMedia[i] ? (
                <>
                  {visualMedia[i].type === 'video' ? (
                    <video
                      src={visualMedia[i].url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    <img src={visualMedia[i].url} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt={`Gallery ${i}`} />
                  )}
                  {visualMedia[i].type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full pointer-events-none">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/10">AGORA</div>
              )}
            </div>
          ))}
        </div>
      </div>   <button
        onClick={() => openLightbox(0)}
        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-black px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
      >
        Show all photos
      </button>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">

          {/* Host Info */}
          <div className="flex items-center justify-between border-b border-white/10 pb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Hosted by {venue.owner?.name || 'Business'}</h2>
              <p className="text-white/50 text-sm">{venue.category} • Joined 2024</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg" />
          </div>

          {/* Description */}
          <div className="border-b border-white/10 pb-8">
            <h2 className="text-xl font-bold text-white mb-4">About this place</h2>
            <p className="text-white/80 leading-relaxed whitespace-pre-line">{venue.description || "No description provided."}</p>
          </div>

          {/* Contact / Location */}
          <div className="border-b border-white/10 pb-8 space-y-4">
            <h2 className="text-xl font-bold text-white">Location & Contact</h2>
            <div className="grid gap-3 text-white/80">
              {venue.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  <span>{venue.address}</span>
                </div>
              )}
              {venue.locationUrl && (
                <a href={venue.locationUrl} target="_blank" className="flex items-center gap-3 hover:text-indigo-400">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <span className="underline">View on Google Maps</span>
                </a>
              )}
              {venue.website && (
                <a href={venue.website} target="_blank" className="flex items-center gap-3 hover:text-indigo-400">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <span>Website</span>
                </a>
              )}
              {venue.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-400" />
                  <span>{venue.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* PDF Menus Only */}
          {pdfs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Menus & Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-8">
                {pdfs.map((m: any) => (
                  <a key={m.id} href={m.url} target="_blank" className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors group">
                    <div className="p-3 bg-red-500/10 rounded-lg text-red-400 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">View Menu (PDF)</div>
                      <div className="text-xs text-white/50">Click to open</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="pt-4">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">Avis vérifiés</h2>
              <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-sm font-bold">
                ★ {venue.reviews?.length > 0
                  ? (venue.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / venue.reviews.length).toFixed(1)
                  : "Nouveau"}
              </div>
              <span className="text-white/40 text-sm">{venue.reviews?.length || 0} avis</span>
            </div>

            <div className="grid gap-6">
              {venue.reviews?.length > 0 ? (
                venue.reviews.map((rev: any) => (
                  <div key={rev.id} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{rev.user?.name || "Anonyme"}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-widest font-black">Client vérifié</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={rev.rating >= s ? "text-amber-400 fill-amber-400" : "text-white/10"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed italic">
                      "{rev.comment || "Aucun commentaire."}"
                    </p>
                    <div className="text-[10px] text-white/20">
                      Publié le {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                  <p className="text-white/30">Soyez le premier à donner votre avis après votre visite !</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Reservation */}
        <div className="relative">
          <div className="sticky top-24">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-bold text-white">Reserve</span>
                {venue.reservationsEnabled !== false && <span className="text-sm text-white/60">Free cancellation</span>}
              </div>

              {venue.reservationsEnabled !== false ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/20 overflow-hidden">
                    <div className="bg-black/20 p-3 border-b border-white/10">
                      <div className="text-xs uppercase font-bold text-white/60 mb-1">Date</div>
                      <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        className="w-full bg-transparent text-white outline-none text-sm"
                      />
                    </div>
                    <div className="bg-black/20 p-3">
                      <div className="text-xs uppercase font-bold text-white/60 mb-1">Guests</div>
                      <select className="w-full bg-transparent text-white outline-none text-sm">
                        <option className="bg-zinc-900">2 Guests</option>
                        <option className="bg-zinc-900">4 Guests</option>
                        <option className="bg-zinc-900">Large Party</option>
                      </select>
                    </div>
                  </div>

                  {session ? (
                    <button
                      onClick={createReservation}
                      disabled={saving || !dateTime}
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? "Booking..." : "Reserve"}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/login")}
                      className="w-full rounded-xl bg-white text-black font-bold py-3.5 hover:bg-zinc-200 transition-colors"
                    >
                      Log in to Reserve
                    </button>
                  )}

                  {msg && (
                    <p className={`text-center text-sm ${msg.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>
                  )}

                  <div className="py-4 flex justify-between text-white/70 text-sm">
                    <span className="underline">Service fee</span>
                    <span>$0</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-white">
                    <span>Total</span>
                    <span>Free</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="p-3 bg-white/5 rounded-full inline-flex mb-4 text-white/50">
                    <Phone className="w-6 h-6" />
                  </div>
                  <p className="text-white/80 font-medium mb-2">Reservations via Phone Only</p>
                  {venue.phone ? (
                    <div className="text-xl font-bold text-white tracking-wide">{venue.phone}</div>
                  ) : (
                    <p className="text-white/40 text-sm">No phone number available.</p>
                  )}
                  <p className="mt-4 text-xs text-white/40">
                    This venue does not accept online reservations.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center gap-2 text-white/40 text-sm">
              <span className="flex items-center gap-1"><span className="text-indigo-400">★</span> Rare find</span>
            </div>
          </div>
        </div>
      </div>
      {/* Events section if any */}
      {venue.events?.length > 0 && (
        <div className="mt-16 space-y-8">
          <h2 className="text-3xl font-black text-white px-2">Prochaines Soirées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venue.events.map((ev: any) => (
              <div key={ev.id} className="group relative rounded-[2.5rem] border border-white/10 bg-white/5 overflow-hidden flex flex-col">
                <div className="aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img src={ev.media?.[0]?.url || "/logo.png"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={ev.name} />
                </div>
                <div className="p-8 space-y-4 flex-1 flex flex-col">
                  <div>
                    <div className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-1">{ev.type}</div>
                    <h3 className="text-2xl font-black text-white">{ev.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-white/40 text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white/60 text-sm line-clamp-2">{ev.description}</p>

                  <div className="mt-auto pt-4">
                    {ev.ticketsEnabled && ev.ticketingUrl ? (
                      <a
                        href={ev.ticketingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black font-black py-4 hover:bg-zinc-200 transition-all hover:scale-[1.02]"
                      >
                        <FileText className="w-4 h-4" />
                        Acheter des billets
                      </a>
                    ) : (
                      <div className="text-center text-[10px] text-white/20 uppercase font-black py-2 tracking-widest">
                        Entrée libre / Réservation standard
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
