import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/Seo/JsonLd";
import { getPublishedArticle } from "@/utils/articleStore";
import { getAnime, getGenres, getPoster } from "@/utils/anime";
import { getTrailerBySlug } from "@/utils/animeTrailers";
import { SITE_URL } from "@/utils/config";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug).catch(() => null);
  if (!article) return { title: "Artikel tidak ditemukan", robots: { index: false, follow: true } };
  const canonical = `${SITE_URL}/artikel/${encodeURIComponent(article.slug)}`;
  const anime = await getAnime(article.animeSlug);
  const poster = getPoster(anime || {});
  const imageUrl = poster.startsWith("http") ? poster : `${SITE_URL}${poster}`;
  return {
    title: article.title,
    description: article.excerpt,
    keywords: [article.trendKeyword, article.trendTraffic, `${anime?.title || article.animeSlug} sub indo`, "artikel anime"],
    alternates: { canonical },
    openGraph: { type: "article", title: article.title, description: article.excerpt, url: canonical, publishedTime: article.publishedAt, images: [{ url: imageUrl, alt: `Poster ${anime?.title || article.trendKeyword}` }] },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt, images: [imageUrl] },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug).catch(() => null);
  if (!article) notFound();

  const canonical = `${SITE_URL}/artikel/${encodeURIComponent(article.slug)}`;
  const anime = await getAnime(article.animeSlug);
  const poster = getPoster(anime || {});
  const trailer = getTrailerBySlug(article.animeSlug);
  const animeTitle = anime?.title || article.trendKeyword;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: article.title,
    description: article.excerpt,
    image: [poster.startsWith("http") ? poster : `${SITE_URL}${poster}`],
    keywords: [article.trendKeyword, article.trendTraffic, article.animeSlug],
    articleSection: article.trendKey.split(":")[0].replace(/-/g, " "),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: "id-ID",
    mainEntityOfPage: canonical,
    author: { "@type": "Organization", name: "AniStream", url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@type": "TVSeries", name: article.trendKeyword, url: `${SITE_URL}/anime/${encodeURIComponent(article.animeSlug)}` },
    citation: article.sources.map(source => source.url),
  };

  const genres = getGenres(anime || {});
  return (
    <main className="min-h-screen bg-[#07090f] px-4 pb-20 pt-24 text-white md:px-8 lg:px-12">
      <JsonLd data={schema} />
      <article className="mx-auto max-w-6xl">
        <Link href="/artikel" className="inline-flex items-center gap-2 text-sm font-medium text-red-400 transition hover:text-red-300">← Kembali ke semua artikel</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">{article.trendKey.split(":")[0].replace(/-/g, " ")}</p>
            <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{article.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
              <time dateTime={article.publishedAt}>{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(article.publishedAt))}</time>
              <span aria-hidden>•</span><span>{animeTitle}</span>{genres.length > 0 && <><span aria-hidden>•</span><span>{genres.slice(0, 3).join(" · ")}</span></>}
            </div>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30 lg:sticky lg:top-24">
            <img src={poster} alt={`Poster ${animeTitle}`} className="aspect-[2/3] w-full object-cover" />
            <figcaption className="p-4 text-sm text-slate-300">{animeTitle}</figcaption>
          </figure>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,760px)_260px] lg:justify-center">
          <div className="min-w-0">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 md:p-10">
              <div className="space-y-10">
                {article.sections.map((section, index) => (
                  <section key={`${section.heading}-${index}`}>
                    <h2 className="text-2xl font-bold leading-snug text-white md:text-3xl">{section.heading}</h2>
                    {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="mt-4 text-[1.05rem] leading-8 text-slate-300">{paragraph}</p>)}
                  </section>
                ))}
              </div>
            </div>
            {trailer && <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-5 md:p-6" aria-labelledby="trailer-heading"><h2 id="trailer-heading" className="text-xl font-bold">Trailer {animeTitle}</h2><p className="mt-2 text-sm text-slate-400">Lihat video resmi yang berkaitan dengan pembahasan ini.</p><div className="mt-5 aspect-video overflow-hidden rounded-xl bg-black"><iframe title={`Trailer ${animeTitle}`} src={`https://www.youtube.com/embed/${trailer.youtubeId}?rel=0&modestbranding=1`} className="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></section>}
            <aside className="mt-8 border-t border-white/10 pt-7" aria-label="Sumber artikel"><h2 className="text-xl font-bold">Sumber dan referensi</h2><ul className="mt-4 space-y-3 text-sm text-slate-300">{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-red-400 underline decoration-red-400/40 underline-offset-4 hover:text-red-300">{source.title}</a></li>)}</ul></aside>
          </div>
          <nav aria-label="Jelajahi anime terkait" className="h-fit rounded-2xl border border-white/10 bg-slate-900/80 p-5 lg:sticky lg:top-24"><h2 className="font-bold">Jelajahi lebih lanjut</h2><div className="mt-4 grid gap-3 text-sm"><Link href={`/anime/${encodeURIComponent(article.animeSlug)}`} className="text-red-400 hover:text-red-300">Detail anime terkait →</Link><Link href="/latest" className="text-red-400 hover:text-red-300">Anime terbaru →</Link><Link href="/category/ongoing" className="text-red-400 hover:text-red-300">Anime ongoing →</Link><Link href="/genres" className="text-red-400 hover:text-red-300">Jelajahi genre →</Link><Link href="/schedule" className="text-red-400 hover:text-red-300">Jadwal rilis →</Link></div><p className="mt-6 border-t border-white/10 pt-4 text-xs leading-6 text-slate-400">Artikel ini merangkum fakta bersumber dan tidak menggantikan pengumuman resmi.</p></nav>
        </div>
      </article>
    </main>
  );
}
