import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles, type PublishedArticle } from "@/utils/articleStore";
import { getAnime, getPoster } from "@/utils/anime";
import { SITE_URL } from "@/utils/config";

export const metadata: Metadata = {
  title: "Artikel Anime dan Tren Terbaru",
  description: "Baca artikel anime terbaru tentang jadwal rilis, episode, rekomendasi, urutan nonton, dan pembahasan cerita di AniStream.",
  keywords: ["artikel anime terbaru", "jadwal anime", "rekomendasi anime", "urutan nonton anime", "anime sub indo"],
  alternates: { canonical: `${SITE_URL}/artikel` },
  openGraph: { title: "Artikel Anime dan Tren Terbaru | AniStream", description: "Informasi anime terbaru, rekomendasi, dan panduan nonton yang mudah dipahami." },
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  let articles: PublishedArticle[] = [];
  try {
    articles = await getPublishedArticles(50);
  } catch {
    articles = [];
  }

  const articleCards = await Promise.all(articles.map(async (article) => ({
    article,
    anime: await getAnime(article.animeSlug),
  })));

  return (
    <main className="min-h-screen bg-[#07090f] px-4 pb-20 pt-24 text-white md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-red-400 transition hover:text-red-300">← Kembali ke AniStream</Link>
        <header className="mt-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-400">Wawasan AniStream</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Artikel Anime dan Tren Terbaru</h1>
          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">Temukan jadwal anime musiman, update episode, rekomendasi genre, panduan urutan nonton, dan pembahasan cerita yang ditulis dengan bahasa yang mudah dipahami. Setiap artikel dirangkum dari data katalog AniStream dan sumber tepercaya agar kamu bisa membaca informasi anime terbaru dengan nyaman.</p>
        </header>
        <div className="mt-10 flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold">Artikel pilihan terbaru</h2>
          <span className="text-sm text-slate-400">{articles.length} artikel</span>
        </div>
        {articles.length ? (
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {articleCards.map(({ article, anime }) => (
              <li key={article.slug} className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-red-500/50">
                <Link href={`/artikel/${article.slug}`} className="block">
                  <div className="relative aspect-[16/8] overflow-hidden bg-slate-800">
                    <img src={getPoster(anime || {})} alt={`Poster ${anime?.title || article.trendKeyword}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">{article.trendKey.split(":")[0].replace(/-/g, " ")}</span>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-slate-400">{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(article.publishedAt))}</p>
                    <h2 className="mt-3 text-xl font-bold leading-snug text-white transition group-hover:text-red-300">{article.title}</h2>
                    <p className="mt-3 line-clamp-3 leading-7 text-slate-300">{article.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-2 font-semibold text-red-400">Baca artikel <span aria-hidden>→</span></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-300">Belum ada artikel terverifikasi yang diterbitkan.</p>
        )}
      </div>
    </main>
  );
}
