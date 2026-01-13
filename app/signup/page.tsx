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

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data?.error || "Erreur lors de l’inscription.");
      return;
    }

    router.push("/login?verified=0"); // Redirect to login, maybe show a "check email" message if needed
  }

  return (
    <div className="relative h-[calc(100vh-5rem)] overflow-hidden bg-[#070A12]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(1000px_700px_at_20%_20%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(900px_600px_at_80%_30%,rgba(236,72,153,0.14),transparent_55%),radial-gradient(900px_700px_at_50%_90%,rgba(245,158,11,0.10),transparent_60%)]" />
      <div className="absolute inset-0 opacity-60 animate-[pulse_6s_ease-in-out_infinite]" />

      {/* Floating blobs */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full blur-3xl"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.s,
              height: p.s,
              opacity: p.o,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.60), rgba(99,102,241,0.32), rgba(236,72,153,0.20), rgba(0,0,0,0))",
              animation: `floaty ${p.d}s ease-in-out ${p.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:56px_56px]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Left pitch (Desktop) */}
            <div className="hidden lg:flex flex-col justify-center p-10">
              <div className="inline-flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
                <div className="text-white/90 font-semibold tracking-wide">AGORA</div>
              </div>

              <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-white">
                Join the <span className="text-fuchsia-300">Community</span>.
              </h1>

              <p className="mt-4 text-white/70 text-lg leading-relaxed">
                Create an account to start exploring exclusive venues, or sign up as a business to manage your presence.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Badge>🚀 Quick Setup</Badge>
                <Badge>🌍 Global Access</Badge>
                <Badge>💎 VIP Profile</Badge>
              </div>

              <div className="mt-10 text-white/45 text-sm">
                Already have an account?{" "}
                <Link className="text-white underline hover:text-white/90" href="/login">
                  Sign in
                </Link>
              </div>
            </div>

            {/* Right card (Form) */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Get Started</h2>
                  <p className="mt-2 text-white/60 text-sm">Create your free account.</p>
                </div>

                {/* Role Selection */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("USER")}
                    className={`rounded-2xl px-6 py-5 border text-left transition-all duration-200 group relative overflow-hidden ${role === "USER"
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] ring-1 ring-indigo-500/50"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    <div className="relative z-10">
                      <div className={`text-lg font-bold mb-1 transition-colors ${role === "USER" ? "text-indigo-300" : "text-white/90"}`}>Member</div>
                      <div className="text-xs opacity-70 font-medium">Explore & Reserve</div>
                    </div>
                    {role === "USER" && <div className="absolute inset-0 bg-indigo-500/10 blur-xl" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("BUSINESS")}
                    className={`rounded-2xl px-6 py-5 border text-left transition-all duration-200 group relative overflow-hidden ${role === "BUSINESS"
                      ? "bg-fuchsia-600/20 border-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] ring-1 ring-fuchsia-500/50"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    <div className="relative z-10">
                      <div className={`text-lg font-bold mb-1 transition-colors ${role === "BUSINESS" ? "text-fuchsia-300" : "text-white/90"}`}>Business</div>
                      <div className="text-xs opacity-70 font-medium">Manage Venues</div>
                    </div>
                    {role === "BUSINESS" && <div className="absolute inset-0 bg-fuchsia-500/10 blur-xl" />}
                  </button>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      Cookies.set("signup-role", role, { expires: 1 });
                      signIn("google", { callbackUrl: "/" });
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        style={{ fill: "#4285F4" }}
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        style={{ fill: "#34A853" }}
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        style={{ fill: "#FBBC05" }}
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        style={{ fill: "#EA4335" }}
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    onClick={() => {
                      Cookies.set("signup-role", role, { expires: 1 });
                      signIn("facebook", { callbackUrl: "/" });
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#1877F2]/20 px-4 py-3 font-medium text-white transition hover:bg-[#1877F2]/30"
                  >
                    <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.606-2.797 2.895v1.076h3.693l-.485 3.667h-3.208v7.98h-4.997z" />
                    </svg>
                    Continue with Facebook
                  </button>
                </div>

                <div className="relative my-8 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
                  <span className="relative z-10 bg-[#070A12] px-2 text-white/50">Or continue with email</span>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200 text-center">
                      {error}
                    </div>
                  )}

                  <Field label="Full Name">
                    <input
                      className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Email Address">
                    <input
                      className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Password">
                    <input
                      className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
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
                      className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Field>

                  <button
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 px-4 py-3 font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60 mt-2"
                    type="submit"
                  >
                    <span className="relative z-10">
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

          <p className="mt-6 text-center text-xs text-white/40">
            © {year} AGORA — Premium Experience
          </p>
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
