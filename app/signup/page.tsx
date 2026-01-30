"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession, signOut } from "next-auth/react";
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
  const { status: sessionStatus, data: session } = useSession();

  const initialRole = searchParams.get("role") === "business" ? "BUSINESS" : "USER";

  // Check if there's an error in URL - if so, don't auto-redirect
  const hasError = searchParams.get("error");

  // Redirect if already logged in (but NOT if there's an error to show)
  useEffect(() => {
    if (sessionStatus === "authenticated" && !hasError) {
      const userRole = (session?.user as any)?.role;
      if (userRole === "BUSINESS") {
        router.replace("/business/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [sessionStatus, router, session, hasError]);

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [loading, setLoading] = useState(false);

  // Initialize error from URL immediately
  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    urlError ? `⚠️ Authentication Error: ${urlError}` : null
  );

  const [particles, setParticles] = useState<Particle[]>([]);
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Check for authentication errors in URL
  useEffect(() => {
    const error = searchParams.get("error");
    console.log('🔍 Signup page - checking for error:', error);

    if (error) {
      // Check if it's a role mismatch error from our custom error
      if (error.includes("ROLE_MISMATCH")) {
        console.log('✅ Role mismatch error detected, parsing roles');

        // Parse the error message to extract existing role and intended role
        // Error format: "ROLE_MISMATCH: Email ... is already registered as USER, cannot sign in as BUSINESS"
        const existingRoleMatch = error.match(/registered as (\w+)/);
        const intendedRoleMatch = error.match(/sign in as (\w+)/);

        const existingRole = existingRoleMatch ? existingRoleMatch[1] : null;
        const intendedRole = intendedRoleMatch ? intendedRoleMatch[1] : null;

        console.log('Parsed roles:', { existingRole, intendedRole });

        // Sign out the user since the authentication failed
        signOut({ redirect: false });

        // Convert role codes to user-friendly names
        const existingAccountType = existingRole === "USER" ? "Member" : "Business";
        const intendedAccountType = intendedRole === "BUSINESS" ? "Business" : "Member";

        setError(
          `⚠️ This email is already registered as a ${existingAccountType} account.\n\n` +
          `To create a ${intendedAccountType} account, please:\n` +
          `• Use a different email address, OR\n` +
          `• Go to the Login page and sign in with your existing ${existingAccountType} account`
        );
      } else if (error === "Configuration") {
        console.log('✅ Configuration error detected');
        signOut({ redirect: false });
        setError(
          `⚠️ Authentication Error\n\n` +
          `There was a configuration issue. Please try again or contact support.`
        );
      } else if (error === "AccountNotLinked" || error === "OAuthAccountNotLinked") {
        console.log('✅ AccountNotLinked error detected');
        setError(
          "⚠️ This email is already registered with a different sign-in method.\n\n" +
          "Please use the original sign-in method you used to create this account."
        );
      } else if (error === "AccessDenied") {
        console.log('✅ AccessDenied error detected');
        setError(
          `⚠️ Access Denied\n\n` +
          `Authentication failed. Please try again or contact support.`
        );
      } else if (error === "OAuthCallback") {
        console.log('✅ OAuthCallback error detected');
        setError(
          "⚠️ Authentication Failed\n\n" +
          "The selected email may already be in use with a different account type.\n" +
          "Please try a different email or contact support."
        );
      } else {
        console.log('⚠️ Generic error detected:', error);
        setError(`⚠️ Authentication Error\n\nPlease try again or contact support.`);
      }
    } else {
      console.log('ℹ️ No error in URL');
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const birthDate = new Date(birthday);
    const today = new Date();
    if (birthDate > today) {
      setError("Birthday cannot be in the future.");
      setLoading(false);
      return;
    }

    // Basic age sanity check (optional but recommended)
    const minDate = new Date("1900-01-01");
    if (birthDate < minDate) {
      setError("Please enter a valid birthday.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
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
      if (data?.error === "EMAIL_ALREADY_USED") {
        setError(`This email is already associated with an account.`);
      } else {
        setError(data?.error || "Error during sign up.");
      }
      return;
    }

    router.push("/login?verified=0");
  }

  return (
    <div
      data-update="v18-zero-margins-polish"
      className="w-full flex flex-col items-center justify-center mt-0"
    >
      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 pt-0 pb-0 lg:px-12 lg:pt-0 -mb-8 md:-mb-12">
        <div className="w-full max-w-5xl flex flex-col gap-4 shrink-0 pt-0">

          {/* Centered Pitch Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-indigo-300 to-amber-200">Community</span>
            </h1>

            <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Create your account to discover and reserve the most exclusive venues in the city.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Badge>🚀 Quick Setup</Badge>
              <Badge>🌍 Global Access</Badge>
              <Badge>💎 VIP Profile</Badge>
            </div>
          </div>

          {/* Wide Split Card */}
          <div className="w-full rounded-[40px] border border-white/10 bg-black/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] backdrop-blur-3xl overflow-hidden ring-1 ring-white/5">
            <div className={`grid grid-cols-1 transition-all duration-500 ease-in-out ${showEmailForm ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-2xl mx-auto'}`}>

              {/* Left Side: Roles & Socials */}
              <div className="p-6 md:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 bg-white/5">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black tracking-tight text-white mb-2">Get Started</h2>
                  <p className="text-white/40 text-xs font-medium">Choose your account type to proceed.</p>
                </div>

                {/* ERROR MESSAGE - VISIBLE ALWAYS */}
                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 text-left whitespace-pre-line mb-6">
                    {error}
                  </div>
                )}

                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole("USER")}
                    className={`rounded-2xl px-4 py-5 border text-center transition-all duration-300 group relative overflow-hidden ${role === "USER"
                      ? "bg-indigo-600/30 border-indigo-500 text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] ring-2 ring-indigo-400/50"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    <div className="relative z-10">
                      <div className={`text-lg md:text-xl font-black tracking-tight transition-colors ${role === "USER" ? "text-indigo-300" : "text-white/90"}`}>Member</div>
                      <div className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-0.5">Join the party</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("BUSINESS")}
                    className={`rounded-2xl px-4 py-5 border text-center transition-all duration-300 group relative overflow-hidden ${role === "BUSINESS"
                      ? "bg-fuchsia-600/30 border-fuchsia-500 text-white shadow-[0_0_40px_rgba(217,70,239,0.5)] ring-2 ring-fuchsia-400/50"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    <div className="relative z-10">
                      <div className={`text-lg md:text-xl font-black tracking-tight transition-colors ${role === "BUSINESS" ? "text-fuchsia-300" : "text-white/90"}`}>Business</div>
                      <div className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-0.5">Manage venues</div>
                    </div>
                  </button>
                </div>

                {/* Social Buttons */}
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      Cookies.remove("login-role", { path: '/' }); // Clear any old login-role
                      Cookies.set("signup-role", role, { expires: 1, path: '/' });
                      signIn("google", { callbackUrl: "/" });
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
                      Cookies.remove("login-role", { path: '/' }); // Clear any old login-role
                      Cookies.set("signup-role", role, { expires: 1, path: '/' });
                      signIn("facebook", { callbackUrl: "/" });
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
                    Create with email
                  </button>
                </div>

                {showEmailForm && (
                  <div className="flex items-center gap-4 mt-6 lg:hidden">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Or continue with email</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>
                )}
              </div>

              {/* Right Side: Form */}
              <div className={`p-5 lg:p-6 flex items-center ${showEmailForm ? 'flex' : 'hidden'}`}>
                <form onSubmit={onSubmit} className="w-full space-y-3">
                  <div className="hidden lg:flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Or continue with email</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 text-left whitespace-pre-line">
                      {error}
                    </div>
                  )}

                  {/* Row 1: Email & Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                    <Field label="Full Name">
                      <input
                        className="mt-1 w-full h-14 rounded-xl border border-white/15 bg-black/30 px-4 text-base text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:bg-black/35"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  {/* Row 2: Birthday & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Birthday">
                      <div className="relative w-full overflow-hidden rounded-xl border border-white/15 bg-black/30 transition focus-within:border-white/30 focus-within:bg-black/35 input-wrapper">
                        <input
                          className="w-full h-14 bg-transparent px-4 text-base text-white placeholder:text-white/40 outline-none appearance-none"
                          type="date"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                          required
                          max={new Date().toISOString().split("T")[0]}
                          placeholder="jj/mm/aaaa"
                          style={{ minWidth: 0, width: '100%', WebkitAppearance: 'none' }}
                        />
                      </div>
                    </Field>

                    <Field label="Gender">
                      <select
                        className="mt-1 w-full h-14 rounded-xl border border-white/15 bg-black/30 px-4 text-base text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:bg-black/35 appearance-none"
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

                  {/* Row 3: Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Password">
                      <input
                        className="mt-1 w-full h-14 rounded-xl border border-white/15 bg-black/30 px-4 text-base text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:bg-black/35"
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
                        className="mt-1 w-full h-14 rounded-xl border border-white/15 bg-black/30 px-4 text-base text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:bg-black/35"
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
                    className="group relative w-full h-14 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-indigo-500/25 disabled:opacity-60 mt-4 active:scale-[0.98]"
                    type="submit"
                  >
                    <span className="relative z-10 text-xl uppercase tracking-[0.2em]">
                      {loading ? "Creating Account..." : "Sign up"}
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

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">Loading...</div>}>
      <SignUpPageContent />
    </Suspense>
  );
}
