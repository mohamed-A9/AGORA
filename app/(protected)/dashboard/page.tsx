"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const role = (session?.user as any)?.role as string | undefined;
  const name = (session?.user as any)?.name as string | undefined;

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white/70">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Dashboard</h1>
        <p className="mt-2 text-white/60">
          Bienvenue <span className="font-semibold text-white">{name || "Utilisateur"}</span> — rôle{" "}
          <span className="font-semibold text-white">{role || "USER"}</span>
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card
          title="Explorer"
          desc="Trouve des lieux et réserve en 1 minute."
          ctaLabel="Explorer"
          href="/explore"
        />
        <Card
          title="Mes réservations"
          desc="Historique, statut, annulation (à faire ensuite)."
          ctaLabel="Voir mes réservations"
          href="/reservations"
        />
        <Card
          title="Mon profil"
          desc="Voir vos informations de compte."
          ctaLabel="Ouvrir profil"
          href="/profile"
        />
      </div>

      {/* ADMIN block */}
      {role === "ADMIN" && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Administration</h2>
              <p className="mt-1 text-white/60">
                Valider les venues (paiement / qualité), gérer la plateforme.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/venues"
                className="rounded-2xl bg-white px-4 py-2 font-semibold text-black hover:opacity-90"
              >
                Venues en attente
              </Link>

              <Link
                href="/admin"
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15"
              >
                Dashboard admin
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MiniInfo title="Contrôle" value="Approve / Reject" />
            <MiniInfo title="Sécurité" value="Admin only" />
            <MiniInfo title="Business model" value="Pay → Approve" />
          </div>
        </div>
      )}

      {/* BUSINESS block (optionnel mais utile) */}
      {(role === "BUSINESS" || role === "ADMIN") && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Business</h2>
              <p className="mt-1 text-white/60">
                Créer des venues, gérer les réservations, faire le check-in.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/business/venues"
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15"
              >
                Mes venues
              </Link>

              <Link
                href="/business/reservations"
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15"
              >
                Réservations reçues
              </Link>

              <Link
                href="/business/checkin"
                className="rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 px-4 py-2 font-semibold text-white hover:opacity-95"
              >
                Scanner QR
              </Link>
            </div>
          </div>

          <div className="mt-6 text-sm text-white/50">
            ⚠️ Les venues créés par Business sont <b>PENDING</b> tant que l’admin n’a pas approuvé.
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h3 className="text-xl font-bold text-white">Prochaine étape</h3>
        <ul className="mt-3 list-disc pl-5 text-white/60 space-y-2">
          <li>Créer la page /explore (liste des venues approuvés)</li>
          <li>Créer /reservations (mes réservations utilisateur)</li>
          <li>Ajouter paiement business → approve admin</li>
        </ul>
      </div>
    </div>
  );
}

function Card({
  title,
  desc,
  href,
  ctaLabel,
}: {
  title: string;
  desc: string;
  href: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-xl font-bold text-white">{title}</div>
      <div className="mt-2 text-sm text-white/60">{desc}</div>

      <div className="mt-5">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 font-semibold text-black hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

function MiniInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-wide text-white/50">{title}</div>
      <div className="mt-1 text-white font-semibold">{value}</div>
    </div>
  );
}
