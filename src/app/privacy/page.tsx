import InfoPage from "@/components/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      description="Kebijakan privasi AniStream dan cara kami menangani informasi pengguna."
      sections={[
        { title: "Informasi yang dikumpulkan", content: "AniStream berupaya mengumpulkan informasi seminimal mungkin. Data teknis seperti browser, perangkat, dan log akses dapat diproses untuk keamanan serta peningkatan layanan." },
        { title: "Penyimpanan lokal", content: "Fitur seperti My List dan preferensi tertentu dapat disimpan di perangkat Anda melalui penyimpanan lokal browser dan tidak otomatis dikirim ke AniStream." },
        { title: "Layanan pihak ketiga", content: "Tautan atau pemutar dari pihak ketiga dapat memiliki kebijakan privasi sendiri. Tinjau kebijakan mereka sebelum menggunakan layanan tersebut." },
      ]}
    />
  );
}
