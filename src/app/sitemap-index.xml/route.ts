import { API_URL, SITE_URL } from "@/utils/config";

const PAGES_PER_SITEMAP = 4;

export async function GET() {
  let totalPages = 1;

  try {
    const response = await fetch(`${API_URL}/new-anime?page=1`, {
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const payload = await response.json();
      totalPages = Math.max(1, Number(payload?.total_page) || 1);
    }
  } catch {
    // Keep the first sitemap available if the catalog API is temporarily down.
  }

  const sitemapCount = Math.ceil(totalPages / PAGES_PER_SITEMAP);
  const entries = Array.from({ length: sitemapCount }, (_, id) =>
    `  <sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc></sitemap>`,
  ).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
