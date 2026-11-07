import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
// @ts-ignore
import "swiper/css/bundle";
import { Providers } from "@/components/Providers";
import { AdsterraSiteScripts } from "@/components/Ads/AdsterraAd";
import { SITE_URL } from "@/utils/config";
import { JsonLd } from "@/components/Seo/JsonLd";
import { WebMcpTools } from "@/components/WebMcpTools";

const siteTitle = "Nonton Anime Sub Indo & English Sub - AniStream";
const siteDescription = "Nonton anime subtitle Indonesia dan English subtitle terbaru dengan sinopsis, jadwal tayang, dan episode lengkap di AniStream.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: siteTitle, template: "%s | Nonton Anime Sub Indo & English Sub - AniStream" },
  description: siteDescription,
  applicationName: "AniStream",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "id_ID", alternateLocale: ["en_US"], url: SITE_URL,
    siteName: "AniStream", title: siteTitle, description: siteDescription,
    images: [{ url: "/banner.png", width: 1200, height: 630, alt: "AniStream" }],
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: ["/banner.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="id">
        <head>
          <link rel="preconnect" href="https://api.animekudesu.web.id" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://api.animekudesu.web.id" />
        </head>
        <body className="antialiased bg-gray-800 text-white font-sans overflow-x-hidden">
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-C4EQ753MZB"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-C4EQ753MZB');
            `}
          </Script>
          <Script src="/Script.js" strategy="afterInteractive" />
          <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "AniStream", url: SITE_URL, inLanguage: ["id-ID", "en-US"], potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } }} />
          <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "AniStream", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/banner.png` }, contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "contact@anistreaming.com", availableLanguage: ["Indonesian", "English"] } }} />
          <WebMcpTools />
          <Providers>
            {children}
          </Providers>
          <AdsterraSiteScripts />
        </body>
      </html>
  );
}
