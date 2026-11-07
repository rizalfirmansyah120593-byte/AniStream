import { API_URL, SITE_URL } from "@/utils/config";
import { parseTrendFeed } from "@/utils/trendsFeed";
import {
  beginArticleRun,
  finishArticleRun,
  hasArticleForTrend,
  saveArticle,
  type ArticleSection,
  type ArticleSource,
  type PublishedArticle,
} from "@/utils/articleStore";

type CatalogEntry = {
  title?: string;
  link?: string;
  detail_url?: string;
  slug?: string;
  episode?: string | number;
  released?: string;
};

type AnimeFacts = {
  title: string;
  genres: string[];
  season: string;
  type: string;
  year: string;
  status: string;
  studio: string;
  rating: string;
  totalEpisodes: string;
  latestEpisode: string;
};

type ArticleDraft = {
  title: string;
  excerpt: string;
  sections: ArticleSection[];
};

const TRENDS_URL = "https://trends.google.com/trending/rss?geo=ID";
const MAX_ARTICLE_CHARS = 8000;
const MIN_ARTICLE_CHARS = 1600;

function slugFromEntry(entry: CatalogEntry) {
  const raw = entry.slug || entry.detail_url || entry.link || "";
  return raw.split("?")[0].split("/").filter(Boolean).pop() || "";
}

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function tokens(value: string) {
  return new Set(normalize(value).split(/\s+/).filter(token => token.length > 1 && !/^s\d+$/.test(token)));
}

function trendMatchScore(query: string, title: string) {
  const queryTokens = tokens(query);
  const titleTokens = tokens(title);
  if (queryTokens.size < 2 || titleTokens.size < 2) return 0;
  const overlap = [...queryTokens].filter(token => titleTokens.has(token)).length;
  return Math.min(overlap / queryTokens.size, overlap / titleTokens.size);
}

function slugify(value: string) {
  return normalize(value).replace(/\s+/g, "-").replace(/^-+|-+$/g, "").slice(0, 150);
}

function normalizeGenres(genres: unknown): string[] {
  if (!Array.isArray(genres)) return [];
  return genres
    .map(genre => typeof genre === "string" ? genre : genre?.tag || genre?.title || genre?.name || "")
    .map(value => String(value).trim())
    .filter(Boolean)
    .slice(0, 8);
}

async function fetchJson(url: string, timeoutMs = 5000) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  if (!response.ok) throw new Error(`Source request failed (${response.status})`);
  return response.json();
}

async function getTrendingAnime() {
  const [feedResult, newResult, popularResult] = await Promise.allSettled([
    fetch(TRENDS_URL, { signal: AbortSignal.timeout(6000), cache: "no-store" }),
    fetchJson(`${API_URL}/new-anime?page=1`),
    fetchJson(`${API_URL}/order-anime/popular?page=1`),
  ]);
  if (feedResult.status !== "fulfilled" || !feedResult.value.ok) {
    throw new Error(`Google Trends RSS is unavailable${feedResult.status === "fulfilled" ? ` (${feedResult.value.status})` : ""}`);
  }
  const xml = await feedResult.value.text();
  const trendItems = parseTrendFeed(xml);
  const catalogEntries = [
    ...(newResult.status === "fulfilled" ? newResult.value?.data || [] : []),
    ...(popularResult.status === "fulfilled" ? popularResult.value?.data || [] : []),
  ] as CatalogEntry[];
  if (!catalogEntries.length) throw new Error("Anime catalog is unavailable");
  const candidates = trendItems.flatMap(trend => {
    const match = catalogEntries
      .map(entry => ({ entry, score: trendMatchScore(trend.query, String(entry.title || "")) }))
      .filter(candidate => candidate.score >= 0.7)
      .sort((a, b) => b.score - a.score)[0];
    if (!match) return [];
    const animeSlug = slugFromEntry(match.entry);
    return animeSlug ? [{ trend, animeSlug, catalogTitle: String(match.entry.title || "") }] : [];
  });

  return candidates.sort((a, b) => Number(b.trend.traffic.replace(/[^\d]/g, "")) - Number(a.trend.traffic.replace(/[^\d]/g, "")));
}

async function getAnimeFacts(slug: string): Promise<AnimeFacts> {
  const payload = await fetchJson(`${API_URL}/detail-anime/${encodeURIComponent(slug)}`);
  const anime = payload?.data || payload;
  const episodes = Array.isArray(anime.episodes) ? anime.episodes : [];
  const latestEpisode = episodes
    .map((episode: { episode?: string | number }) => String(episode.episode ?? ""))
    .filter(Boolean)
    .sort((a: string, b: string) => Number(b) - Number(a))[0] || "";
  const rating = String(anime.rating || "").trim();
  const genres = normalizeGenres(anime.genres);
  const totalEpisodes = String(anime.total_episode || episodes.length || "").trim();
  const season = String(anime.season || "").trim();
  const type = String(anime.type || "").trim();
  const year = String(anime.year || anime.released || "").trim();
  const status = String(anime.status || "").trim();
  const studio = String(anime.studio || (Array.isArray(anime.studios) ? anime.studios.join(", ") : "") || "").trim();
  const knownFactCount = [genres.length > 0, rating.length > 0, totalEpisodes.length > 0, season.length > 0, type.length > 0, year.length > 0, status.length > 0, studio.length > 0].filter(Boolean).length;
  const title = String(anime.title || "").trim();

  if (!title || knownFactCount < 3) throw new Error("Anime metadata does not meet the publication quality threshold");
  return { title, genres, season, type, year, status, studio, rating, totalEpisodes, latestEpisode };
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "excerpt", "sections"],
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    sections: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "paragraphs"],
        properties: {
          heading: { type: "string" },
          paragraphs: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" } },
        },
      },
    },
  },
};

function parseDraft(value: string): ArticleDraft {
  const draft = JSON.parse(value) as ArticleDraft;
  if (typeof draft.title !== "string" || draft.title.trim().length < 20 || draft.title.length > 180) {
    throw new Error("Generated article title failed validation");
  }
  if (typeof draft.excerpt !== "string" || draft.excerpt.trim().length < 80 || draft.excerpt.length > 320) {
    throw new Error("Generated article excerpt failed validation");
  }
  if (!Array.isArray(draft.sections) || draft.sections.length < 4 || draft.sections.length > 6) {
    throw new Error("Generated article sections failed validation");
  }

  const cleanedSections = draft.sections.map(section => ({
    heading: String(section.heading || "").trim().slice(0, 100),
    paragraphs: Array.isArray(section.paragraphs)
      ? section.paragraphs.map(paragraph => String(paragraph).trim()).filter(Boolean).slice(0, 3)
      : [],
  }));
  const contentLength = cleanedSections.reduce((length, section) =>
    length + section.heading.length + section.paragraphs.join(" ").length, 0);
  if (cleanedSections.some(section => section.heading.length < 5 || section.paragraphs.length < 2 || section.paragraphs.some(paragraph => paragraph.length < 70 || paragraph.length > 1200))) {
    throw new Error("Generated article paragraphs failed validation");
  }
  if (contentLength < MIN_ARTICLE_CHARS || contentLength > MAX_ARTICLE_CHARS) {
    throw new Error("Generated article length failed validation");
  }
  return { title: draft.title.trim(), excerpt: draft.excerpt.trim(), sections: cleanedSections };
}

function extractOutputText(response: { output?: Array<{ content?: Array<{ type?: string; text?: string; annotations?: Array<Record<string, unknown>> }> }> }) {
  const contents = (response.output || []).flatMap(item => item.content || []);
  const text = contents.find(content => content.type === "output_text")?.text;
  if (!text) throw new Error("OpenAI returned no article text");
  const citations = contents.flatMap(content => content.annotations || [])
    .filter((annotation): annotation is Record<string, unknown> => annotation.type === "url_citation");
  return { text, citations };
}

async function generateDraft(query: string, traffic: string, facts: AnimeFacts, animeSlug: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_ARTICLE_MODEL || "gpt-6-astra",
      tools: [{ type: "web_search" }],
      max_output_tokens: 2400,
      text: {
        format: {
          type: "json_schema",
          name: "anistream_trend_article",
          strict: true,
          schema: responseSchema,
        },
      },
      instructions: [
        "Tulis artikel orisinal berbahasa Indonesia untuk pembaca AniStream, bukan halaman SEO doorway.",
        "Gunakan web search untuk memverifikasi konteks tren terkini dan fakta anime. Utamakan sumber resmi/primer.",
        "Data Google Trends hanya menunjukkan pencarian yang sedang naik; jangan menyebutnya bukti popularitas umum atau mengarang alasan tren.",
        "Fakta anime yang diizinkan hanya data katalog yang diberikan. Jangan menyalin atau merekonstruksi sinopsis, dialog, lirik, atau artikel sumber.",
        "Jangan menebak tanggal tayang, plot, pemeran, studio, ketersediaan streaming, atau angka pencarian yang tidak tercantum pada sumber.",
        "Buat 4-6 bagian yang benar-benar membantu pembaca memahami tren, konteks yang dapat diverifikasi, dan informasi katalog. Hindari pengulangan kata kunci.",
        "Jangan sertakan URL atau daftar sumber dalam teks; tautan sitasi terverifikasi akan ditampilkan terpisah.",
      ].join(" "),
      input: JSON.stringify({
        trendQuery: query,
        approximateTrendTraffic: traffic,
        animeFacts: facts,
        trendsSource: TRENDS_URL,
        animePage: `${SITE_URL}/anime/${encodeURIComponent(animeSlug)}`,
      }),
    }),
    signal: AbortSignal.timeout(90000),
  });
  if (!response.ok) throw new Error(`OpenAI Responses API returned ${response.status}`);
  const result = await response.json();
  const output = extractOutputText(result);
  const draft = parseDraft(output.text);
  const citations: ArticleSource[] = [];
  const seenUrls = new Set<string>();
  for (const annotation of output.citations) {
    const url = String(annotation.url || "");
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" || seenUrls.has(parsed.href)) continue;
      seenUrls.add(parsed.href);
      citations.push({ title: String(annotation.title || parsed.hostname).slice(0, 200), url: parsed.href });
    } catch {
      continue;
    }
  }
  const citedHosts = new Set(citations.map(source => new URL(source.url).hostname.replace(/^www\./, "")));
  if (citedHosts.size < 2) throw new Error("Article requires citations from at least two independent web sources");

  return { draft, citations };
}

function makeSlotKey(date = new Date()) {
  const slotHour = Math.floor(date.getUTCHours() / 2) * 2;
  return `${date.toISOString().slice(0, 10)}-${String(slotHour).padStart(2, "0")}`;
}

export async function runArticleGeneration() {
  const slotKey = makeSlotKey();
  if (!(await beginArticleRun(slotKey))) return;

  try {
    const candidates = await getTrendingAnime();
    for (const candidate of candidates) {
      const trendKey = normalize(candidate.trend.query).slice(0, 191);
      if (!trendKey || await hasArticleForTrend(trendKey)) continue;

      let facts: AnimeFacts;
      try {
        facts = await getAnimeFacts(candidate.animeSlug);
      } catch {
        continue;
      }
      if (trendMatchScore(candidate.trend.query, facts.title) < 0.7) continue;

      const { draft, citations } = await generateDraft(candidate.trend.query, candidate.trend.traffic, facts, candidate.animeSlug);
      const article: PublishedArticle = {
        slug: slugify(draft.title),
        trendKey,
        trendKeyword: candidate.trend.query,
        trendTraffic: candidate.trend.traffic,
        title: draft.title,
        excerpt: draft.excerpt,
        animeSlug: candidate.animeSlug,
        sections: draft.sections,
        sources: [
          { title: "Google Trends — Penelusuran Indonesia", url: TRENDS_URL },
          { title: `Data katalog AniStream: ${facts.title}`, url: `${SITE_URL}/anime/${encodeURIComponent(candidate.animeSlug)}` },
          ...citations,
        ],
        publishedAt: new Date().toISOString(),
      };
      if (!article.slug || !(await saveArticle(article))) {
        await finishArticleRun(slotKey, "skipped", "Topik tren atau slug sudah pernah diterbitkan");
        return;
      }
      await finishArticleRun(slotKey, "published", article.slug);
      console.info(`[article-scheduler] Published ${article.slug} for trend: ${candidate.trend.query}`);
      return;
    }

    await finishArticleRun(slotKey, "skipped", "Tidak ada topik anime tren yang memenuhi ambang kualitas dan keunikan");
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown article generation error";
    await finishArticleRun(slotKey, "failed", detail).catch(() => undefined);
    console.error("[article-scheduler] Generation failed:", detail);
  }
}