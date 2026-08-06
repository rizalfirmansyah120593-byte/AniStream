import InfoPage from "@/components/InfoPage";

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Service"
      description="Ketentuan penggunaan AniStream."
      sections={[
        { title: "Penggunaan layanan", content: "Gunakan AniStream secara legal dan bertanggung jawab. Anda tidak boleh menyalahgunakan layanan, mencoba mengganggu sistem, atau menggunakan situs untuk aktivitas ilegal." },
        { title: "Konten pihak ketiga", content: "AniStream mengindeks konten dan tautan dari pihak ketiga. Kami tidak menjamin ketersediaan, keakuratan, atau kualitas konten tersebut." },
        { title: "Perubahan layanan", content: "Kami dapat memperbarui, mengubah, atau menghentikan bagian layanan sewaktu-waktu untuk pemeliharaan dan peningkatan pengalaman pengguna." },
      ]}
    />
  );
}
