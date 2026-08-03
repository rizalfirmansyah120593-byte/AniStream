import type { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/utils/config";

type Anime = { slug?: string; link?: string; detail_url?: string };

function slugOf(anime: Anime) {
  if (anime.slug) return anime.slug;
  const raw = anime.detail_url || anime.link || "";
  return raw.split("?")[0].split("/").filter(Boolean).pop() || "";
}

async function getAnimeUrls() {
  try {
    const response = await fetch(`${API_URL}/new-anime`, { next: { revalidate: 3600 } });
    const json = await response.json();
    const list: Anime[] = json?.data || [];
    return list.map(slugOf).filter(Boolean);
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const anime = await getAnimeUrls();
  const routes = ["", "/latest", "/popular", "/schedule", "/genres", "/type", "/category/ongoing", "/category/completed"];
  return [
    ...routes.map(path => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: "daily" as const, priority: path === "" ? 1 : 0.7 })),
    ...anime.map(slug => ({ url: `${SITE_URL}/anime/${encodeURIComponent(slug)}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}
