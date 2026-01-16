"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Plus, Calendar, Settings, TrendingUp, Users, MapPin, ChevronRight, Bell } from "lucide-react";

export default function BusinessDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const role = (session?.user as any)?.role;
  const name = (session?.user as any)?.name || "Partner";

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && role !== "BUSINESS" && role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [status, role, router]);

  if (status === "loading") return (
    <div className="flex h-[50vh] items-center justify-center text-white/50 animate-pulse">
      Loading Dashboard...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 p-4 opacity-50">
          <LayoutDashboard className="w-32 h-32 text-indigo-500/10" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              {role} Portal
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">{name}</span>
          </h1>
          <p className="text-white/60 mt-2 max-w-xl text-lg">
            Manage your venues, track performance, and engage with your audience from your command center.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={MapPin} label="Active Venues" value="3" color="indigo" />
        <StatCard icon={Users} label="Total Views" value="1.2k" color="fuchsia" />
        <StatCard icon={Calendar} label="Reservations" value="12" color="emerald" />
        <StatCard icon={TrendingUp} label="Engagement" value="+24%" color="amber" />
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Primary Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" /> Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard
              title="Add New Venue"
              desc="Create a listing for your restaurant, club, or event space."
              icon={Plus}
              onClick={() => router.push("/business/add-venue")}
              primary
            />
            <ActionCard
              title="My Venues"
              desc="Edit details, manage events, and update photos."
              icon={LayoutDashboard}
              onClick={() => router.push("/business/my-venues")}
            />
            <ActionCard
              title="Reservations"
              desc="Track bookings and manage guest lists."
              icon={Calendar}
              onClick={() => router.push("/business/reservations")}
            />
            <ActionCard
              title="Analytics"
              desc="Deep dive into your venue's performance."
              icon={TrendingUp}
              onClick={() => alert("Coming soon!")}
              disabled
            />
          </div>
        </div>

        {/* Right Col: Notifications / Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" /> Alerts
          </h2>

          <div className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-md p-6 h-full min-h-[300px]">
            <div className="space-y-4">
              <NotificationItem
                type="info"
                title="Profile Complete"
                time="Just now"
                desc="Your business profile is 100% complete. Great job!"
              />
              <NotificationItem
                type="action"
                title="New Feature"
                time="2 days ago"
                desc="You can now add 'Special Nights' to your venue page."
              />
              <div className="pt-4 border-t border-white/5">
                <button className="w-full py-2 text-sm text-white/40 hover:text-white transition-colors text-center">
                  View All Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  // @ts-ignore
  const theme = colors[color] || colors.indigo;

  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-sm ${theme} flex flex-col items-center justify-center text-center gap-2 transition hover:scale-105`}>
      <Icon className="w-6 h-6 opacity-80" />
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon: Icon, onClick, primary, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden text-left p-6 rounded-3xl border transition-all duration-300 w-full h-full flex flex-col justify-between
        ${disabled ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/5' :
          primary
            ? 'bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30 hover:border-indigo-400/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }
      `}
    >
      <div className="mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${primary ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/10 text-white'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
      </div>

      {!disabled && (
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${primary ? 'text-indigo-300' : 'text-white/40 group-hover:text-white'}`}>
          <span>Access</span> <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </button>
  );
}

function NotificationItem({ type, title, time, desc }: any) {
  return (
    <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${type === 'action' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-indigo-400'}`} />
      <div>
        <div className="flex justify-between items-center w-full min-w-[200px]">
          <span className="text-sm font-bold text-white">{title}</span>
          <span className="text-[10px] text-white/30">{time}</span>
        </div>
        <p className="text-xs text-white/50 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
