import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AnimeClient from "./AnimeClient";
import { API_URL, SITE_URL } from "@/utils/config";

type AnimeDetail = {
  title?: string;
  english_title?: string;
  japanese_title?: string;
  description?: string;
  descriptions?: string[];
  img?: string;
  poster?: string;
  status?: string;
  genres?: { title?: string; name?: string }[] | string[];
};

async function getAnime(id: string): Promise<AnimeDetail | null> {
  try {
    const response = await fetch(`${API_URL}/detail-anime/${encodeURIComponent(id)}`, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    const json = await response.json();
    return json?.data || json;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnime(id);
  const title = anime?.title || id.replace(/[-_]/g, " ");
  const description = anime?.description || anime?.descriptions?.[0] || `Nonton ${title} subtitle Indonesia dengan daftar episode dan informasi anime terbaru.`;
  const canonical = `${SITE_URL}/anime/${encodeURIComponent(id)}`;
  return {
    title: `Nonton ${title} Sub Indo`,
    description: description.slice(0, 160),
    alternates: { canonical },
    openGraph: { title: `Nonton ${title} Sub Indo`, description: description.slice(0, 160), url: canonical, type: "video.tv_show", images: anime?.img || anime?.poster ? [{ url: anime.img || anime.poster || "" }] : undefined },
  };
}

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anime = await getAnime(id);
  if (!anime) notFound();
  const title = anime.title || id;
  const description = (anime.description || anime.descriptions?.[0] || `Informasi ${title} dan daftar episode subtitle Indonesia.`).slice(0, 500);
  const genres = (anime.genres || []).map((genre) => typeof genre === "string" ? genre : genre.title || genre.name || "").filter(Boolean);
  const schema = {
    "@context": "https://schema.org", "@type": "TVSeries", name: title,
    alternateName: [anime.english_title, anime.japanese_title].filter(Boolean), description,
    image: anime.img || anime.poster, url: `${SITE_URL}/anime/${encodeURIComponent(id)}`,
    genre: genres, inLanguage: "id", isFamilyFriendly: true,
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <AnimeClient params={Promise.resolve({ id })} />
  </>;
}
