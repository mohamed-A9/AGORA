"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "idle" | "loading";

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

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { status: sessionStatus } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [year, setYear] = useState<number>(2026);

  const verified = sp.get("verified");
  const loggedout = sp.get("loggedout");

  // ✅ évite recalculs inutiles
  const blockAutoRedirect = useMemo(() => loggedout === "1", [loggedout]);

  // ✅ generate visuals ONLY on client after mount
  useEffect(() => {
    setParticles(makeParticles(12));
    setYear(new Date().getFullYear());
  }, []);

  // ✅ Auto redirect si déjà connecté
  // IMPORTANT: si on vient de logout (?loggedout=1), on n'auto-redirige pas.
  useEffect(() => {
    if (blockAutoRedirect) return;

    if (sessionStatus === "authenticated") {
      router.replace("/home");
    }
  }, [sessionStatus, router, blockAutoRedirect]);

  useEffect(() => {
    if (error) setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/home",
    });

    setStatus("idle");

    if (res?.error) {
      if (res.error === "EMAIL_NOT_VERIFIED") {
        setError("Veuillez vérifier votre email avant de vous connecter.");
        return;
      }
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push(res?.url || "/dashboard");
  }

  // ✅ On affiche l'écran "Redirection..." uniquement si on n'a PAS loggedout=1
  if (sessionStatus === "authenticated" && !blockAutoRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A12] text-white">
        Redirection vers votre dashboard…
      </div>
    );
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
            {/* Left pitch */}
            <div className="hidden lg:flex flex-col justify-center p-10">
              <div className="inline-flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
                <div className="text-white/90 font-semibold tracking-wide">AGORA</div>
              </div>

              <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-white">
                Welcome back to <span className="text-indigo-300">AGORA</span>.
              </h1>

              <p className="mt-4 text-white/70 text-lg leading-relaxed">
                Sign in to manage your venues, reservations, and community — with a
                premium, secure experience.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Badge>🔒 Secure</Badge>
                <Badge>⚡ Fast</Badge>
                <Badge>✨ Premium UI</Badge>
              </div>

              <div className="mt-10 text-white/45 text-sm">
                No account yet?{" "}
                <a className="text-white underline hover:text-white/90" href="/signup">
                  Create one
                </a>
              </div>
            </div>

            {/* Right card */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center">
                    <div className="relative">
                      <div className="text-5xl font-extrabold tracking-tight text-white">
                        AGORA
                      </div>
                      <div className="mt-2 h-1 w-full rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300 opacity-90" />
                    </div>
                  </div>
                  <p className="mt-3 text-white/70">Sign in</p>
                </div>

                {verified === "1" && (
                  <div className="mt-6 rounded-2xl border border-emerald-200/20 bg-emerald-500/10 p-3 text-sm text-emerald-50">
                    ✅ Email vérifié. Vous pouvez maintenant vous connecter.
                  </div>
                )}

                {/* ✅ optionnel: message "déconnecté" */}
                {loggedout === "1" && (
                  <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-3 text-sm text-white/80">
                    Vous êtes déconnecté.
                  </div>
                )}

                {error && (
                  <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
                    ❌ {error}
                  </div>
                )}

                <form onSubmit={onSubmit} className="mt-7 space-y-4">
                  <Field label="Email">
                    <input
                      className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      required
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="Password">
                    <input
                      className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/35"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Your password"
                    />
                  </Field>

                  <button
                    disabled={status === "loading" || sessionStatus === "loading"}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 px-4 py-3 font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
                    type="submit"
                  >
                    <span className="relative z-10">
                      {status === "loading" ? "Signing in..." : "Sign in"}
                    </span>
                    <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-white/10" />
                  </button>

                  <div className="text-center text-sm text-white/70">
                    No account?{" "}
                    <a className="underline hover:text-white" href="/signup">
                      Create one
                    </a>
                  </div>

                  <div className="text-center text-xs text-white/45">
                    You’ll be redirected to your dashboard after sign-in.
                  </div>
                </form>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/40">
            © {year} AGORA — Dark Premium Experience
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-white/80">{label}</label>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white/80">
      {children}
    </div>
  );
}
