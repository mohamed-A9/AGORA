import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Building2, AlertCircle, CheckCircle, BarChart3, Settings } from "lucide-react";

async function getStats() {
  const totalUsers = await prisma.user.count();
  const totalVenues = await prisma.venue.count();
  const pendingVenues = await prisma.venue.count({ where: { status: "PENDING" } });
  const approvedVenues = await prisma.venue.count({ where: { status: "APPROVED" } });

  return { totalUsers, totalVenues, pendingVenues, approvedVenues };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;

  if (role !== "ADMIN") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-8 shadow-2xl text-center">
        <h1 className="text-3xl font-black text-red-500">Access Denied</h1>
        <p className="mt-2 text-white/50">You do not have permission to view this area.</p>
      </div>
    );
  }

  const stats = await getStats();

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-zinc-900 to-black border border-white/10 p-10">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Settings className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest border border-indigo-500/30">Super Admin</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Command Center
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Overview of platform performance, user verification, and venue moderation.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
        <StatCard icon={Building2} label="Total Venues" value={stats.totalVenues} color="text-fuchsia-400" bg="bg-fuchsia-500/10" border="border-fuchsia-500/20" />
        <StatCard icon={AlertCircle} label="Pending Reviews" value={stats.pendingVenues} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard icon={CheckCircle} label="Active Venues" value={stats.approvedVenues} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Venue Management */}
        <Link href="/admin/venues" className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400">
              <Building2 className="w-8 h-8" />
            </div>
            {stats.pendingVenues > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold shadow-lg animate-pulse">
                {stats.pendingVenues} Pending
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-fuchsia-400 transition-colors">Manage Venues</h3>
          <p className="text-white/50 mb-6">Review new submissions, edit details, suspend listings, or boost visibility.</p>
          <div className="flex items-center gap-2 text-sm font-bold text-fuchsia-400 uppercase tracking-wider">
            Access Portal <span className="text-lg">→</span>
          </div>
        </Link>

        {/* User Management */}
        {/* Note: Create /admin/users page if it doesnt exist next */}
        <Link href="/admin/users" className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400">
              <Users className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Manage Users</h3>
          <p className="text-white/50 mb-6">View user list, manage roles (give ADMIN/BUSINESS status), and banning.</p>
          <div className="flex items-center gap-2 text-sm font-bold text-blue-400 uppercase tracking-wider">
            Access Portal <span className="text-lg">→</span>
          </div>
        </Link>
      </div>

    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, border }: any) {
  return (
    <div className={`p-6 rounded-3xl border ${border} ${bg} flex flex-col items-center justify-center text-center`}>
      <Icon className={`w-6 h-6 ${color} mb-3`} />
      <div className="text-3xl font-black text-white">{value}</div>
      <div className={`text-[10px] uppercase font-bold tracking-widest ${color} opacity-80`}>{label}</div>
    </div>
  );
}
