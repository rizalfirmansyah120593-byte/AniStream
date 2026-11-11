import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/Seo/JsonLd";
import { getPublishedArticle } from "@/utils/articleStore";
import { SITE_URL } from "@/utils/config";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug).catch(() => null);
  if (!article) return { title: "Artikel tidak ditemukan", robots: { index: false, follow: true } };
  const canonical = `${SITE_URL}/artikel/${encodeURIComponent(article.slug)}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: { type: "article", title: article.title, description: article.excerpt, url: canonical, publishedTime: article.publishedAt },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug).catch(() => null);
  if (!article) notFound();

  const canonical = `${SITE_URL}/artikel/${encodeURIComponent(article.slug)}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: article.title,
    description: article.excerpt,
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
    <main className="min-h-screen bg-black px-4 pb-16 pt-28 text-white md:px-12">
      <JsonLd data={schema} />
      <article className="mx-auto max-w-3xl">
        <Link href="/artikel" className="text-sm text-red-400 hover:text-red-300">← Semua artikel</Link>
        <p className="mt-6 text-sm text-gray-400">{article.trendTraffic === "Katalog AniStream" ? "Topik katalog" : "Topik tren"}: {article.trendKeyword} · {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(article.publishedAt))}</p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">{article.title}</h1>
        <p className="mt-5 text-lg leading-8 text-gray-300">{article.excerpt}</p>
        <div className="mt-10 space-y-8">
          {article.sections.map((section, index) => (
            <section key={`${section.heading}-${index}`}>
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="mt-3 leading-8 text-gray-300">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
        <aside className="mt-10 border-t border-gray-700 pt-6" aria-label="Sumber artikel">
          <h2 className="text-lg font-semibold">Sumber dan referensi</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-300">
            {article.sources.map(source => (
              <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-red-400 underline hover:text-red-300">{source.title}</a></li>
            ))}
          </ul>
        </aside>
        <p className="mt-8 text-sm text-gray-400">Lihat juga <Link href={`/anime/${encodeURIComponent(article.animeSlug)}`} className="text-red-400 underline">informasi anime di AniStream</Link>. Artikel ini merangkum fakta bersumber dan tidak menggantikan pengumuman resmi.</p>
      </article>
    </main>
  );
}
