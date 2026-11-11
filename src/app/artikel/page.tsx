import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedArticles, type PublishedArticle } from "@/utils/articleStore";
import { resolveArticlePoster } from "@/utils/articlePoster";
import { SITE_URL } from "@/utils/config";

export const metadata: Metadata = {
  title: "Artikel Anime dan Tren Terbaru",
  description: "Artikel AniStream tentang topik anime dari sinyal pencarian dan informasi katalog yang terverifikasi.",
  alternates: { canonical: `${SITE_URL}/artikel` },
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  let articles: PublishedArticle[] = [];
  try {
    articles = await Promise.all(
      (await getPublishedArticles(24)).map(resolveArticlePoster),
    );
  } catch {
    articles = [];
  }

  const formatDate = (value: string) => new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

  return (
    <main className="min-h-screen bg-[#080a0e] px-4 pb-20 pt-28 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
          <Link href="/" className="hover:text-white">Beranda</Link>
          <span className="mx-2 text-slate-600">/</span>
          <span aria-current="page" className="text-slate-200">Artikel</span>
        </nav>

        <header className="mt-8 border-b border-white/10 pb-8 md:pb-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-400">AniStream · Wawasan anime</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">Artikel dan kabar anime</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Ulasan informasi anime, topik yang sedang dicari, dan panduan untuk penggemar—dengan poster relevan serta sumber yang bisa ditelusuri.
          </p>
        </header>

        {articles.length ? (
          <section aria-label="Artikel terbaru" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => {
              const href = `/artikel/${article.slug}`;
              const posterUrl = article.posterUrl || "/banner.png";
              const isLead = index === 0;
              return (
                <article
                  key={article.slug}
                  className={`group overflow-hidden rounded-2xl border border-white/10 bg-[#11151c] transition-colors hover:border-white/25 ${isLead ? "sm:col-span-2 lg:col-span-2" : ""}`}
                >
                  <Link href={href} className={`grid h-full ${isLead ? "md:grid-cols-[1.05fr_0.95fr]" : "grid-rows-[auto_1fr]"}`}>
                    <div className={`relative overflow-hidden bg-slate-900 ${isLead ? "aspect-[16/10] md:aspect-auto md:min-h-[340px]" : "aspect-[16/10]"}`}>
                      <Image
                        src={posterUrl}
                        alt={`Poster anime terkait: ${article.trendKeyword}`}
                        fill
                        priority={isLead}
                        sizes={isLead ? "(max-width: 768px) 100vw, 55vw" : "(max-width: 768px) 100vw, 33vw"}
                        quality={72}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                        {article.trendTraffic === "Katalog AniStream" ? "Pilihan redaksi" : "Topik pencarian"}
                      </span>
                    </div>
                    <div className={`flex flex-col p-5 md:p-6 ${isLead ? "md:justify-center md:p-8" : ""}`}>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{formatDate(article.publishedAt)}</p>
                      <h2 className={`${isLead ? "mt-3 text-2xl md:text-4xl" : "mt-3 text-xl"} font-bold leading-snug tracking-tight text-white group-hover:text-red-300`}>
                        {article.title}
                      </h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-300 md:text-base">{article.excerpt}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-400">
                        Baca selengkapnya <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#11151c] p-8 text-slate-300">
            <h2 className="text-xl font-semibold text-white">Artikel sedang disiapkan</h2>
            <p className="mt-2 leading-7">Artikel baru akan muncul setelah topik dan informasi sumber memenuhi pemeriksaan kualitas.</p>
          </div>
        )}
      </div>
    </main>
  );
}
