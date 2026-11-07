import { API_URL } from "@/utils/config";
import HomeClient from "./HomeClient";
import type { Metadata } from "next";
import { SITE_URL } from "@/utils/config";
import { JsonLd } from "@/components/Seo/JsonLd";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Nonton Anime Sub Indo Terbaru dan Terlengkap",
  description: "Nonton anime subtitle Indonesia terbaru dengan episode lengkap, jadwal tayang, genre, dan update anime harian di AniStream.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Nonton Anime Sub Indo Terbaru dan Terlengkap",
    description: "Streaming anime subtitle Indonesia terbaru dengan episode lengkap di AniStream.",
    url: SITE_URL,
    type: "website",
  },
};

async function getInitialNewAnime() {
  try {
    const response = await fetch(`${API_URL}/new-anime`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 },
    });
    if (!response.ok) return { data: [] };
    return await response.json();
  } catch {
    return { data: [] };
  }
}

export default async function HomePage() {
  const initialNewAnime = await getInitialNewAnime();
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/#home`,
    name: "AniStream - Anime Sub Indo Terbaru",
    description: "Temukan anime terbaru, jadwal tayang, genre, dan episode di AniStream.",
    url: SITE_URL,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <main>
      <JsonLd data={schema} />
      <HomeClient initialNewAnime={initialNewAnime} />
      <section className="mx-auto max-w-5xl px-4 py-10 text-gray-300" aria-labelledby="tentang-anistream">
        <h2 id="tentang-anistream" className="text-2xl font-semibold text-white">Streaming Anime Sub Indo Terbaru di AniStream</h2>
        <p className="mt-4 leading-7">AniStream membantu penggemar anime Indonesia menemukan serial, film, OVA, dan episode terbaru dalam satu tempat. Koleksi diperbarui mengikuti rilisan yang tersedia, dilengkapi informasi genre, tahun tayang, status, rating, sinopsis, serta daftar episode yang mudah ditelusuri. Gunakan pencarian atau jelajahi kategori untuk menemukan tontonan sesuai suasana hati, mulai dari aksi dan petualangan hingga romansa, komedi, fantasi, dan isekai. Setiap halaman anime dirancang dengan navigasi yang jelas agar kamu dapat melanjutkan streaming tanpa kehilangan urutan episode. Pilihan resolusi dapat bergantung pada server video yang tersedia, termasuk pengalaman menonton resolusi 1080p bila disediakan provider. AniStream juga mengutamakan streaming lancar di perangkat desktop maupun seluler, dengan pembaruan informasi secara berkala dan tautan terkait yang membantu menemukan anime lain.</p>
        <nav aria-label="Informasi AniStream" className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/about" className="text-red-400 hover:text-red-300">About AniStream</Link>
          <Link href="/contact" className="text-red-400 hover:text-red-300">Contact</Link>
          <Link href="/terms" className="text-red-400 hover:text-red-300">Terms</Link>
          <Link href="/privacy" className="text-red-400 hover:text-red-300">Privacy</Link>
          <Link href="/dmca" className="text-red-400 hover:text-red-300">DMCA</Link>
          <a href="mailto:contact@anistreaming.com" className="text-red-400 hover:text-red-300">contact@anistreaming.com</a>
        </nav>
      </section>
    </main>
  );
}
