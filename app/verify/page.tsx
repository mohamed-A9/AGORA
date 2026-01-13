"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

function VerifyPageContent() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const token = sp.get("token");

    if (!token) {
      router.push("/signin?error=invalid-link");
      return;
    }

    fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) router.push("/signin?verified=1");
        else router.push("/signin?error=expired-link");
      })
      .catch(() => router.push("/signin?error=server"));
  }, [sp, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Vérification en cours…</h1>
        <p className="opacity-70 mt-2">Veuillez patienter.</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}
