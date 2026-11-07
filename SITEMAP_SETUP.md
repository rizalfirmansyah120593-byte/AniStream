# Sitemap

Aplikasi Next.js menyajikan `https://anistreaming.com/sitemap.xml` melalui `src/app/sitemap.ts`. Rute ini dibuat dinamis agar API katalog tidak dipanggil saat build/deploy. Permintaan katalog memiliki timeout dan batas total waktu; jika API tidak tersedia, sitemap tetap memuat halaman statis.

`SITE_URL` dan `NEXT_PUBLIC_API_URL` dapat disetel pada environment aplikasi. Jangan menambahkan rewrite Apache/PHP untuk `/sitemap.xml`; URL tersebut sudah dimiliki oleh rute Next.js. Skrip PHP lama telah dihapus karena tidak digunakan oleh aplikasi Node.js.

Submit URL sitemap ke Google Search Console dan Bing Webmaster Tools. Hindari memasukkan URL yang memerlukan login, duplikat, atau diblokir oleh robots/noindex.
