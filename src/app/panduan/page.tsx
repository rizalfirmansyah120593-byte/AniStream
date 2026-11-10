import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/Seo/JsonLd";
import { SITE_URL, API_URL } from "@/utils/config";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Daftar Anime Terbaru dan Ongoing Sub Indo",
  description: "Temukan anime terbaru, anime ongoing, jadwal episode, genre populer, dan cara memilih tontonan subtitle Indonesia di AniStream.",
  alternates: { canonical: `${SITE_URL}/panduan` },
  openGraph: {
    title: "Daftar Anime Terbaru dan Ongoing Sub Indo",
    description: "Panduan menemukan anime terbaru, ongoing, dan episode subtitle Indonesia di AniStream.",
    url: `${SITE_URL}/panduan`,
    type: "article",
  },
};

type Anime = { title?: string; slug?: string; link?: string; episode?: string; released?: string };

async function getAnime(endpoint: string): Promise<Anime[]> {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, { next: { revalidate: 600 } });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data.slice(0, 12) : [];
  } catch {
    return [];
  }
}

function animeHref(anime: Anime) {
  const raw = anime.slug || anime.link || "";
  const slug = raw.split("?")[0].split("/").filter(Boolean).pop() || "";
  return slug ? `/anime/${encodeURIComponent(slug)}` : "/latest";
}

const GUIDES = [
  { href: "/panduan/anime-terbaru-sub-indo", title: "Cara menemukan anime terbaru sub Indo", description: "Filter episode baru, serial baru, dan update katalog dengan lebih cepat." },
  { href: "/panduan/anime-ongoing-terbaik", title: "Memilih anime ongoing terbaik", description: "Panduan mengikuti episode mingguan berdasarkan genre dan status." },
  { href: "/panduan/cara-memilih-anime", title: "Cara memilih anime berdasarkan genre", description: "Gunakan genre, tipe, rating, dan sinopsis untuk menemukan tontonan." },
];

const faqs = [
  {
    question: "Di mana melihat anime terbaru subtitle Indonesia?",
    answer: "Gunakan halaman Anime Terbaru AniStream untuk melihat judul dan episode yang baru diperbarui. Setiap judul memiliki halaman detail, genre, sinopsis, dan daftar episode.",
  },
  {
    question: "Apa perbedaan anime ongoing dan completed?",
    answer: "Anime ongoing masih mendapatkan episode baru sesuai jadwal rilis, sedangkan completed telah menyelesaikan episode yang tersedia pada katalognya. Status dapat berubah mengikuti pembaruan provider.",
  },
  {
    question: "Bagaimana memilih anime yang cocok ditonton?",
    answer: "Mulai dari genre, tipe anime, rating, sinopsis, dan episode terbaru. AniStream menyediakan halaman genre serta kategori untuk membantu mempersempit pilihan.",
  },
];

export default async function GuidePage() {
  const [latest, ongoing] = await Promise.all([
    getAnime("new-anime?page=1"),
    getAnime("ongoing-anime"),
  ]);
  const publishedAt = "2026-11-10";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/panduan#article`,
    headline: "Daftar Anime Terbaru dan Ongoing Sub Indo",
    description: "Panduan menemukan anime terbaru, ongoing, jadwal episode, dan genre populer di AniStream.",
    url: `${SITE_URL}/panduan`,
    datePublished: publishedAt,
    dateModified: publishedAt,
    inLanguage: "id-ID",
    author: { "@type": "Organization", name: "AniStream", url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/panduan` },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-24 text-white md:px-12">
      <JsonLd data={schema} />
      <JsonLd data={faqSchema} />
      <article className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
          <Link href="/" className="hover:text-red-300">Beranda</Link> / Panduan anime
        </nav>
        <header className="mt-6 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-400">Panduan AniStream</p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">Daftar Anime Terbaru dan Ongoing Sub Indo</h1>
          <p className="mt-5 text-lg leading-8 text-gray-300">Cari tontonan baru tanpa harus membuka banyak situs. Halaman ini merangkum cara menemukan anime terbaru, anime ongoing, episode yang baru rilis, dan pilihan genre yang sesuai untuk penonton Indonesia.</p>
        </header>

        <section className="mt-10" aria-labelledby="artikel-panduan">
          <h2 id="artikel-panduan" className="text-2xl font-semibold">Panduan anime yang paling membantu</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">{GUIDES.map((guide) => <Link key={guide.href} href={guide.href} className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-red-500"><h3 className="font-semibold">{guide.title}</h3><p className="mt-3 text-sm leading-6 text-gray-400">{guide.description}</p><span className="mt-4 inline-block text-sm text-red-400">Baca panduan →</span></Link>)}</div>
        </section>

        <section className="mt-10 rounded-xl border border-gray-800 bg-gray-900 p-6 md:p-8" aria-labelledby="cara-memilih">
          <h2 id="cara-memilih" className="text-2xl font-semibold">Cara memilih anime untuk ditonton</h2>
          <p className="mt-4 leading-8 text-gray-300">Mulailah dari kebutuhanmu: episode mingguan untuk mengikuti anime ongoing, katalog selesai untuk maraton, atau genre tertentu untuk suasana hati. Periksa sinopsis, tipe anime, rating, dan daftar episode sebelum memilih. Informasi episode dan ketersediaan server dapat berubah karena AniStream mengindeks data dari penyedia pihak ketiga.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/latest" className="rounded bg-red-600 px-4 py-2 font-semibold hover:bg-red-500">Anime terbaru</Link>
            <Link href="/category/ongoing" className="rounded border border-gray-600 px-4 py-2 font-semibold hover:border-red-400">Anime ongoing</Link>
            <Link href="/genres" className="rounded border border-gray-600 px-4 py-2 font-semibold hover:border-red-400">Jelajahi genre</Link>
            <Link href="/schedule" className="rounded border border-gray-600 px-4 py-2 font-semibold hover:border-red-400">Jadwal rilis</Link>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="terbaru">
          <div className="flex items-end justify-between gap-4">
            <div><h2 id="terbaru" className="text-2xl font-semibold">Anime terbaru yang diperbarui</h2><p className="mt-2 text-gray-400">Judul dan episode terbaru dari katalog AniStream.</p></div>
            <Link href="/latest" className="text-sm text-red-400 hover:text-red-300">Lihat semua</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((anime, index) => <Link key={`${animeHref(anime)}-${index}`} href={animeHref(anime)} className="rounded-lg border border-gray-800 bg-gray-900 p-4 hover:border-red-500"><h3 className="font-semibold">{anime.title || "Anime terbaru"}</h3><p className="mt-2 text-sm text-gray-400">{anime.episode || "Episode terbaru"}{anime.released ? ` · ${anime.released}` : ""}</p></Link>)}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="ongoing">
          <div className="flex items-end justify-between gap-4">
            <div><h2 id="ongoing" className="text-2xl font-semibold">Anime ongoing untuk diikuti tiap minggu</h2><p className="mt-2 text-gray-400">Ikuti episode baru dari serial yang masih berjalan.</p></div>
            <Link href="/category/ongoing" className="text-sm text-red-400 hover:text-red-300">Lihat semua</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ongoing.map((anime, index) => <Link key={`${animeHref(anime)}-${index}`} href={animeHref(anime)} className="rounded-lg border border-gray-800 bg-gray-900 p-4 hover:border-red-500"><h3 className="font-semibold">{anime.title || "Anime ongoing"}</h3><p className="mt-2 text-sm text-gray-400">{anime.episode || "Episode terbaru"}</p></Link>)}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="faq-panduan">
          <h2 id="faq-panduan" className="text-2xl font-semibold">Pertanyaan umum tentang anime terbaru</h2>
          <div className="mt-4 space-y-4">{faqs.map((faq) => <details key={faq.question} className="rounded-lg border border-gray-800 bg-gray-900 p-4"><summary className="cursor-pointer font-semibold">{faq.question}</summary><p className="mt-3 leading-7 text-gray-300">{faq.answer}</p></details>)}</div>
        </section>
      </article>
    </main>
  );
}
