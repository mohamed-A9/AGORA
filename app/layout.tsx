import "./globals.css";
import Providers from "./providers";
import CoolBackground from "@/components/CoolBackground";
import Header from "@/components/Header";

export const metadata = {
  title: "AGORA",
  description: "AGORA app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <CoolBackground />
          <Header />
          <div className="relative min-h-screen pt-28">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
