"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LayoutDashboard, Calendar, Store, LogOut, Settings } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    // Helper to close menu
    const close = () => setIsOpen(false);

    const role = (session?.user as any)?.role;

    return (
        <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-b from-black/90 to-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 md:h-20">
                    {/* Logo */}
                    <Link href="/">
                        <img src="/logo.png" alt="AGORA" className="h-8 md:h-10 w-auto object-contain hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {/* Common Links - Hidden for Business */}
                        <Link href="/explore" className="text-white/70 hover:text-white font-semibold transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] relative group">
                            <span>Explore</span>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        {/* Role Based Links */}
                        {session && (
                            <>
                                {role === 'USER' && (
                                    <>
                                        <Link href="/reservations" className="text-white/70 hover:text-white font-semibold transition-all duration-300 flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] relative group">
                                            <Calendar className="w-4 h-4" />
                                            <span>Reservations</span>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                        </Link>
                                        <Link href="/profile" className="text-white/70 hover:text-white font-semibold transition-all duration-300 flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] relative group">
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                        </Link>
                                    </>
                                )}
                                {role === 'ADMIN' && (
                                    <Link href="/admin" className="text-white/70 hover:text-white font-semibold transition-all duration-300 flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] relative group">
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>Admin</span>
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                )}
                                {role === 'BUSINESS' && (
                                    <>
                                        <Link href="/business/reservations" className="text-white/70 hover:text-white font-semibold transition-all duration-300 flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] relative group">
                                            <Calendar className="w-4 h-4" />
                                            <span>Reservations</span>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                        </Link>
                                        <Link href="/business/events" className="text-white/70 hover:text-white font-semibold transition-all duration-300 flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] relative group">
                                            <Store className="w-4 h-4" />
                                            <span>Events</span>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                        </Link>
                                        <Link href="/business/my-venues" className="text-white/70 hover:text-white font-semibold transition-all duration-300 flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] relative group">
                                            <Store className="w-4 h-4" />
                                            <span>My Venues</span>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                        </Link>
                                        <Link href="/profile" title="Account Settings" className="text-white/70 hover:text-white font-semibold transition-all duration-300 flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] relative group">
                                            <Settings className="w-4 h-4 text-white/40" />
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-zinc-500 group-hover:w-full transition-all duration-300"></span>
                                        </Link>
                                    </>
                                )}
                            </>
                        )}

                        {/* Auth Section */}
                        {status === "loading" ? (
                            <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
                        ) : session ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                                <Link
                                    href={role === 'BUSINESS' ? '/business/dashboard' : '/dashboard'}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 text-white font-semibold transition-all duration-300 border border-indigo-500/20 hover:border-indigo-500/40 hover:scale-105 shadow-lg shadow-indigo-500/10"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Link>

                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-500/20 text-white/70 hover:text-red-400 font-semibold transition-all duration-300 border border-white/10 hover:border-red-500/40 hover:scale-105 group"
                                    title="Sign out"
                                >
                                    <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                                <Link
                                    href="/login"
                                    className="text-white hover:text-white/80 font-medium transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg hover:scale-105 transform duration-200"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white/70 hover:text-white p-2"
                        >
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/5">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link
                            href="/explore"
                            className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                            onClick={close}
                        >
                            Explore
                        </Link>

                        {session ? (
                            <>
                                {role === 'USER' && (
                                    <>
                                        <Link
                                            href="/reservations"
                                            className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                                            onClick={close}
                                        >
                                            Mes Réservations
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                                            onClick={close}
                                        >
                                            Profil & Préférences
                                        </Link>
                                    </>
                                )}
                                {role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                                        onClick={close}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                {role === 'BUSINESS' && (
                                    <>
                                        <Link
                                            href="/business/reservations"
                                            className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                                            onClick={close}
                                        >
                                            Réservations
                                        </Link>
                                        <Link
                                            href="/business/events"
                                            className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                                            onClick={close}
                                        >
                                            Soirées Spéciales
                                        </Link>
                                        <Link
                                            href="/business/my-venues"
                                            className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                                            onClick={close}
                                        >
                                            Mes Lieux
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl font-medium flex items-center gap-2"
                                            onClick={close}
                                        >
                                            <Settings className="w-4 h-4" /> Account Settings
                                        </Link>
                                    </>
                                )}
                                <div className="h-px bg-white/10 my-2" />
                                <Link
                                    href={role === 'BUSINESS' ? '/business/dashboard' : '/dashboard'}
                                    className="block px-4 py-3 text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl font-bold"
                                    onClick={close}
                                >
                                    Go to Dashboard
                                </Link>
                                <button
                                    onClick={() => { signOut(); close(); }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-semibold border border-red-500/20 hover:border-red-500/40 transition-all duration-300"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Log out</span>
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mt-4 px-2">
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center px-4 py-3 border border-white/10 rounded-xl text-white font-medium"
                                    onClick={close}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="flex items-center justify-center px-4 py-3 bg-white text-black rounded-xl font-bold"
                                    onClick={close}
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
