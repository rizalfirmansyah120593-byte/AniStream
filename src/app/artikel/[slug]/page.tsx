import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/Seo/JsonLd";
import { getPublishedArticle } from "@/utils/articleStore";
import { resolveArticlePoster } from "@/utils/articlePoster";
import { SITE_URL } from "@/utils/config";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const storedArticle = await getPublishedArticle(slug).catch(() => null);
  if (!storedArticle) return { title: "Artikel tidak ditemukan", robots: { index: false, follow: true } };
  const article = await resolveArticlePoster(storedArticle);
  const canonical = `${SITE_URL}/artikel/${encodeURIComponent(article.slug)}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: canonical,
      publishedTime: article.publishedAt,
      images: article.posterUrl ? [{ url: article.posterUrl, alt: `Poster ${article.trendKeyword}` }] : undefined,
    },
    twitter: article.posterUrl ? { card: "summary_large_image", images: [article.posterUrl] } : undefined,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const storedArticle = await getPublishedArticle(slug).catch(() => null);
  if (!storedArticle) notFound();
  const article = await resolveArticlePoster(storedArticle);

  const canonical = `${SITE_URL}/artikel/${encodeURIComponent(article.slug)}`;
  const posterUrl = article.posterUrl || "/banner.png";
  const readableDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date(article.publishedAt));
  const wordCount = [article.title, article.excerpt, ...article.sections.flatMap(section => [section.heading, ...section.paragraphs])]
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: article.title,
    description: article.excerpt,
    ...(article.posterUrl ? { image: [article.posterUrl] } : {}),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: "id-ID",
    mainEntityOfPage: canonical,
    author: { "@type": "Organization", name: "AniStream", url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@type": "TVSeries", name: article.trendKeyword, url: `${SITE_URL}/anime/${encodeURIComponent(article.animeSlug)}` },
    citation: article.sources.map(source => source.url),
  };

  return (
    <main className="min-h-screen bg-[#080a0e] px-4 pb-20 pt-28 text-white md:px-8">
      <JsonLd data={schema} />
      <article className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
          <Link href="/" className="hover:text-white">Beranda</Link>
          <span className="mx-2 text-slate-600">/</span>
          <Link href="/artikel" className="hover:text-white">Artikel</Link>
          <span className="mx-2 text-slate-600">/</span>
          <span aria-current="page" className="text-slate-200">Bacaan</span>
        </nav>

        <header className="mt-8 grid gap-8 border-b border-white/10 pb-10 md:gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">
              {article.trendTraffic === "Katalog AniStream" ? "Sorotan katalog anime" : "Topik yang sedang dicari"}
            </p>
            <p className="mt-3 text-sm font-medium text-slate-300">{article.trendKeyword}</p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">{article.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-5 text-sm text-slate-400">
              <span className="font-semibold text-white">AniStream Redaksi</span>
              <span aria-hidden="true" className="text-slate-600">•</span>
              <time dateTime={article.publishedAt}>{readableDate}</time>
              <span aria-hidden="true" className="text-slate-600">•</span>
              <span>{readingMinutes} menit baca</span>
            </div>
          </div>

          <figure className="mx-auto w-full max-w-[300px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
              <Image
                src={posterUrl}
                alt={`Poster ${article.trendKeyword}`}
                fill
                priority
                sizes="(max-width: 1024px) 70vw, 300px"
                quality={78}
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
            <figcaption className="mt-3 text-center text-xs leading-5 text-slate-500">Poster anime terkait · Sumber: katalog AniStream</figcaption>
          </figure>
        </header>

        <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
          <div className="min-w-0">
            <p className="mb-9 border-l-2 border-red-500 pl-5 text-base leading-8 text-slate-300 md:text-lg">
              Artikel ini merangkum informasi yang tersedia dan menempatkannya dalam konteks yang mudah diikuti. Periksa sumber dan halaman anime terkait untuk detail terbaru.
            </p>
            <div className="space-y-10 md:space-y-12">
              {article.sections.map((section, index) => (
                <section key={`${section.heading}-${index}`}>
                  <h2 className="text-2xl font-bold leading-snug tracking-tight text-white md:text-3xl">{section.heading}</h2>
                  <div className="mt-4 space-y-5 text-base leading-8 text-slate-300 md:text-lg md:leading-9">
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-2xl border border-white/10 bg-[#11151c] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Terkait</p>
              <h2 className="mt-3 text-lg font-bold leading-snug">{article.trendKeyword}</h2>
              <Link href={`/anime/${encodeURIComponent(article.animeSlug)}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300">
                Lihat halaman anime <span aria-hidden="true">→</span>
              </Link>
            </section>
            <section className="rounded-2xl border border-white/10 bg-[#11151c] p-5" aria-label="Sumber artikel">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-300">Sumber & referensi</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                {article.sources.map(source => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-4 hover:text-white">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            <p className="px-1 text-xs leading-5 text-slate-500">Informasi dapat berubah. Untuk pengumuman terbaru, rujuk sumber resmi yang tercantum.</p>
          </aside>
        </div>
      </article>
    </main>
  );
}
