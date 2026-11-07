import type { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/utils/config";

type Anime = {
  slug?: string;
  link?: string;
  detail_url?: string;
  updated_at?: string;
  updatedAt?: string;
  last_modified?: string;
};

type PaginatedResponse = {
  data?: Anime[];
  current_page?: number;
  total_page?: number;
};

// Sitemap data is resolved on request so external API latency cannot fail a build.
export const dynamic = "force-dynamic";

const API_CACHE_SECONDS = 3600;
const API_REQUEST_TIMEOUT_MS = 3000;
const GENERATION_TIMEOUT_MS = 4000;
const MAX_SITEMAP_URLS = 50000;
const CATALOG_ENDPOINTS = ["/new-anime", "/order-anime/latest-added"];
const STATIC_ROUTES = [
  { path: "", priority: 1, changeFrequency: "daily" as const },
  { path: "/latest", priority: 0.8, changeFrequency: "hourly" as const },
  { path: "/popular", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/schedule", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/genres", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/type", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/type/tv", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/type/ova", priority: 0.5, changeFrequency: "weekly" as const },
  { path: "/type/ona", priority: 0.5, changeFrequency: "weekly" as const },
  { path: "/type/special", priority: 0.5, changeFrequency: "weekly" as const },
  { path: "/type/movie", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/category/ongoing", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/category/completed", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/faq", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/contact", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.1, changeFrequency: "yearly" as const },
  { path: "/privacy", priority: 0.1, changeFrequency: "yearly" as const },
  { path: "/dmca", priority: 0.2, changeFrequency: "yearly" as const },
];

function normalizeSlug(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

function slugOf(anime: Anime) {
  if (anime.slug) return normalizeSlug(anime.slug);
  const raw = anime.detail_url || anime.link || "";
  return normalizeSlug(raw.split("?")[0].split("/").filter(Boolean).pop() || "");
}

function addSlugs(page: PaginatedResponse | null, slugs: Set<string>, modified: Map<string, Date>) {
  for (const anime of page?.data || []) {
    const slug = slugOf(anime);
    if (!slug) continue;
    slugs.add(slug);
    const rawDate = anime.updated_at || anime.updatedAt || anime.last_modified;
    const date = rawDate ? new Date(rawDate) : null;
    if (date && !Number.isNaN(date.getTime())) modified.set(slug, date);
  }
}

async function fetchPage(endpoint: string, page: number, deadline: number) {
  const remaining = deadline - Date.now();
  if (remaining <= 0) return null;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Math.min(API_REQUEST_TIMEOUT_MS, remaining),
  );

  try {
    const response = await fetch(`${API_URL}${endpoint}?page=${page}`, {
      signal: controller.signal,
      // Next caches successful API responses, so ISR does not hit the API on
      // every request after the sitemap has been generated.
      next: { revalidate: API_CACHE_SECONDS },
    });

    if (!response.ok) return null;
    return (await response.json()) as PaginatedResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAnimeUrls(deadline: number) {
  const slugs = new Set<string>();
  const modified = new Map<string, Date>();

  // Include the first page from each feed; pagination and episode expansion
  // would make each sitemap request unbounded on a large catalog.
  const firstPages = await Promise.all(
    CATALOG_ENDPOINTS.map(endpoint => fetchPage(endpoint, 1, deadline)),
  );
  firstPages.forEach(page => addSlugs(page, slugs, modified));

  return { slugs: [...slugs], modified };
}

async function getCollectionUrls(deadline: number) {
  const urls: Array<{ url: string; lastModified: Date; priority: number; changeFrequency: "daily" | "weekly" }> = [];
  const remaining = deadline - Date.now();

  if (remaining > 0) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Math.min(API_REQUEST_TIMEOUT_MS, remaining),
    );

    try {
      const response = await fetch(`${API_URL}/genres`, {
        signal: controller.signal,
        next: { revalidate: API_CACHE_SECONDS },
      });
      if (response.ok) {
        const json = await response.json();
        for (const genre of json?.data || []) {
          const slug = normalizeSlug(String(genre.id || genre.slug || ""));
          if (!slug) continue;
          urls.push({ url: `${SITE_URL}/genres/${encodeURIComponent(slug)}`, lastModified: new Date(), priority: 0.6, changeFrequency: "daily" });
        }
      }
    } catch {
      // Static URLs remain available when the catalogue API cannot be reached.
    } finally {
      clearTimeout(timeout);
    }
  }

  for (const type of ["tv", "ova", "ona", "special", "movie"]) {
    urls.push({ url: `${SITE_URL}/type/${type}`, lastModified: new Date(), priority: 0.5, changeFrequency: "weekly" });
  }
  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const deadline = Date.now() + GENERATION_TIMEOUT_MS;
  const [{ slugs, modified }, collectionUrls] = await Promise.all([
    getAnimeUrls(deadline),
    getCollectionUrls(deadline),
  ]);
  const entries = [
    ...STATIC_ROUTES.map(route => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      priority: route.priority,
      changeFrequency: route.changeFrequency,
    })),
    ...slugs.map(slug => ({
      url: `${SITE_URL}/anime/${encodeURIComponent(slug)}`,
      lastModified: modified.get(slug) ?? now,
      priority: 0.8,
      changeFrequency: "daily" as const,
    })),
    ...collectionUrls,
  ];

  // Deduplicate overlapping catalogs and stay within the sitemap protocol's
  // 50,000-URL limit.
  return [...new Map(entries.map(entry => [entry.url, entry])).values()].slice(0, MAX_SITEMAP_URLS);
}
