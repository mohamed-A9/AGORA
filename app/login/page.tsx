"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

type Status = "idle" | "loading";

function LoginPageContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { status: sessionStatus } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [year, setYear] = useState<number>(2026);

  const verified = sp.get("verified");
  const loggedout = sp.get("loggedout");
  const callbackUrl = sp.get("callbackUrl");
  const blockAutoRedirect = useMemo(() => loggedout === "1", [loggedout]);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // ✅ Auto redirect si déjà connecté
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (blockAutoRedirect) return;
    if (sessionStatus === "authenticated") {
      // If there's a callbackUrl, redirect there
      if (callbackUrl) {
        router.replace(callbackUrl);
      } else if (role === "BUSINESS") {
        router.replace("/business/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [sessionStatus, router, blockAutoRedirect, role, callbackUrl]);

  useEffect(() => {
    if (error) setError(null);
  }, [email, password]);

  const intendedRole = useMemo(() => {
    return sp.get("role") === "business" ? "BUSINESS" : "USER";
  }, [sp]);

  useEffect(() => {
    const errorType = sp.get("error");
    if (errorType === "WRONG_ROLE") {
      // We can try to guess the conflicting role from the URL or current state
      // If I am trying to log in as Business (intendedRole=BUSINESS) and failed, it means I have a User account.
      setError(`This email is already registered as a ${intendedRole === "BUSINESS" ? "Member" : "Business"} account.`);
    } else if (errorType === "AccessDenied") {
      setError("Access denied. Please try again.");
    } else if (errorType) {
      // generic
      setError("An error occurred during login.");
    }
  }, [sp, intendedRole]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    const res = await signIn("credentials", {
      email,
      password,
      role: intendedRole,
      redirect: false,
      callbackUrl: "/home",
    });

    setStatus("idle");

    if (res?.error) {
      if (res.error === "EMAIL_NOT_VERIFIED") {
        setError("Veuillez vérifier votre email avant de vous connecter.");
        return;
      }
      if (res.error === "WRONG_ROLE") {
        setError(`This email is already associated with a ${intendedRole === "USER" ? "Business" : "User"} account.`);
        return;
      }
      setError("Email ou mot de passe incorrect.");
      return;
    }

    // Elaboration of the redirect logic after login
    // The session might not be updated immediately here, but res.url is available
    // However, since we have redirect: false, we can use our router. push
    if (callbackUrl) {
      router.push(callbackUrl);
    } else {
      router.push(intendedRole === "BUSINESS" ? "/business/dashboard" : "/dashboard");
    }
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
    <div className="w-full flex flex-col items-center justify-center mt-0">
      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 pt-0 pb-0 lg:px-12 lg:pt-0 -mb-8 md:-mb-12">
        <div className="w-full max-w-5xl flex flex-col gap-4 shrink-0 pt-0">

          {/* Centered Pitch Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
              Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-amber-200">AGORA</span>
            </h1>

            <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Sign in to manage your venues, reservations, and community — with a premium, secure experience.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Badge>🔒 Secure</Badge>
              <Badge>⚡ Fast</Badge>
              <Badge>✨ Premium UI</Badge>
            </div>
          </div>

          {/* Wide Split Card */}
          <div className="w-full rounded-[40px] border border-white/10 bg-black/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] backdrop-blur-3xl overflow-hidden ring-1 ring-white/5">
            <div className={`grid grid-cols-1 transition-all duration-500 ease-in-out ${showEmailForm ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-2xl mx-auto'}`}>

              {/* Left Side: Pitch & Socials */}
              <div className="p-8 md:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 bg-white/5">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black tracking-tight text-white mb-2">Get Started</h2>
                  <p className="text-white/40 text-sm font-medium">Choose your login method to proceed.</p>
                </div>

                {/* Social Buttons */}
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      Cookies.remove("signup-role", { path: '/' }); // Clear any old signup-role
                      Cookies.set("login-role", intendedRole, { expires: 1, path: '/' });
                      signIn("google", { callbackUrl: "/home" });
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
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
                      Cookies.remove("signup-role", { path: '/' }); // Clear any old signup-role
                      Cookies.set("login-role", intendedRole, { expires: 1, path: '/' });
                      signIn("facebook", { callbackUrl: "/home" });
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#1877F2]/20 px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1877F2]/30"
                  >
                    <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.606-2.797 2.895v1.076h3.693l-.485 3.667h-3.208v7.98h-4.997z" />
                    </svg>
                    Continue with Facebook
                  </button>

                  <button
                    onClick={() => setShowEmailForm(true)}
                    className={`flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 mt-2 ${showEmailForm ? 'hidden' : 'flex'}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Sign in with email
                  </button>
                </div>

                {showEmailForm && (
                  <div className="flex items-center gap-4 mt-8 lg:hidden">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Or continue with email</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>
                )}
              </div>

              {/* Right Side: Form */}
              <div className={`p-8 lg:p-10 flex items-center ${showEmailForm ? 'flex' : 'hidden'}`}>
                <form onSubmit={onSubmit} className="w-full space-y-4">
                  <div className="hidden lg:flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Or continue with email</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>

                  {verified === "1" && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200 text-center">
                      ✅ Email verified. You can now sign in.
                    </div>
                  )}

                  {loggedout === "1" && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60 text-center">
                      You have been logged out.
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 text-center">
                      {error}
                    </div>
                  )}

                  <Field label="Email Address">
                    <input
                      className="mt-1 w-full h-14 rounded-xl border border-white/15 bg-black/30 px-4 text-base text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:bg-black/35"
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Password">
                    <input
                      className="mt-1 w-full h-14 rounded-xl border border-white/15 bg-black/30 px-4 text-base text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:bg-black/35"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <div className="flex justify-end mt-1">
                      <Link
                        href="/forgot-password"
                        className="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>
                  </Field>

                  <button
                    disabled={status === "loading" || sessionStatus === "loading"}
                    className="group relative w-full h-14 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-indigo-500/25 disabled:opacity-60 mt-4 active:scale-[0.98]"
                    type="submit"
                  >
                    <span className="relative z-10 text-xl uppercase tracking-[0.2em]">
                      {status === "loading" ? "Signing in..." : "Sign in"}
                    </span>
                    <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-white/10" />
                  </button>

                  <div className="text-center text-sm text-white/50 pt-2 lg:hidden">
                    No account?{" "}
                    <Link className="text-white hover:underline" href="/signup">
                      Create one
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="text-center text-white/45 text-sm hidden lg:block">
            No account yet?{" "}
            <Link className="text-white underline hover:text-white/90" href="/signup">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reused components from Signup Page style
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-white/80 ml-1 uppercase tracking-wider">{label}</label>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
