import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;

  if (role !== "ADMIN") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-7 shadow-2xl">
        <h1 className="text-2xl font-extrabold">Not authorized</h1>
        <p className="mt-2 text-white/70">Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-7 shadow-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin</h1>
        <p className="mt-2 text-white/70">
          Gestion des utilisateurs, rôles, venues, modération (à faire après).
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6">
        <div className="text-lg font-semibold">Prochaine étape</div>
        <ul className="mt-2 text-white/70 list-disc pl-5 space-y-1">
          <li>Liste utilisateurs</li>
          <li>Changer rôle USER ↔ BUSINESS</li>
          <li>Modération venues / reviews</li>
        </ul>
      </div>
    </div>
  );
}
