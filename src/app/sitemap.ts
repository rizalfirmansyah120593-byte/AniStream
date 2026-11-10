import type { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/utils/config";
import { getPublishedArticles } from "@/utils/articleStore";

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
const API_REQUEST_TIMEOUT_MS = 6000;
const MAX_SITEMAP_URLS = 50000;
const CATALOG_ENDPOINT = "/new-anime";
const PAGES_PER_SITEMAP = 4;
const FALLBACK_TOTAL_PAGES = 1;
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
  { path: "/artikel", priority: 0.5, changeFrequency: "daily" as const },
  { path: "/panduan", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/panduan/anime-terbaru-sub-indo", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/panduan/anime-ongoing-terbaik", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/panduan/cara-memilih-anime", priority: 0.7, changeFrequency: "weekly" as const },
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

async function getAnimeUrls(pageStart: number, pageEnd: number) {
  const slugs = new Set<string>();
  const modified = new Map<string, Date>();
  const deadline = Date.now() + 30000;

  // Fetch small batches to avoid overwhelming the upstream API while still
  // covering every page assigned to this sitemap document.
  for (let batchStart = pageStart; batchStart <= pageEnd; batchStart += 4) {
    const batchEnd = Math.min(batchStart + 3, pageEnd);
    const pages = await Promise.all(
      Array.from({ length: batchEnd - batchStart + 1 }, (_, index) =>
        fetchPage(CATALOG_ENDPOINT, batchStart + index, deadline),
      ),
    );
    pages.forEach(page => addSlugs(page, slugs, modified));
    if (Date.now() >= deadline) break;
  }

  return { slugs: [...slugs], modified };
}

async function getCatalogPageCount() {
  const page = await fetchPage(CATALOG_ENDPOINT, 1, Date.now() + API_REQUEST_TIMEOUT_MS);
  return Math.max(FALLBACK_TOTAL_PAGES, Number(page?.total_page) || FALLBACK_TOTAL_PAGES);
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

export async function generateSitemaps() {
  const totalPages = await getCatalogPageCount();
  const sitemapCount = Math.ceil(totalPages / PAGES_PER_SITEMAP);
  return Array.from({ length: sitemapCount }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const sitemapId = Number(id) || 0;
  const pageStart = sitemapId * PAGES_PER_SITEMAP + 1;
  const pageEnd = pageStart + PAGES_PER_SITEMAP - 1;
  const now = new Date();
  const [{ slugs, modified }, collectionUrls, articles] = await Promise.all([
    getAnimeUrls(pageStart, pageEnd),
    sitemapId === 0 ? getCollectionUrls(Date.now() + API_REQUEST_TIMEOUT_MS + 1000) : Promise.resolve([]),
    sitemapId === 0 ? getPublishedArticles(100).catch(() => []) : Promise.resolve([]),
  ]);
  const entries = [
    ...(sitemapId === 0 ? STATIC_ROUTES.map(route => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      priority: route.priority,
      changeFrequency: route.changeFrequency,
    })) : []),
    ...slugs.map(slug => ({
      url: `${SITE_URL}/anime/${encodeURIComponent(slug)}`,
      lastModified: modified.get(slug) ?? now,
      priority: 0.8,
      changeFrequency: "daily" as const,
    })),
    ...collectionUrls,
    ...articles.map(article => ({
      url: `${SITE_URL}/artikel/${encodeURIComponent(article.slug)}`,
      lastModified: new Date(article.publishedAt),
      priority: 0.6,
      changeFrequency: "monthly" as const,
    })),
  ];

  // Deduplicate overlapping catalog results and stay within protocol limits.
  return [...new Map(entries.map(entry => [entry.url, entry])).values()].slice(0, MAX_SITEMAP_URLS);
}
