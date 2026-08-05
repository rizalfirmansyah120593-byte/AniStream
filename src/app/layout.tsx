import type { Metadata } from "next";
import "./globals.css";
// @ts-ignore
import "swiper/css/bundle";
import { Providers } from "@/components/Providers";
import { AdsterraSiteScripts } from "@/components/Ads/AdsterraAd";

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
          <Providers>
            {children}
          </Providers>
          <AdsterraSiteScripts />
        </body>
      </html>
  );
}
