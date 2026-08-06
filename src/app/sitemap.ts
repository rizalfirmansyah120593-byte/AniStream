import type { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/utils/config";

type Anime = { slug?: string; link?: string; detail_url?: string };

type PaginatedResponse = {
  data?: Anime[];
  current_page?: number;
  total_page?: number;
};

// Keep sitemap generation bounded. A sitemap should never make a deployment
// depend on an external API responding indefinitely.
export const revalidate = 3600;

const API_REQUEST_TIMEOUT_MS = 5000;
const GENERATION_TIMEOUT_MS = 15000;
const MAX_PAGES_PER_ENDPOINT = 100;
const PAGE_CONCURRENCY = 6;
const CATALOG_ENDPOINTS = ["/new-anime", "/order-anime/latest-added"];
const STATIC_ROUTES = [
  "",
  "/latest",
  "/popular",
  "/schedule",
  "/genres",
  "/type",
  "/type/tv",
  "/type/ova",
  "/type/ona",
  "/type/special",
  "/type/movie",
  "/category/ongoing",
  "/category/completed",
  "/anime/one-piece",
  "/faq",
  "/contact",
  "/terms",
  "/privacy",
];

function normalizeSlug(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

function slugOf(anime: Anime) {
  if (anime.slug) return normalizeSlug(anime.slug);
  const raw = anime.detail_url || anime.link || "";
  return normalizeSlug(raw.split("?")[0].split("/").filter(Boolean).pop() || "");
}

function addSlugs(page: PaginatedResponse | null, slugs: Set<string>) {
  for (const anime of page?.data || []) {
    const slug = slugOf(anime);
    if (slug) slugs.add(slug);
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
      next: { revalidate },
    });

    if (!response.ok) return null;
    return (await response.json()) as PaginatedResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchRemainingPages(
  endpoint: string,
  totalPages: number,
  deadline: number,
  slugs: Set<string>,
) {
  let nextPage = 2;

  async function worker() {
    while (nextPage <= totalPages && Date.now() < deadline) {
      const page = nextPage++;
      addSlugs(await fetchPage(endpoint, page, deadline), slugs);
    }
  }

  const workerCount = Math.min(PAGE_CONCURRENCY, Math.max(totalPages - 1, 0));
  await Promise.all(Array.from({ length: workerCount }, worker));
}

async function getAnimeUrls() {
  const deadline = Date.now() + GENERATION_TIMEOUT_MS;
  const slugs = new Set<string>();

  // Fetch both catalog heads at once. If either endpoint is unavailable, the
  // other one can still contribute URLs to the sitemap.
  const firstPages = await Promise.all(
    CATALOG_ENDPOINTS.map(endpoint => fetchPage(endpoint, 1, deadline)),
  );

  await Promise.all(
    CATALOG_ENDPOINTS.map(async (endpoint, index) => {
      const first = firstPages[index];
      addSlugs(first, slugs);
      if (!first) return;

      // Bound malformed/very large API responses. The time budget remains the
      // final guard against a slow API or an unexpectedly large catalogue.
      const totalPages = Math.min(
        Math.max(Number(first.total_page) || 1, 1),
        MAX_PAGES_PER_ENDPOINT,
      );
      await fetchRemainingPages(endpoint, totalPages, deadline, slugs);
    }),
  );

  return [...slugs];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const anime = await getAnimeUrls();
  const entries = [
    ...STATIC_ROUTES.map(path => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: "daily" as const, priority: path === "" ? 1 : 0.7 })),
    ...anime.map(slug => ({ url: `${SITE_URL}/anime/${encodeURIComponent(slug)}`, lastModified: now, changeFrequency: "daily" as const, priority: slug === "one-piece" ? 0.95 : 0.8 })),
  ];

  // Defensive deduplication keeps the sitemap valid when an anime appears in
  // both catalog endpoints.
  return [...new Map(entries.map(entry => [entry.url, entry])).values()];
}
