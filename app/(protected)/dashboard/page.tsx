"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Calendar, Star, MapPin, Sparkles, TrendingUp, History, User } from "lucide-react";

interface DashboardData {
  stats: {
    reservations: number;
    reviews: number;
  };
  upcoming: any[];
  trending: any[];
  recommendations: any[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const name = (session?.user as any)?.name as string | undefined;

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/dashboard")
        .then(res => res.json())
        .then(d => {
          setData(d);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch dashboard data:", err);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium font-outfit">Initialisation de votre cockpit...</p>
        </div>
      </div>
    );
  }

  // Safety check for data
  if (!data?.stats) {
    if (loading) return null; // Should be handled above, but just in case
    // If not loading and no stats, it might be an error state
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-white/50 gap-4">
        <p>Une erreur est survenue lors du chargement des données.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-500 rounded-lg text-white font-bold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-12">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Sparkles className="w-32 h-32 text-indigo-400" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white font-outfit">
            Bienvenue, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">{name || "Utilisateur"}</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl">
            Votre espace personnel AGORA. Retrouvez vos prochaines sorties et les dernières pépites sélectionnées pour vous.
          </p>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Réservations" value={data?.stats?.reservations || 0} color="text-indigo-400" />
        <StatCard icon={Star} label="Avis donnés" value={data?.stats?.reviews || 0} color="text-amber-400" />
        <StatCard icon={TrendingUp} label="Points Agora" value={Math.floor((data?.stats?.reservations || 0) * 10)} color="text-emerald-400" />
        <StatCard icon={History} label="Visites" value={data?.stats?.reservations || 0} color="text-fuchsia-400" />
      </div>

      <div className="grid gap-10">
        {/* Upcoming Reservations */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar className="text-indigo-400" /> Vos Prochaines Sorties
            </h2>
            <Link href="/reservations" className="text-sm font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">
              Voir tout
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {data?.upcoming && data.upcoming.length > 0 ? (
              data.upcoming.map((res: any) => (
                <ReservationCard key={res.id} reservation={res} />
              ))
            ) : (
              <EmptyCard
                title="Aucune réservation"
                desc="Vous n'avez pas de sortie prévue. Trouvez l'endroit parfait pour ce soir !"
                cta="Explorer les lieux"
                href="/explore"
              />
            )}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Recommendations based on prefs */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Sparkles className="text-fuchsia-400" /> Sélectionné pour vous
            </h2>
            <div className="grid gap-4">
              {data?.recommendations && data.recommendations.length > 0 ? (
                data.recommendations.map((venue: any) => (
                  <MinimalVenueCard key={venue.id} venue={venue} />
                ))
              ) : (
                <EmptyCard
                  title="Complétez votre profil"
                  desc="Ajoutez vos villes et ambiances favorites pour des recommandations sur-mesure."
                  cta="Gérer mes préférences"
                  href="/profile"
                  mini
                />
              )}
            </div>
          </section>

          {/* New & Trending */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="text-amber-400" /> Nouveautés sur Agora
            </h2>
            <div className="grid gap-4">
              {data?.trending && data.trending.map((venue: any) => (
                <MinimalVenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl group hover:border-white/20 transition-all">
      <Icon className={`w-5 h-5 ${color} mb-3`} />
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="text-[10px] uppercase font-black tracking-widest text-white/30">{label}</div>
    </div>
  );
}

function ReservationCard({ reservation }: any) {
  const dateStr = new Date(reservation.dateTime).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link href="/reservations" className="group rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold text-center leading-tight">
          {dateStr.split(" ").map((s, i) => (
            <div key={i} className={i === 0 ? "text-xl font-black" : "text-[10px] uppercase"}>{s}</div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white truncate">{reservation.venue.name}</h4>
          <div className="text-white/40 text-xs flex items-center gap-1">
            <MapPin size={12} /> {reservation.venue.city}
          </div>
          <div className="mt-2 text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {reservation.status}
          </div>
        </div>
      </div>
    </Link>
  );
}

function MinimalVenueCard({ venue }: any) {
  return (
    <Link href={`/venue/${venue.id}`} className="group flex items-center gap-4 p-4 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all">
      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5">
        {venue.media?.[0]?.url ? (
          <img src={venue.media[0].url} alt={venue.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <Sparkles size={20} />
          </div>
        )}
      </div>
      <div>
        <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors">{venue.name}</h4>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.1em] text-white/30">
          <span>{venue.city}</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>{venue.category}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyCard({ title, desc, cta, href, mini }: { title: string; desc: string; cta: string; href: string; mini?: boolean }) {
  return (
    <div className={`rounded-3xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center ${mini ? 'p-8' : 'p-12 h-full'}`}>
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Sparkles className="text-white/20" />
      </div>
      <h4 className="text-lg font-bold text-white">{title}</h4>
      <p className="text-white/40 text-sm mt-1 mb-6 max-w-[240px] leading-relaxed">{desc}</p>
      <Link href={href} className="px-6 py-2 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all">
        {cta}
      </Link>
    </div>
  );
}
