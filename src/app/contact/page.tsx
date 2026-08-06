import InfoPage from "@/components/InfoPage";

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact Us"
      description="Hubungi tim AniStream untuk pertanyaan, masukan, atau laporan terkait konten."
      sections={[
        { title: "Bantuan dan masukan", content: "Sampaikan detail masalah, judul anime, dan episode yang terkait agar kami dapat membantu dengan lebih cepat." },
        { title: "Laporan hak cipta", content: "Jika Anda adalah pemilik hak cipta dan menemukan konten yang perlu ditinjau, kirimkan laporan lengkap melalui kanal kontak resmi AniStream." },
        { title: "Catatan", content: "AniStream tidak meng-host file video. Untuk masalah pada pemutar atau tautan pihak ketiga, sertakan URL halaman dan pesan error yang muncul." },
      ]}
    />
  );
}
