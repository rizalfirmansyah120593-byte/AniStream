import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nonton One Piece Sub Indo | Episode Terbaru One Piece",
  description: "Nonton anime One Piece subtitle Indonesia dengan episode terbaru, daftar episode lengkap, sinopsis, dan pilihan server streaming HD.",
  keywords: [
    "nonton anime one piece",
    "nonton one piece sub indo",
    "episode terbaru one piece",
    "one piece episode terbaru",
    "one piece subtitle indonesia",
  ],
  alternates: { canonical: "/anime/one-piece" },
  openGraph: {
    title: "Nonton One Piece Sub Indo | Episode Terbaru One Piece",
    description: "Nonton One Piece subtitle Indonesia dan ikuti episode terbarunya di AniStream.",
    type: "video.tv_show",
    url: "/anime/one-piece",
  },
};

export default function OnePieceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
