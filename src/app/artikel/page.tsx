import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles, type PublishedArticle } from "@/utils/articleStore";
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
    articles = await getPublishedArticles(50);
  } catch {
    articles = [];
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-28 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-red-400 hover:text-red-300">← Kembali ke AniStream</Link>
        <h1 className="mt-6 text-4xl font-semibold">Artikel Anime dan Tren</h1>
        <p className="mt-4 max-w-3xl leading-7 text-gray-300">Artikel dipilih berdasarkan sinyal pencarian yang tersedia dan disertai sumber untuk pemeriksaan lebih lanjut. Jadwal otomatis dapat melewatkan waktu terbit jika tidak ada topik yang cukup relevan dan terverifikasi.</p>
        {articles.length ? (
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {articles.map(article => (
              <li key={article.slug} className="rounded-lg border border-gray-700 bg-gray-900 p-5">
                <p className="text-sm text-gray-400">{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(article.publishedAt))}</p>
                <h2 className="mt-3 text-xl font-semibold"><Link className="hover:text-red-300" href={`/artikel/${article.slug}`}>{article.title}</Link></h2>
                <p className="mt-3 leading-7 text-gray-300">{article.excerpt}</p>
                <Link className="mt-4 inline-block text-red-400 hover:text-red-300" href={`/artikel/${article.slug}`}>Baca artikel →</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-lg border border-gray-700 bg-gray-900 p-5 text-gray-300">Belum ada artikel terverifikasi yang diterbitkan.</p>
        )}
      </div>
    </main>
  );
}
