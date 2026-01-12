"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        // On coupe la session côté NextAuth
        await signOut({ redirect: false });

        // On force un rechargement complet (supprime l’état/cache)
        window.location.replace("/login?loggedout=1");
      }}
      className="px-3 py-2 rounded-xl bg-white text-black font-semibold"
    >
      Déconnexion
    </button>
  );
}
