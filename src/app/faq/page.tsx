import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { JsonLd } from "@/components/Seo/JsonLd";
import { SITE_URL } from "@/utils/config";

export const metadata: Metadata = {
  title: "FAQ AniStream",
  description: "Jawaban tentang cara menonton anime, ketersediaan server, dan fitur AniStream.",
  alternates: { canonical: `${SITE_URL}/faq` },
};

export default function FAQPage() {
  const questions = [
    { name: "Apakah AniStream menyimpan video?", answer: "Tidak. AniStream tidak mengunggah atau menyimpan file video. Kami hanya mengindeks tautan dari penyedia pihak ketiga." },
    { name: "Bagaimana cara menonton anime?", answer: "Pilih anime dari halaman Home, Latest, Popular, atau Type, kemudian pilih episode dan server video yang tersedia." },
    { name: "Video tidak dapat diputar", answer: "Coba server lain, muat ulang halaman, atau periksa kembali beberapa saat kemudian karena ketersediaan server dapat berubah." },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "url": `${SITE_URL}/faq`,
    mainEntity: questions.map((question) => ({
      "@type": "Question",
      name: question.name,
      acceptedAnswer: { "@type": "Answer", text: question.answer },
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <InfoPage
      title="FAQ"
      description="Jawaban atas pertanyaan umum tentang AniStream."
      sections={questions.map(({ name, answer }) => ({ title: name, content: answer }))}
    />
    </>
  );
}
