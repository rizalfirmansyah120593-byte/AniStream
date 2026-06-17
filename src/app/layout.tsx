import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Providers } from "@/components/Providers";
import Script from 'next/script';

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
          <Script src="https://pl29772446.effectivecpmnetwork.com/02/7e/f2/027ef20aa3ab234238482f60052e0581.js" />
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
  );
}
