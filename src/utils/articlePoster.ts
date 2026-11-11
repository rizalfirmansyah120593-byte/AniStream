import { API_URL } from "@/utils/config";
import type { PublishedArticle } from "@/utils/articleStore";

function validPosterUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function resolveArticlePoster(article: PublishedArticle): Promise<PublishedArticle> {
  const savedPoster = validPosterUrl(article.posterUrl);
  if (savedPoster) return { ...article, posterUrl: savedPoster };

  try {
    const response = await fetch(`${API_URL}/detail-anime/${encodeURIComponent(article.animeSlug)}`, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 86400 },
    });
    if (!response.ok) return { ...article, posterUrl: null };
    const payload = await response.json();
    const anime = payload?.data || payload;
    return { ...article, posterUrl: validPosterUrl(anime?.img || anime?.poster) };
  } catch {
    return { ...article, posterUrl: null };
  }
}
