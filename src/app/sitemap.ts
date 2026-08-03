import type { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/utils/config";

type Anime = { slug?: string; link?: string; detail_url?: string };

type PaginatedResponse = {
  data?: Anime[];
  current_page?: number;
  total_page?: number;
};

function slugOf(anime: Anime) {
  if (anime.slug) return anime.slug;
  const raw = anime.detail_url || anime.link || "";
  return raw.split("?")[0].split("/").filter(Boolean).pop() || "";
}

async function getAnimeUrls() {
  // /new-anime tanpa page hanya mengembalikan halaman pertama (saat ini 24 item).
  // Ambil semua halaman agar sitemap tidak kehilangan katalog lama.
  const endpoints = ["/new-anime", "/order-anime/latest-added"];
  const slugs = new Set<string>();

  for (const endpoint of endpoints) {
    try {
      const firstResponse = await fetch(`${API_URL}${endpoint}?page=1`, {
        next: { revalidate: 3600 },
      });
      if (!firstResponse.ok) continue;

      const first: PaginatedResponse = await firstResponse.json();
      const totalPages = Math.min(Math.max(first.total_page || 1, 1), 1000);
      const pages = [first];

      for (let page = 2; page <= totalPages; page++) {
        const response = await fetch(`${API_URL}${endpoint}?page=${page}`, {
          next: { revalidate: 3600 },
        });
        if (!response.ok) break;
        pages.push(await response.json());
      }

      for (const page of pages) {
        for (const anime of page.data || []) {
          const slug = slugOf(anime);
          if (slug) slugs.add(slug);
        }
      }
    } catch {
      // Sitemap tetap dapat dibuat jika salah satu endpoint sedang bermasalah.
    }
  }

  return [...slugs];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const anime = await getAnimeUrls();
  const routes = ["", "/latest", "/popular", "/schedule", "/genres", "/type", "/category/ongoing", "/category/completed"];
  const entries = [
    ...routes.map(path => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: "daily" as const, priority: path === "" ? 1 : 0.7 })),
    ...anime.map(slug => ({ url: `${SITE_URL}/anime/${encodeURIComponent(slug)}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
  ];

  // Defensive deduplication keeps the sitemap valid when an anime appears in
  // both catalog endpoints.
  return [...new Map(entries.map(entry => [entry.url, entry])).values()];
}
