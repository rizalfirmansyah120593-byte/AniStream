import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/Seo/JsonLd";
import { episodePath, getAnime, getAnimeDescription, getEpisode, getPoster } from "@/utils/anime";
import { API_URL, SITE_URL } from "@/utils/config";
import { WatchPlaybackGate } from "./WatchPlaybackGate";

type Props = {
  params: Promise<{ slug: string; episode: string }>;
};

async function getPageData(slug: string, episodeNumber: string) {
  const anime = await getAnime(slug);
  if (!anime) return null;

  const episode = (anime.episodes || []).find(
    (item) => String(item.episode) === episodeNumber,
  );
  if (!episode) return null;

  const details = episode.detail_eps
    ? await getEpisode(episodePath(episode.detail_eps))
    : null;

  let videoUrl: string | null = null;
  const videoPath = details?.videos?.[0]?.video;
  if (videoPath) {
    try {
      const response = await fetch(`${API_URL}${videoPath}`, {
        next: { revalidate: 900 },
      });
      if (response.ok) videoUrl = (await response.json())?.url || null;
    } catch {
      // The page remains indexable even if a provider is temporarily offline.
    }
  }

  return { anime, episode, details, videoUrl };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, episode: episodeNumber } = await params;
  const data = await getPageData(slug, episodeNumber);
  const title = data?.anime.title || slug.replace(/[-_]/g, " ");
  const episodeTitle = data?.episode.title || `Episode ${episodeNumber}`;
  const description = data?.episode.description ||
    `Nonton ${title} ${episodeTitle} subtitle Indonesia di AniStream.`;
  const canonical = `${SITE_URL}/watch/${encodeURIComponent(slug)}/${encodeURIComponent(episodeNumber)}`;

  return {
    title: `${title} ${episodeTitle} Sub Indo`,
    description: description.replace(/\s+/g, " ").slice(0, 160),
    alternates: { canonical },
    robots: data?.episode.description || data?.details?.description
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: "video.episode",
      url: canonical,
      title: `${title} ${episodeTitle} Sub Indo`,
      description,
      images: [{ url: data ? getPoster(data.anime) : `${SITE_URL}/banner.png` }],
    },
  };
}

export default async function WatchPage({ params }: Props) {
  const { slug, episode: episodeNumber } = await params;
  const data = await getPageData(slug, episodeNumber);
  if (!data) notFound();

  const title = data.anime.title || slug;
  const episodeTitle = data.episode.title || `Episode ${episodeNumber}`;
  const description = data.episode.description || data.details?.description ||
    `Informasi streaming ${title} ${episodeTitle} subtitle Indonesia di AniStream.`;
  const canonical = `${SITE_URL}/watch/${encodeURIComponent(slug)}/${encodeURIComponent(episodeNumber)}`;
  const poster = getPoster(data.anime);

  const videoSchema = data.videoUrl ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${canonical}#video`,
    name: `${title} ${episodeTitle}`,
    description,
    thumbnailUrl: [poster],
    embedUrl: data.videoUrl,
    contentUrl: data.videoUrl,
    uploadDate: data.episode.published_at || data.episode.updated_at,
    duration: data.episode.duration,
    isPartOf: {
      "@type": "TVSeries",
      name: title,
      url: `${SITE_URL}/anime/${encodeURIComponent(slug)}`,
    },
  } : null;
  const episodeSchema = {
    "@context": "https://schema.org", "@type": "TVEpisode", "@id": `${canonical}#episode`,
    name: `${title} ${episodeTitle}`, episodeNumber: Number(episodeNumber) || episodeNumber,
    description, url: canonical, image: [poster], partOfTVSeries: { "@id": `${SITE_URL}/anime/${encodeURIComponent(slug)}#series`, name: title, url: `${SITE_URL}/anime/${encodeURIComponent(slug)}` },
    datePublished: data.episode.published_at || data.episode.updated_at,
    video: data.videoUrl ? { "@id": `${canonical}#video` } : undefined,
  };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}/anime/${encodeURIComponent(slug)}` },
    { "@type": "ListItem", position: 3, name: episodeTitle, item: canonical },
  ] };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      {videoSchema && <JsonLd data={videoSchema} />}
      <JsonLd data={episodeSchema} />
      <JsonLd data={breadcrumb} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
        <a href={SITE_URL}>Beranda</a> / {title} / {episodeTitle}
      </nav>
      <h1 className="text-2xl font-semibold md:text-3xl">
        {title} {episodeTitle} Sub Indo
      </h1>
      <p className="mt-3 max-w-3xl text-gray-300">{description}</p>

      {data.videoUrl ? (
        <WatchPlaybackGate
          src={data.videoUrl}
          title={`${title} ${episodeTitle}`}
        />
      ) : (
        <p className="mt-6 rounded-lg bg-gray-900 p-5 text-gray-300">
          Server video sedang tidak tersedia. Silakan coba lagi beberapa saat lagi.
        </p>
      )}

      <p className="mt-6">
        <a className="text-red-400 underline" href={`${SITE_URL}/anime/${encodeURIComponent(slug)}`}>
          Kembali ke halaman {title}
        </a>
      </p>
      <nav aria-label="Tautan terkait" className="mt-5 flex gap-4 text-sm">
        <a className="text-red-400 underline" href={`${SITE_URL}/latest`}>Episode anime terbaru</a>
        <a className="text-red-400 underline" href={`${SITE_URL}/anime/${encodeURIComponent(slug)}`}>Semua episode {title}</a>
      </nav>
      <article className="mt-10 max-w-3xl rounded-lg bg-gray-900 p-6 text-gray-300 leading-7">
        <h2 className="text-xl font-semibold text-white">Recap &amp; Review {title} {episodeTitle}</h2>
        <p className="mt-4">Episode {episodeNumber} dari {title} menghadirkan kelanjutan cerita yang dapat kamu ikuti melalui detail episode dan video di halaman ini. {data.episode.description || `Bagian ini menjadi titik penting untuk melihat perkembangan konflik dan keputusan karakter dalam alur ${title}.`}</p>
        <p className="mt-4">Perhatikan perubahan hubungan antarkarakter, tujuan yang mulai terlihat, serta konsekuensi dari kejadian sebelumnya. Detail kecil pada dialog dan aksi biasanya membantu menjelaskan arah cerita pada episode berikutnya. Karena setiap episode memiliki halaman tersendiri, pembaca dapat membandingkan perkembangan alur tanpa tercampur dengan sinopsis umum serial.</p>
        <p className="mt-4">Kamu dapat streaming {title} ep {episodeNumber} dan nonton anime subtitle Indonesia melalui pemutar yang tersedia. Kualitas video mengikuti provider, termasuk resolusi HD atau 1080p bila tersedia. Gunakan koneksi stabil untuk streaming lancar, lalu kunjungi daftar episode untuk melanjutkan tontonan dan mengikuti update terbaru.</p>
      </article>
    </main>
  );
}
