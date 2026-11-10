import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cari Anime",
  description: "Cari judul anime dan temukan informasi episode di AniStream.",
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
