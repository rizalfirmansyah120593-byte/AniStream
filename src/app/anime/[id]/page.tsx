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
  episodes?: { episode?: number | string; title?: string; detail_eps?: string }[];
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
  const canonical = `${SITE_URL}/anime/${encodeURIComponent(id)}`;
  const episodes = (anime.episodes || [])
    .filter((episode) => episode.episode != null)
    .sort((a, b) => {
      const episodeA = Number(a.episode);
      const episodeB = Number(b.episode);

      if (Number.isNaN(episodeA)) return 1;
      if (Number.isNaN(episodeB)) return -1;
      return episodeB - episodeA;
    });
  const schema = {
    "@context": "https://schema.org", "@type": "TVSeries", name: title,
    alternateName: [anime.english_title, anime.japanese_title].filter(Boolean), description,
    image: anime.img || anime.poster, url: canonical,
    genre: genres, inLanguage: "id", isFamilyFriendly: true,
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Anime", item: `${SITE_URL}/latest` },
      { "@type": "ListItem", position: 3, name: title, item: canonical },
    ],
  };
  const episodeList = episodes.length > 0 ? {
    "@context": "https://schema.org", "@type": "ItemList", name: `Episode ${title}`,
    itemListElement: episodes.map((episode, index) => ({
      "@type": "ListItem", position: index + 1,
      name: episode.title || `Episode ${episode.episode}`,
      url: `${canonical}#episode-${episode.episode}`,
    })),
  } : null;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    {episodeList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(episodeList) }} />}
    <section className="px-4 py-6 md:px-16 bg-gray-900" aria-label={`Informasi ${title}`}>
      <h1 className="text-2xl md:text-3xl font-semibold">Nonton {title} Sub Indo</h1>
      <p className="mt-3 max-w-4xl text-gray-300 leading-7">{description}</p>
      {genres.length > 0 && <p className="mt-2 text-sm text-gray-400">Genre: {genres.join(", ")}</p>}
      {episodes.length > 0 && (
        <nav aria-label={`Daftar episode ${title}`}>
          <h2>Daftar Episode {title}</h2>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {episodes.map((episode) => (
              <li key={String(episode.episode)}>
                <a href={`${canonical}#episode-${episode.episode}`}>
                  {episode.title || `Episode ${episode.episode}`}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
    <AnimeClient params={Promise.resolve({ id })} />
  </>;
}
