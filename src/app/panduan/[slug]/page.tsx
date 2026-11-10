import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/Seo/JsonLd";
import { SITE_URL } from "@/utils/config";

type Guide = {
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { question: string; answer: string }[];
};

const guides: Record<string, Guide> = {
  "anime-terbaru-sub-indo": {
    title: "Anime Terbaru Sub Indo: Cara Menemukan Episode yang Baru Rilis",
    description: "Panduan menemukan anime terbaru subtitle Indonesia, memeriksa episode, dan memilih tontonan yang sesuai di AniStream.",
    intro: "Mencari anime terbaru subtitle Indonesia tidak cukup hanya melihat judul. Episode dapat dirilis bertahap, jadwal bisa berubah, dan ketersediaan server berbeda di setiap provider. Gunakan panduan ini untuk menemukan update terbaru secara lebih efisien.",
    sections: [
      { heading: "Mulai dari halaman Anime Terbaru", paragraphs: ["Halaman Anime Terbaru menampilkan judul yang baru masuk atau baru mendapatkan pembaruan episode. Buka detail judul untuk memeriksa sinopsis, genre, tipe, rating, dan urutan episode sebelum menonton.", "Jika judul yang dicari belum terlihat, periksa lagi setelah jadwal rilisnya atau gunakan pencarian berdasarkan judul alternatif. Data katalog dapat berubah ketika provider memperbarui metadata."] },
      { heading: "Bedakan episode baru dan serial baru", paragraphs: ["Sebagian hasil terbaru adalah serial yang baru mulai tayang, sementara lainnya merupakan serial lama yang baru memperoleh episode. Keduanya berguna untuk kebutuhan berbeda: serial baru cocok untuk mengikuti tren, sedangkan serial lama cocok untuk melanjutkan tontonan yang tertunda.", "Perhatikan label episode dan tanggal pembaruan. Jangan menyimpulkan serial sudah selesai hanya karena daftar episode yang terlihat belum berubah."] },
      { heading: "Tips memilih tontonan dengan cepat", paragraphs: ["Gunakan genre untuk mempersempit pilihan, lalu baca sinopsis singkat agar ekspektasi sesuai. Untuk tontonan mingguan, pilih kategori ongoing. Untuk maraton, lihat kategori completed atau jumlah episode pada halaman anime.", "AniStream mengindeks tautan dari penyedia pihak ketiga dan tidak menyimpan file video. Ketersediaan pemutar dapat berubah; bila satu server bermasalah, coba server lain yang tersedia pada halaman episode."] },
    ],
    faqs: [
      { question: "Apa keyword untuk mencari episode anime terbaru?", answer: "Gunakan kombinasi judul anime, nomor episode, dan frasa seperti sub Indo atau subtitle Indonesia. Halaman detail AniStream menyediakan tautan episode yang lebih terstruktur." },
      { question: "Kapan anime terbaru diperbarui?", answer: "Waktu rilis mengikuti jadwal masing-masing judul dan provider. Periksa halaman terbaru serta jadwal rilis untuk mendapatkan pembaruan paling relevan." },
    ],
  },
  "anime-ongoing-terbaik": {
    title: "Anime Ongoing Terbaik untuk Diikuti Setiap Minggu",
    description: "Cara memilih anime ongoing terbaik berdasarkan genre, sinopsis, rating, dan jadwal episode subtitle Indonesia.",
    intro: "Anime ongoing menawarkan pengalaman mengikuti cerita dari minggu ke minggu. Pilihan terbaik bukan hanya yang sedang populer, tetapi yang sesuai dengan genre, tempo cerita, dan waktu menontonmu.",
    sections: [
      { heading: "Apa itu anime ongoing?", paragraphs: ["Anime ongoing adalah serial yang masih memiliki episode baru dalam jadwal tayang atau belum menyelesaikan seluruh rilisnya. Status ini berbeda dari anime completed yang sudah tidak menunggu episode mingguan pada katalognya.", "Jadwal dapat berubah karena jeda produksi, acara khusus, atau perbedaan waktu rilis. Karena itu, gunakan jadwal sebagai panduan, bukan janji waktu yang mutlak."] },
      { heading: "Cara memilih anime ongoing", paragraphs: ["Pilih berdasarkan genre utama dan tema yang kamu sukai. Action dan adventure biasanya cocok untuk penonton yang menginginkan konflik berkelanjutan; comedy dan romance lebih cocok untuk tontonan ringan; fantasy dan isekai menawarkan dunia cerita yang lebih luas.", "Baca sinopsis dan lihat episode yang tersedia. Jika kamu tidak suka menunggu, simpan judulnya di daftar pribadi atau pilih completed sebagai alternatif."] },
      { heading: "Cara mengikuti episode baru", paragraphs: ["Buka kategori ongoing secara berkala, lalu masuk ke halaman judul yang ingin diikuti. Daftar episode membantu melihat nomor terakhir dan melanjutkan tontonan tanpa kehilangan urutan.", "Gunakan halaman jadwal rilis untuk merencanakan tontonan mingguan. Jika episode belum tersedia, tunggu pembaruan provider dan periksa kembali nanti."] },
    ],
    faqs: [
      { question: "Apa anime ongoing yang paling bagus?", answer: "Pilihan terbaik bergantung pada genre dan preferensi. Bandingkan sinopsis, rating, episode tersedia, dan status pada halaman anime sebelum memilih." },
      { question: "Apakah jadwal anime ongoing selalu tepat?", answer: "Tidak selalu. Jadwal dipengaruhi rilis resmi dan pembaruan provider, sehingga dapat berubah atau mengalami penundaan." },
    ],
  },
  "cara-memilih-anime": {
    title: "Cara Memilih Anime Berdasarkan Genre dan Rating",
    description: "Panduan memilih anime untuk ditonton berdasarkan genre, tipe, rating, sinopsis, dan status episode.",
    intro: "Katalog anime sangat luas sehingga memilih tontonan bisa memakan waktu. Dengan menyaring genre, tipe, rating, dan status episode secara berurutan, kamu dapat menemukan judul yang lebih sesuai tanpa membuka banyak halaman.",
    sections: [
      { heading: "Pilih genre dan suasana tontonan", paragraphs: ["Genre adalah penyaring pertama yang paling praktis. Action dan adventure cocok untuk cerita penuh konflik, comedy untuk tontonan santai, drama dan romance untuk fokus pada hubungan karakter, sedangkan fantasy dan isekai menawarkan latar dunia yang berbeda.", "Banyak anime memiliki lebih dari satu genre. Baca sinopsis agar kombinasi genre tersebut benar-benar sesuai dengan yang dicari."] },
      { heading: "Periksa tipe dan status anime", paragraphs: ["Tipe TV series, movie, OVA, ONA, dan special memiliki durasi serta pola rilis berbeda. Pilih movie atau special jika ingin tontonan lebih singkat; pilih TV series jika ingin mengikuti cerita lebih panjang.", "Status ongoing cocok untuk episode mingguan, sedangkan completed lebih nyaman untuk binge-watch. Informasi ini membantu mengatur ekspektasi sebelum mulai menonton."] },
      { heading: "Gunakan rating sebagai sinyal, bukan satu-satunya patokan", paragraphs: ["Rating dapat membantu menyusun prioritas, tetapi bukan ukuran mutlak kualitas. Cocokkan rating dengan sinopsis, genre, jumlah episode, dan ulasan pribadi agar pilihan tidak hanya mengikuti angka.", "Setelah menemukan judul yang cocok, buka halaman anime untuk melihat daftar episode, metadata, dan tautan terkait. Simpan judul favorit agar mudah dilanjutkan."] },
    ],
    faqs: [
      { question: "Genre anime apa yang paling populer?", answer: "Action, adventure, comedy, drama, fantasy, romance, dan isekai biasanya memiliki permintaan luas. Minat dapat berubah mengikuti musim dan judul yang sedang tayang." },
      { question: "Apakah rating tinggi menjamin anime bagus?", answer: "Tidak. Rating adalah sinyal tambahan. Selalu cocokkan dengan genre, sinopsis, tipe, dan preferensi pribadi." },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) return { title: "Panduan tidak ditemukan", robots: { index: false, follow: true } };
  const canonical = `${SITE_URL}/panduan/${encodeURIComponent(slug)}`;
  return { title: guide.title, description: guide.description, alternates: { canonical }, openGraph: { type: "article", title: guide.title, description: guide.description, url: canonical } };
}

export default async function GuideArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) notFound();
  const canonical = `${SITE_URL}/panduan/${encodeURIComponent(slug)}`;
  const publishedAt = "2026-11-10";
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "@id": `${canonical}#article`, headline: guide.title, description: guide.description, url: canonical, datePublished: publishedAt, dateModified: publishedAt, inLanguage: "id-ID", author: { "@type": "Organization", name: "AniStream", url: SITE_URL }, publisher: { "@id": `${SITE_URL}/#organization` }, mainEntityOfPage: { "@type": "WebPage", "@id": canonical } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: guide.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };

  return <main className="min-h-screen bg-black px-4 pb-16 pt-24 text-white md:px-12"><JsonLd data={articleSchema} /><JsonLd data={faqSchema} /><article className="mx-auto max-w-3xl"><nav aria-label="Breadcrumb" className="text-sm text-gray-400"><Link href="/" className="hover:text-red-300">Beranda</Link> / <Link href="/panduan" className="hover:text-red-300">Panduan</Link> / {guide.title}</nav><header className="mt-6"><p className="text-sm font-semibold uppercase tracking-wide text-red-400">Panduan AniStream</p><h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">{guide.title}</h1><p className="mt-5 text-lg leading-8 text-gray-300">{guide.intro}</p></header><div className="mt-10 space-y-9">{guide.sections.map((section) => <section key={section.heading}><h2 className="text-2xl font-semibold">{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-8 text-gray-300">{paragraph}</p>)}</section>)}</div><section className="mt-10" aria-labelledby="pertanyaan"><h2 id="pertanyaan" className="text-2xl font-semibold">Pertanyaan yang sering dicari</h2><div className="mt-4 space-y-4">{guide.faqs.map((faq) => <details key={faq.question} className="rounded-lg border border-gray-800 bg-gray-900 p-4"><summary className="cursor-pointer font-semibold">{faq.question}</summary><p className="mt-3 leading-7 text-gray-300">{faq.answer}</p></details>)}</div></section><nav aria-label="Tautan anime" className="mt-10 flex flex-wrap gap-4 border-t border-gray-800 pt-6 text-red-400"><Link href="/latest">Anime terbaru</Link><Link href="/category/ongoing">Anime ongoing</Link><Link href="/genres">Genre anime</Link><Link href="/schedule">Jadwal rilis</Link></nav></article></main>;
}
