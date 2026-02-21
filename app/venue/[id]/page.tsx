"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Globe, Phone, Share, Heart, X, ChevronLeft, ChevronRight,
  Play, FileText, Edit, Trash2, Star, User, Calendar, Utensils, ArrowRight,
  Instagram, Facebook, Music, Sparkles, CheckCircle2, ShieldCheck, Clock,
  CreditCard, ExternalLink, MessageCircle, Navigation, Info
} from "lucide-react";
import { useSession } from "next-auth/react";
import { deleteVenue } from "@/actions/venue";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import VirtualTourViewer from "@/components/venue/VirtualTourViewer";

export default function VenueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: session } = useSession();

  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reservation
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("20:00");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // PDF Modal
  const [menuModalIndex, setMenuModalIndex] = useState<number | null>(null);

  // Virtual Tour
  const [tourOpen, setTourOpen] = useState(false);

  // Reservation Modal (Global)
  const [resModalOpen, setResModalOpen] = useState(false);

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
      router.push(`/login?callbackUrl=${encodeURIComponent(`/venue/${id}`)}`); // Auth Check
      return;
    }

    if (!venue?.id || !selectedDate || !selectedTime) return;
    setMsg(null);
    setSaving(true);

    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const dateTime = `${yyyy}-${mm}-${dd}T${selectedTime}`;

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
    setSelectedDate(undefined);
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function confirmDelete() {
    const res = await deleteVenue(venue.id);
    if (res?.success) {
      router.push("/business/dashboard");
    } else {
      alert(res?.error || "Delete failed");
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/50">Loading magic...</div>;
  if (!venue) return <div className="min-h-screen flex items-center justify-center text-white/50">Venue not found.</div>;

  const rawGallery = venue.gallery || [];
  const visualMedia = rawGallery.filter((m: any) => m.kind === 'image' || m.kind === 'video');
  const menuPdfs = rawGallery.filter((m: any) => m.kind === 'pdf' || m.kind === 'menu_pdf');
  const menuImages = rawGallery.filter((m: any) => m.kind === 'menu_image');

  if (visualMedia.length === 0 && venue.coverImageUrl) {
    visualMedia.push({ url: venue.coverImageUrl, kind: 'image' });
  }

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

  // @ts-ignore
  const role = session?.user?.role;
  // @ts-ignore
  const userId = session?.user?.id;
  const isOwner = userId === venue.ownerId;
  const isAdmin = role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  return (
    <>
      <div className="max-w-7xl mx-auto pb-20 pt-4 px-4 sm:px-6">
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Venue?"
          message="Are you sure you want to delete this venue? This action cannot be undone."
          confirmLabel="Delete Forever"
          isDestructive={true}
        />

        {/* Menu Image Modal */}
        {menuModalIndex !== null && (
          <div
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col"
            onClick={() => setMenuModalIndex(null)}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-white font-bold block">Menu</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    Page {menuModalIndex + 1} of {rawGallery.filter((m: any) => m.kind === 'menu_image' || m.kind === 'menu_pdf').length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMenuModalIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rawGallery.filter((m: any) => m.kind === 'menu_image' || m.kind === 'menu_pdf').length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const items = rawGallery.filter((m: any) => m.kind === 'menu_image' || m.kind === 'menu_pdf');
                    setMenuModalIndex(prev => prev! > 0 ? prev! - 1 : items.length - 1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const items = rawGallery.filter((m: any) => m.kind === 'menu_image' || m.kind === 'menu_pdf');
                    setMenuModalIndex(prev => prev! < items.length - 1 ? prev! + 1 : 0);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              className="flex-1 overflow-auto flex items-center justify-center p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={rawGallery.filter((m: any) => m.kind === 'menu_image' || m.kind === 'menu_pdf')[menuModalIndex].url}
                alt="Menu"
                className="max-w-full rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
                style={{ maxHeight: "calc(100vh - 120px)", objectFit: "contain" }}
              />
            </div>
          </div>
        )}

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
              {visualMedia[lightboxIndex].kind === 'video' ? (
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
                    onClick={() => setShowDeleteModal(true)}
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
            <span className="text-white hover:underline cursor-pointer">{venue.city?.name || 'Casablanca'}, Morocco</span>
            <span>•</span>
            <span>{venue.category}</span>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-2 mb-10">
          <div className="md:col-span-2 relative rounded-2xl md:rounded-l-2xl md:rounded-r-none bg-black h-[300px] md:h-[450px] overflow-hidden">
            <div
              className="w-full h-full relative group cursor-pointer"
              onClick={() => visualMedia[0] && openLightbox(0)}
            >
              {visualMedia[0] ? (
                <>
                  {visualMedia[0].kind === 'video' ? (
                    <video
                      src={visualMedia[0].url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    <>
                      <img
                        src={visualMedia[0].url}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        alt="Main"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                  {visualMedia[0].kind === 'video' && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full pointer-events-none">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                  {visualMedia.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
                      +{visualMedia.length - 1} photos
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white/20">No Image</div>
              )}
            </div>

            {venue.floorPlan && (
              <button
                type="button"
                onClick={() => setTourOpen(true)}
                className="absolute top-4 left-4 z-[60] flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all shadow-xl group hover:scale-105 active:scale-95 pointer-events-auto"
              >
                <Navigation className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                Visite Virtuelle 360°
              </button>
            )}
          </div>

          <div className="hidden md:grid md:col-span-2 grid-cols-2 grid-rows-2 gap-2 rounded-r-2xl overflow-hidden h-[450px]">
            {[1, 2, 3, 4].map((i) => {
              if (!visualMedia[i]) return <div key={i} className="hidden" />;
              return (
                <div
                  key={i}
                  className="relative overflow-hidden group cursor-pointer bg-black"
                  onClick={() => openLightbox(i)}
                >
                  {visualMedia[i].kind === 'video' ? (
                    <video
                      src={visualMedia[i].url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    <img src={visualMedia[i].url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Gallery ${i}`} />
                  )}
                  {visualMedia[i].kind === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-1.5 rounded-full pointer-events-none">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-black px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
        >
          Show all photos
        </button>

        {/* Discovery Row: About, Presence & Location */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-10 mb-12">
          {/* About Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-400" />
              À propos
            </h2>
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line italic border-l border-indigo-500/30 pl-4">
              {venue.description || "Une expérience unique vous attend chez " + venue.name + "."}
            </p>
          </div>

          {/* Presence Online Column */}
          <div className="space-y-4">
            {(venue.instagramUrl || venue.tiktokUrl || venue.facebookUrl || venue.website) && (
              <div className="space-y-3">
                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  Présence en ligne
                </h2>
                <div className="flex flex-wrap gap-3">
                  {venue.instagramUrl && (
                    <a href={venue.instagramUrl} target="_blank" className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95 group shadow-lg" title="Instagram">
                      <Instagram className="w-6 h-6 text-pink-500" />
                    </a>
                  )}
                  {venue.tiktokUrl && (
                    <a href={venue.tiktokUrl} target="_blank" className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95 group shadow-lg" title="TikTok">
                      <MessageCircle className="w-6 h-6 text-cyan-400" />
                    </a>
                  )}
                  {venue.facebookUrl && (
                    <a href={venue.facebookUrl} target="_blank" className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95 group shadow-lg" title="Facebook">
                      <Facebook className="w-6 h-6 text-blue-500" />
                    </a>
                  )}
                  {venue.website && (
                    <a href={venue.website.startsWith('http') ? venue.website : `https://${venue.website}`} target="_blank" className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95 group shadow-lg" title="Site Web">
                      <Globe className="w-6 h-6 text-indigo-400" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Location Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Localisation
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {venue.locationUrl && (
                  <a
                    href={venue.locationUrl}
                    target="_blank"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500/20 transition-all group shadow-lg"
                  >
                    <img src="https://www.google.com/images/branding/product/2x/maps_96dp.png" className="w-4 h-4 object-contain" alt="G-Maps" />
                    G-Maps
                  </a>
                )}
                {venue.wazeUrl && (
                  <a
                    href={venue.wazeUrl}
                    target="_blank"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500/20 transition-all group shadow-lg"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Waze_logo.svg" className="w-4 h-4 object-contain" alt="Waze" />
                    Waze
                  </a>
                )}
              </div>
              <p className="text-white/60 text-sm font-medium leading-relaxed italic pl-1 border-l border-red-500/30">
                {venue.address}
              </p>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column: Details & Reviews */}
          <div className="lg:col-span-2 space-y-16">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Détails & Services
            </h2>
            <div className="flex flex-col md:flex-row gap-x-12 gap-y-6">
              <div className="flex-1 space-y-6">
                {venue.subcategories?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/50">
                      <Navigation className="w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Type</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {venue.subcategories.map((s: any) => (
                        <span key={s.subcategory.id} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors cursor-default">
                          {s.subcategory.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {venue.vibes?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-pink-400/50">
                      <Sparkles className="w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Ambiance</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {venue.vibes.map((v: any) => (
                        <span key={v.vibe.id} className="px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-200 text-sm font-medium">
                          {v.vibe.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {venue.facilities?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400/50">
                      <CheckCircle2 className="w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Services</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {venue.facilities.map((f: any) => (
                        <div key={f.facility.id} className="flex items-center gap-3 text-white/80 text-sm bg-white/[0.03] p-2 rounded-lg border border-white/5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                          {f.facility.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-6">
                {venue.cuisines?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-orange-400/50">
                      <Utensils className="w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Cuisine</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {venue.cuisines.map((c: any) => (
                        <span key={c.cuisine.id} className="inline-flex items-center px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm font-medium transition-all hover:bg-orange-500/20">
                          <Utensils className="w-3.5 h-3.5 mr-2 text-orange-500/70" />
                          {c.cuisine.name}
                        </span>
                      ))}
                    </div>
                    {(() => {
                      const menuItems = rawGallery.filter((m: any) => m.kind === 'menu_image' || m.kind === 'menu_pdf');
                      if (menuItems.length === 0 && !venue.menuUrl) return null;
                      return (
                        <div className="pt-2">
                          <button onClick={() => setMenuModalIndex(0)} className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all group shadow-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="text-left">
                                <span className="font-black text-white block uppercase text-[10px] tracking-widest">Consulter le menu</span>
                                {menuItems.length > 0 && <span className="text-[10px] text-white/30 font-bold uppercase">{menuItems.length} {menuItems.length > 1 ? 'Pages' : 'Page'}</span>}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all group-hover:translate-x-1" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {venue.musicTypes?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400/50">
                      <Music className="w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Musique</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {venue.musicTypes.map((m: any) => (
                        <span key={m.musicType.id} className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm font-medium">
                          {m.musicType.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {venue.policies?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-zinc-400/50">
                      <ShieldCheck className="w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Règles</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {venue.policies.map((p: any) => (
                        <div key={p.policy.id} className="flex items-center gap-3 text-white/70 text-sm bg-white/[0.02] p-2 rounded-lg border border-white/5 italic">
                          <div className="w-1 h-3 rounded-full bg-white/20" />
                          {p.policy.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                      <p className="text-white/70 text-sm leading-relaxed italic">"{rev.comment || "Aucun commentaire."}"</p>
                      <div className="text-[10px] text-white/20">Publié le {new Date(rev.createdAt).toLocaleDateString()}</div>
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

          {/* Right Column: Reservation Card */}
          <div className="space-y-8">
            <div className="relative group/card">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.6rem] blur-xl opacity-10 group-hover/card:opacity-20 transition duration-1000" />
              <div className="sticky top-24">
                <div className="rounded-[2.5rem] bg-zinc-950/40 backdrop-blur-2xl p-8 flex flex-col items-center gap-8 overflow-hidden relative border border-white/5 shadow-2xl">
                  <div className="absolute top-8 right-8 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live</span>
                  </div>
                  <div className="relative pt-4">
                    <div className="p-4 bg-white/5 rounded-3xl border border-white/10 relative z-10">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center space-y-3 relative z-10 w-full">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                      Réserver <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">votre table</span>
                    </h3>
                    <p className="text-white/40 text-[13px] font-medium leading-relaxed px-4">Bénéficiez d'une confirmation prioritaire et sécurisée pour votre soirée.</p>
                  </div>
                  <div className="w-full relative group/btn-container">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl blur opacity-30 group-hover/btn-container:opacity-100 transition duration-500" />
                    <button onClick={() => setResModalOpen(true)} className="relative w-full py-5 bg-black rounded-2xl flex items-center justify-center gap-3 overflow-hidden transition-all active:scale-[0.98]">
                      <div className="absolute inset-0 opacity-0 group-hover/btn-container:opacity-20 transition-opacity bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
                      <span className="relative z-10 text-white font-black uppercase text-xs tracking-[0.4em]">Book l'expérience</span>
                      <ArrowRight className="relative z-10 w-4 h-4 text-indigo-400 group-hover/btn-container:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                    </button>
                  </div>
                  <div className="pt-2 text-[10px] text-white/20 font-black uppercase tracking-[0.2em] relative z-10">Zéro frais • Annulation flexible</div>
                </div>
                <div className="mt-6 flex justify-center items-center gap-2">
                  <div className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 flex items-center gap-2 backdrop-blur-md">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Agora Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events section if any */}
        {
          venue.events && venue.events.length > 0 && (
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
                          <a href={ev.ticketingUrl} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black font-black py-4 hover:bg-zinc-200 transition-all hover:scale-[1.02]">
                            <FileText className="w-4 h-4" /> Acheter des billets
                          </a>
                        ) : (
                          <div className="text-center text-[10px] text-white/20 uppercase font-black py-2 tracking-widest">Entrée libre / Réservation standard</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* Global Fixed Reservation Bar (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-500">
          <div className="flex flex-col min-w-0">
            <span className="text-white font-black text-lg truncate whitespace-nowrap">{venue.name}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Réservez en un clic</span>
          </div>
          <button onClick={() => setResModalOpen(true)} className="px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 whitespace-nowrap">
            Réserver à {venue.name}
          </button>
        </div>

        {/* Reservation Modal */}
        {
          resModalOpen && (
            <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 relative">
                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl"><Calendar className="w-6 h-6 text-indigo-400" /></div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">Réserver à {venue.name}</h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Confirmation instantanée</p>
                      </div>
                    </div>
                    <button onClick={() => setResModalOpen(false)} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">1. Choisir la date</label>
                      <DatePicker value={selectedDate} onChange={setSelectedDate} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">2. Choisir l'heure</label>
                      <TimePicker value={selectedTime} onChange={setSelectedTime} />
                    </div>
                    {msg && (
                      <div className={`p-4 rounded-2xl text-sm font-bold text-center ${msg?.includes('✅') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {msg}
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        await createReservation();
                        if (msg?.includes('✅')) {
                          setTimeout(() => setResModalOpen(false), 2000);
                        }
                      }}
                      disabled={saving || !selectedDate}
                      className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {saving ? "Chargement..." : "Confirmer la réservation"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >

      {
        venue.floorPlan && (
          <VirtualTourViewer
            isOpen={tourOpen}
            onClose={() => setTourOpen(false)}
            scenes={(() => {
              try {
                const data = typeof venue.floorPlan === 'string' ? JSON.parse(venue.floorPlan) : venue.floorPlan;
                if (Array.isArray(data)) return data;
                if (data?.scenes && Array.isArray(data.scenes)) return data.scenes;
                return [];
              } catch (e) {
                console.error("Error parsing floorPlan:", e);
                return [];
              }
            })()}
          />
        )
      }
    </>
  );
}
