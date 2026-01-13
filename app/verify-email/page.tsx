"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

function VerifyEmailPageContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";

  const [msg, setMsg] = useState("Vérification en cours...");

  useEffect(() => {
    async function run() {
      if (!token) {
        setMsg("Token manquant.");
        return;
      }

      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(`Erreur: ${data?.error || "Impossible de vérifier l'email"}`);
        return;
      }

      setMsg("✅ Email vérifié. Redirection vers login...");
      setTimeout(() => router.replace("/login?verified=1"), 900);
    }
    run();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-2xl font-extrabold">AGORA</div>
        <div className="mt-4 text-white/80">{msg}</div>
        <div className="mt-4 text-white/60 text-sm">
          <a className="underline" href="/login">
            Retour Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
