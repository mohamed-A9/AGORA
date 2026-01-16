"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LayoutDashboard, Calendar, Store, LogOut } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    // Helper to close menu
    const close = () => setIsOpen(false);

    const role = (session?.user as any)?.role;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/">
                        <img src="/logo.png" alt="AGORA" className="h-10 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {/* Common Links - Hidden for Business */}
                        {role !== 'BUSINESS' && (
                            <Link href="/explore" className="text-white/70 hover:text-white font-medium transition-colors">
                                Explore
                            </Link>
                        )}

                        {/* Role Based Links */}
                        {session && (
                            <>
                                {role === 'USER' && (
                                    <>
                                        <Link href="/reservations" className="text-white/70 hover:text-white font-medium transition-colors flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Reservations
                                        </Link>
                                        <Link href="/profile" className="text-white/70 hover:text-white font-medium transition-colors flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Profil & Préférences
                                        </Link>
                                    </>
                                )}
                                {role === 'BUSINESS' && (
                                    <>
                                        <Link href="/business/reservations" className="text-white/70 hover:text-white font-medium transition-colors flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Réservations
                                        </Link>
                                        <Link href="/business/events" className="text-white/70 hover:text-white font-medium transition-colors flex items-center gap-2">
                                            <Store className="w-4 h-4" />
                                            Soirées
                                        </Link>
                                        <Link href="/business/my-venues" className="text-white/70 hover:text-white font-medium transition-colors flex items-center gap-2">
                                            <Store className="w-4 h-4" />
                                            Mes Lieux
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
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Link>

                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="p-2 text-white/50 hover:text-red-400 transition-colors"
                                    title="Sign out"
                                >
                                    <LogOut className="w-5 h-5" />
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
                        {role !== 'BUSINESS' && (
                            <Link
                                href="/explore"
                                className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                                onClick={close}
                            >
                                Explore
                            </Link>
                        )}

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
                                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 rounded-xl font-medium"
                                >
                                    Sign out
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
