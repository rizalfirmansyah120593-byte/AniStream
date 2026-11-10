import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Anime Saya",
  description: "Kelola daftar anime yang ingin ditonton di AniStream.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
