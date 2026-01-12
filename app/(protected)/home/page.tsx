"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const role = (session?.user as any)?.role;

    if (role === "ADMIN") router.replace("/admin");
    else if (role === "BUSINESS") router.replace("/business/dashboard");
    else router.replace("/dashboard");
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070A12] text-white">
      Redirection…
    </div>
  );
}
