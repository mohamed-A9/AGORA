"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") {
    return <div className="text-white/80">Chargement...</div>;
  }

  const user = session?.user as any;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold text-white">Profil</h1>
      <p className="text-white/60 mt-2">Vos informations de compte.</p>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Nom" value={user?.name || "—"} />
          <Info label="Email" value={user?.email || "—"} />
          <Info label="Rôle" value={user?.role || "—"} />
          <Info label="ID" value={user?.id || "—"} mono />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl border border-white/10 bg-white text-black px-4 py-2 font-semibold hover:opacity-90"
          >
            Retour Dashboard
          </button>

          {user?.role === "BUSINESS" && (
            <button
              onClick={() => router.push("/business/dashboard")}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white hover:bg-white/15"
            >
              Business Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
      <div className={`mt-1 text-white ${mono ? "font-mono text-sm" : "text-base"}`}>{value}</div>
    </div>
  );
}
