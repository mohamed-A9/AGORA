import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <main className="max-w-7xl mx-auto py-8">{children}</main>
    </div>
  );
}
