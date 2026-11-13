import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/utils/articleStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limitValue = new URL(request.url).searchParams.get("limit");
  const limit = Number.isFinite(Number(limitValue)) ? Number(limitValue) : 20;
  const articles = await getPublishedArticles(limit);
  return NextResponse.json({
    items: articles.map(article => ({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      published_at: article.publishedAt,
      poster_url: article.posterUrl,
    })),
  }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
