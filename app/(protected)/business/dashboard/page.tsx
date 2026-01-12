"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BusinessDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const role = (session?.user as any)?.role;
  const name = (session?.user as any)?.name || "Business";

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && role !== "BUSINESS" && role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [status, role, router]);

  if (status === "loading") return <div className="text-white/80">Chargement...</div>;

  return (
    <div className="max-w-6xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-extrabold text-white">Business Dashboard</h1>
        <p className="text-white/60 mt-2">
          Bienvenue <span className="text-white font-semibold">{name}</span> — rôle{" "}
          <span className="font-semibold text-white">{role}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card
          title="Create Venue"
          desc="Add your restaurant, club, or event space."
          cta="Create New"
          onClick={() => router.push("/business/add-venue")}
        />
        <Card
          title="My Venues"
          desc="View and manage your listings."
          cta="View All"
          onClick={() => router.push("/business/my-venues")}
        />
        <Card
          title="Reservations"
          desc="Accept or decline customer bookings."
          cta="Manage"
          onClick={() => router.push("/business/reservations")}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
        <div className="font-semibold text-white mb-1">Next Steps</div>
        <div>
          - Add "Check-in QR" page to scan and validate.
          <br />- Enable email notifications for new reservations.
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  desc,
  cta,
  onClick,
}: {
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-xl font-bold text-white">{title}</div>
      <div className="text-white/60 mt-2">{desc}</div>
      <button
        onClick={onClick}
        className="mt-5 rounded-2xl bg-white text-black px-4 py-2 font-semibold hover:opacity-90"
      >
        {cta}
      </button>
    </div>
  );
}
