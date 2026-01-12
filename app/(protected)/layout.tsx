import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#070A12] text-white">
      <aside className="w-64 bg-black p-6">
        <div className="text-2xl font-bold mb-6">AGORA</div>

        <nav className="flex flex-col gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/profile">Profil</Link>
          <LogoutButton />
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
