import "./globals.css";
import Providers from "./providers";
import AuroraBackground from "@/components/AuroraBackground";
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
      <body>
        <Providers>
          <AuroraBackground>
            <Header />
            <div className="pt-24 px-4 pb-12 opacity-0 animate-slide-up" style={{ animationFillMode: "forwards" }}>
              {children}
            </div>
          </AuroraBackground>
        </Providers>
      </body>
    </html>
  );
}
