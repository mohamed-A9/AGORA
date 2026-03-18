import "./globals.css";
import Providers from "./providers";
import AuroraBackground from "@/components/AuroraBackground";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "AGORA — Découvrez les meilleurs lieux au Maroc",
  description: "Découvrez les meilleurs restaurants, bars, cafés et clubs du Maroc. Réservez votre table en ligne avec AGORA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined' && !window.ethereum) {
                   window.ethereum = { 
                     isMetaMask: false, 
                     request: function() { return new Promise(function(resolve) { resolve([]); }); },
                     on: function() {},
                     removeListener: function() {},
                     selectedAddress: null
                   };
                }
              } catch (e) { console.warn('Ethereum shim failed', e); }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <AuroraBackground>
            <Header />
            <div className="pt-0 px-4 pb-0">
              {children}
            </div>
            <Footer />
          </AuroraBackground>
        </Providers>
      </body>
    </html>
  );
}
