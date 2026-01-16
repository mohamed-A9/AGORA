"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Cookies from "js-cookie";

type Role = "USER" | "BUSINESS";

type Particle = {
  id: number;
  x: number;
  y: number;
  s: number;
  d: number;
  delay: number;
  o: number;
};

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.round(Math.random() * 100),
    y: Math.round(Math.random() * 100),
    s: 80 + Math.round(Math.random() * 220),
    d: 6 + Math.round(Math.random() * 10),
    delay: Math.round(Math.random() * 10) / 10,
    o: 0.08 + Math.random() * 0.1,
  }));
}

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "business" ? "BUSINESS" : "USER";

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setParticles(makeParticles(12));
    setYear(new Date().getFullYear());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Date Validation
    const birthDate = new Date(birthday);
    const today = new Date();
    if (birthDate > today) {
      setError("La date de naissance ne peut pas être dans le futur.");
      setLoading(false);
      return;
    }

    // Basic age sanity check (optional but recommended)
    const minDate = new Date("1900-01-01");
    if (birthDate < minDate) {
      setError("Veuillez entrer une date de naissance valide.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, birthday, gender }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data?.error || "Erreur lors de l’inscription.");
      return;
    }

    router.push("/login?verified=0");
  }

  return (
    <div
      data-update="v11-global-scroll-fix"
      suppressHydrationWarning
      className="relative min-h-screen w-full bg-[#050B14]"
    >
      {/* Intense Aurora Background */}
      <div className="fixed inset-0 w-full h-full bg-[#050B14] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/40 blur-[100px] animate-pulse mix-blend-screen" />
        <div className="absolute top-[0%] right-[-10%] w-[40%] h-[50%] rounded-full bg-cyan-500/30 blur-[120px] animate-pulse delay-75" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-500/40 blur-[100px] animate-pulse delay-150" />
        <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] rounded-full bg-fuchsia-500/30 blur-[100px] animate-pulse delay-300" />
      </div>

      {/* Cyber Grid - Sharper */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Super Glowing Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: Math.max(3, p.s / 15),
              height: Math.max(3, p.s / 15),
              opacity: Math.min(1, p.o + 0.6),
              background: "#fff",
              boxShadow: "0 0 15px 3px rgba(255, 255, 255, 0.9), 0 0 30px 6px rgba(167, 139, 250, 0.5)", // Double glow
              animation: `floaty ${p.d}s ease-in-out ${p.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full min-h-screen flex-col items-center justify-center p-4 pt-20 pb-6 lg:p-0 lg:pt-24 lg:pb-6">
        <div className="w-full max-w-4xl flex flex-col gap-3 shrink-0">

          {/* Centered Pitch Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 mb-0 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-white/80 font-medium text-[10px] tracking-wide">PREMIUM VENUE ACCESS</span>
            </div>

            <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-indigo-300">Community</span>.
            </h1>

            <p className="text-white/60 text-xs lg:text-sm max-w-lg mx-auto leading-relaxed">
              Create an account to start exploring exclusive venues, or sign up as a business to manage your presence.
            </p>

            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Badge>🚀 Quick Setup</Badge>
              <Badge>🌍 Global Access</Badge>
              <Badge>💎 VIP Profile</Badge>
            </div>
          </div>

          {/* Wide Split Card */}
          <div className="w-full rounded-3xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-2xl overflow-hidden ring-1 ring-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* Left Side: Roles & Socials */}
              <div className="p-5 lg:p-6 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 bg-white/5">
                <div className="text-center lg:text-left mb-4">
                  <h2 className="text-xl font-bold tracking-tight text-white">Get Started</h2>
                  <p className="mt-0.5 text-white/50 text-xs">Select your account type to begin.</p>
                </div>

                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setRole("USER")}
                    className={`rounded-xl px-3 py-3 border text-left transition-all duration-200 group relative overflow-hidden ${role === "USER"
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] ring-1 ring-indigo-500/50"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    <div className="relative z-10">
                      <div className={`text-sm font-bold mb-0.5 transition-colors ${role === "USER" ? "text-indigo-300" : "text-white/90"}`}>Member</div>
                      <div className="text-[10px] opacity-70 font-medium">Explore & Reserve</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("BUSINESS")}
                    className={`rounded-xl px-3 py-3 border text-left transition-all duration-200 group relative overflow-hidden ${role === "BUSINESS"
                      ? "bg-fuchsia-600/20 border-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] ring-1 ring-fuchsia-500/50"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    <div className="relative z-10">
                      <div className={`text-sm font-bold mb-0.5 transition-colors ${role === "BUSINESS" ? "text-fuchsia-300" : "text-white/90"}`}>Business</div>
                      <div className="text-[10px] opacity-70 font-medium">Manage Venues</div>
                    </div>
                  </button>
                </div>

                {/* Social Buttons */}
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      Cookies.set("signup-role", role, { expires: 1 });
                      signIn("google", { callbackUrl: "/" });
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/10"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" style={{ fill: "#4285F4" }} />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" style={{ fill: "#34A853" }} />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" style={{ fill: "#FBBC05" }} />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" style={{ fill: "#EA4335" }} />
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    onClick={() => {
                      Cookies.set("signup-role", role, { expires: 1 });
                      signIn("facebook", { callbackUrl: "/" });
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#1877F2]/20 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#1877F2]/30"
                  >
                    <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.606-2.797 2.895v1.076h3.693l-.485 3.667h-3.208v7.98h-4.997z" />
                    </svg>
                    Continue with Facebook
                  </button>
                </div>

                <div className="relative mt-6 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10 lg:hidden">
                  <span className="relative z-10 bg-[#070A12] px-2 text-white/50">Or continue with email</span>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="p-5 lg:p-6 flex items-center bg-black/20">
                <form onSubmit={onSubmit} className="w-full space-y-3">
                  <div className="hidden lg:block relative mb-4 text-center text-[10px] after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
                    <span className="relative z-10 bg-transparent px-2 text-white/50">Or continue with email</span>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200 text-center">
                      {error}
                    </div>
                  )}

                  {/* Row 1: Birthday & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Birthday">
                      <div className="relative w-full overflow-hidden rounded-xl border border-white/15 bg-black/30 transition focus-within:border-white/30 focus-within:bg-black/35 input-wrapper">
                        <input
                          className="w-full h-10 bg-transparent px-3 text-sm text-white placeholder:text-white/30 outline-none appearance-none"
                          type="date"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                          required
                          max={new Date().toISOString().split("T")[0]}
                          style={{ minWidth: 0, width: '100%', WebkitAppearance: 'none' }}
                        />
                      </div>
                    </Field>

                    <Field label="Gender">
                      <select
                        className="mt-1 w-full h-10 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35 appearance-none"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                      >
                        <option value="" disabled className="text-black">Select</option>
                        <option value="male" className="text-black">Male</option>
                        <option value="female" className="text-black">Female</option>
                        <option value="other" className="text-black">Other</option>
                      </select>
                    </Field>
                  </div>

                  {/* Row 2: Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Full Name">
                      <input
                        className="mt-0.5 w-full h-10 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>

                    <Field label="Email Address">
                      <input
                        className="mt-0.5 w-full h-10 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
                        type="email"
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  {/* Row 3: Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Password">
                      <input
                        className="mt-0.5 w-full h-10 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </Field>

                    <Field label="Confirm Password">
                      <input
                        className="mt-0.5 w-full h-10 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  <button
                    disabled={loading}
                    className="group relative w-full h-12 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60 mt-2"
                    type="submit"
                  >
                    <span className="relative z-10 text-base">
                      {loading ? "Creating Account..." : "Sign Up"}
                    </span>
                    <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-white/10" />
                  </button>

                  <div className="text-center text-sm text-white/50 pt-2 lg:hidden">
                    Already have an account?{" "}
                    <Link className="text-white hover:underline" href="/login">
                      Sign in
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="text-center text-white/45 text-sm hidden lg:block">
            Already have an account?{" "}
            <Link className="text-white underline hover:text-white/90" href="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floaty {
          from {
            transform: translate(-50%, -50%) translateY(0px) scale(1);
          }
          to {
            transform: translate(-50%, -50%) translateY(-22px) scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}

// Reused components from Login Page style
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/70 ml-1">{label}</label>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
      {children}
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">Loading...</div>}>
      <SignUpPageContent />
    </Suspense>
  );
}
