import InfoPage from "@/components/InfoPage";

export default function FAQPage() {
  return (
    <InfoPage
      title="FAQ"
      description="Jawaban atas pertanyaan umum tentang AniStream."
      sections={[
        { title: "Apakah AniStream menyimpan video?", content: "Tidak. AniStream tidak mengunggah atau menyimpan file video. Kami hanya mengindeks tautan dari penyedia pihak ketiga." },
        { title: "Bagaimana cara menonton anime?", content: "Pilih anime dari halaman Home, Latest, Popular, atau Type, kemudian pilih episode dan server video yang tersedia." },
        { title: "Video tidak dapat diputar", content: "Coba server lain, muat ulang halaman, atau periksa kembali beberapa saat kemudian karena ketersediaan server dapat berubah." },
      ]}
    />
  );
}
