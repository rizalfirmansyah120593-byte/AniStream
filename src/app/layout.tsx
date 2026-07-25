import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Providers } from "@/components/Providers";
import Script from 'next/script';
import Script from "next/script";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AniStream",
  description: "Nonton Anime Sub Indo terbaru dalam kualitas HD di AniStream. Stream pilihan anime favoritmu, temukan seri populer, dan nikmati pengalaman menonton terbaik secara online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body
          className={`${bebasNeue.variable} ${inter.variable} antialiased bg-gray-800 text-white font-sans`}
        >
          {/* Iklan 1: Social Bar */}
          <script src="https://alwaysmulticulturallanding.com/a2/e0/3c/a2e03cf1bed0e9d731c3812e05e4517c.js"></script>

          {/* Iklan 1: Popunder */}
          <script src="https://alwaysmulticulturallanding.com/fe/8f/81/fe8f815f75fcefd6fa17243386912ae0.js"></script>

          {/* Iklan 1: Native Banner */}
          <script async="async" data-cfasync="false" src="https://alwaysmulticulturallanding.com/bcf5164b464a8e3c0b486cd50f77b999/invoke.js"></script>
          <div id="container-bcf5164b464a8e3c0b486cd50f77b999"></div>

          <Providers>
            {children}
          </Providers>
        </body>
      </html>
  );
}
