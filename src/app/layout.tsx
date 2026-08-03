import type { Metadata } from "next";
import "./globals.css";
// @ts-ignore
import "swiper/css/bundle";
import { Providers } from "@/components/Providers";
import Script from "next/script"; // Pastikan import ini hanya satu
import "next/link";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://anistreaming.com"),
  title: { default: "AniStreaming - Nonton Anime Sub Indo", template: "%s | AniStreaming" },
  description: "Nonton anime subtitle Indonesia terbaru dengan informasi episode, genre, jadwal tayang, dan sinopsis di AniStreaming.",
  applicationName: "AniStreaming",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "id_ID", url: "https://anistreaming.com",
    siteName: "AniStreaming", title: "AniStreaming - Nonton Anime Sub Indo",
    description: "Koleksi anime subtitle Indonesia terbaru dan populer.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="id">
        <body
          className="antialiased bg-gray-800 text-white font-sans"
        >
          {/* Google tag (gtag.js) */}
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-C4EQ753MZB"
            strategy="lazyOnload"
          />
          <Script
            id="gtag-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-C4EQ753MZB');
              `,
            }}
          />
          <Link
            href="https://alwaysmulticulturallanding.com/wwr6tt02n?key=2de7878c4f21466fe87ee61b98ea81f3"
            target="_blank"
            rel="nofollow" // Sangat disarankan agar tidak diikuti oleh bot Google
          >
            Klik di sini untuk Nonton (Sedekah)
          </Link>
  
          {/* Iklan 1: Social Bar */}
          <Script 
            src="https://alwaysmulticulturallanding.com/a2/e0/3c/a2e03cf1bed0e9d731c3812e05e4517c.js" 
            strategy="lazyOnload" 
          />

          {/* Iklan 2: Popunder */}
          <Script 
            src="https://alwaysmulticulturallanding.com/fe/8f/81/fe8f815f75fcefd6fa17243386912ae0.js" 
            strategy="lazyOnload" 
          />

          {/* Iklan 3: Native Banner */}
          <Script 
            src="https://alwaysmulticulturallanding.com/bcf5164b464a8e3c0b486cd50f77b999/invoke.js" 
            strategy="lazyOnload"
            async={true} // Perbaikan di sini
            data-cfasync="false"
          />
          <div id="container-bcf5164b464a8e3c0b486cd50f77b999"></div>

          <Providers>
            {children}
          </Providers>
          {/* Inline ad settings */}
          <Script
            id="atoptions"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `atOptions = {key: 'daefcd0da8999f398d62edb6161a6a14', format: 'iframe', height: 90, width: 728, params: {}};`,
            }}
          />

          <Script
            src="https://alwaysmulticulturallanding.com/daefcd0da8999f398d62edb6161a6a14/invoke.js"
            strategy="lazyOnload"
          />
        </body>
      </html>
  );
}
