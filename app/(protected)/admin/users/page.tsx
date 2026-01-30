"use client";

import { useEffect, useState } from "react";
import { Users, Search, Shield, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

type User = {
    id: string;
    name: string;
    email: string;
    role: "USER" | "BUSINESS" | "ADMIN";
    createdAt: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [busyId, setBusyId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        // We'll need an API route for this: /api/admin/users
        const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&role=${roleFilter}`);
        const data = await res.json().catch(() => ({}));
        setUsers(Array.isArray(data?.users) ? data.users : []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, [roleFilter]);

    async function setRole(id: string, role: string) {
        if (!confirm(`Change role to ${role}?`)) return;
        setBusyId(id);
        const res = await fetch(`/api/admin/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
        });
        setBusyId(null);
        if (res.ok) {
            load();
        } else {
            alert("Failed to update role");
        }
    }

    return (
        <div className="max-w-6xl space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Admin — Users</h1>
                    <p className="text-white/60 mt-1">
                        {loading ? "Loading..." : `${users.length} users found`}
                    </p>
                </div>
                <button onClick={load} className="bg-white text-black px-4 py-2 rounded-2xl font-bold hover:scale-105 transition-transform">
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="grid gap-3 md:grid-cols-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search name or email..."
                        className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                >
                    <option value="ALL">All Roles</option>
                    <option value="USER">User</option>
                    <option value="BUSINESS">Business</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <button onClick={load} className="bg-white/10 text-white font-bold rounded-2xl px-4 py-3 hover:bg-white/20 transition-colors">
                    Search
                </button>
            </div>

            <div className="grid gap-4">
                {!loading && users.map(user => (
                    <div key={user.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                        ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' :
                                    user.role === 'BUSINESS' ? 'bg-indigo-500/20 text-indigo-500' :
                                        'bg-white/10 text-white/50'}`}>
                                {user.name?.[0]?.toUpperCase() || <Users size={20} />}
                            </div>
                            <div>
                                <div className="font-bold text-white text-lg flex items-center gap-2">
                                    {user.name || "Anonymous"}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black tracking-widest uppercase
                                ${user.role === 'ADMIN' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                            user.role === 'BUSINESS' ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' :
                                                'border-white/10 text-zinc-400 bg-white/5'}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="text-white/40 text-sm">{user.email}</div>
                                <div className="text-white/20 text-xs mt-1 font-mono">ID: {user.id}</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {user.role !== 'BUSINESS' && (
                                <button
                                    disabled={busyId === user.id}
                                    onClick={() => setRole(user.id, "BUSINESS")}
                                    className="px-4 py-2 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                    Make Business
                                </button>
                            )}
                            {user.role !== 'ADMIN' && (
                                <button
                                    disabled={busyId === user.id}
                                    onClick={() => setRole(user.id, "ADMIN")}
                                    className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                    Make Admin
                                </button>
                            )}
                            {user.role !== 'USER' && (
                                <button
                                    disabled={busyId === user.id}
                                    onClick={() => setRole(user.id, "USER")}
                                    className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                    Demote to User
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {!loading && users.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                        <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40">No users found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
