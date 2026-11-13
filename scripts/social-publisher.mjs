import { readFile, writeFile } from "node:fs/promises";

const graphVersion = process.env.META_GRAPH_VERSION || "v24.0";
const postsPerDay = Math.max(1, Number(process.env.SOCIAL_POSTS_PER_DAY || 3));
const dryRun = process.env.SOCIAL_DRY_RUN === "true";
const enabled = process.env.SOCIAL_AUTOPUBLISH_ENABLED === "true";
const statePath = new URL("../data/social-posted.json", import.meta.url);

const sources = [
  {
    key: "anistreaming",
    label: "AniStreaming",
    siteUrl: process.env.ANISTREAMING_SITE_URL || "https://anistreaming.com",
    articlesUrl: process.env.ANISTREAMING_ARTICLES_URL || "https://anistreaming.com/api/articles",
    pageId: process.env.META_PAGE_ID_ANISTREAMING,
    token: process.env.META_PAGE_ACCESS_TOKEN_ANISTREAMING,
  },
  {
    key: "filmanesia",
    label: "Filmanesia",
    siteUrl: process.env.FILMANESIA_SITE_URL || "https://filmanesia.com",
    articlesUrl: process.env.FILMANESIA_ARTICLES_URL || "https://filmanesia.com/api/articles",
    pageId: process.env.META_PAGE_ID_FILMANESIA,
    token: process.env.META_PAGE_ACCESS_TOKEN_FILMANESIA,
  },
];

function requireValue(name, value) {
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function getJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

function normalizeArticle(article, source) {
  const slug = String(article.slug || article.id || "").trim();
  const title = String(article.title || "").trim();
  const excerpt = String(article.excerpt || article.description || "").trim();
  if (!slug || !title) return null;
  const articlePath = source.key === "filmanesia" ? "blog" : "artikel";
  return {
    id: `${source.key}:${slug}`,
    source: source.key,
    label: source.label,
    title,
    excerpt,
    url: `${source.siteUrl}/${articlePath}/${encodeURIComponent(slug)}`,
    publishedAt: String(article.publishedAt || article.published_at || article.created_at || ""),
  };
}

async function loadArticles(source) {
  try {
    const payload = await getJson(source.articlesUrl);
    const items = Array.isArray(payload) ? payload : payload.items || payload.articles || [];
    return items
      .map(item => normalizeArticle(item, source))
      .filter(Boolean)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (error) {
    console.warn(`[social-publisher] Skipping unavailable ${source.label} feed: ${error.message}`);
    return [];
  }
}

async function loadTrends() {
  const response = await fetch("https://trends.google.com/trending/rss?geo=ID", {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return [];
  const xml = await response.text();
  return [...xml.matchAll(/<title>(?:<!\[CDATA\[)?([^<\]]+)/gi)]
    .map(match => match[1].trim())
    .filter(title => title && title !== "Daily Search Trends")
    .slice(0, 10);
}

async function loadState() {
  try {
    const value = JSON.parse(await readFile(statePath, "utf8"));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function chooseArticles(articles, state) {
  const published = new Set(state);
  const available = articles.filter(article => !published.has(article.id));
  const selected = [];
  let sourceIndex = 0;
  while (selected.length < postsPerDay && available.length) {
    const preferred = available.findIndex(article => article.source === sources[sourceIndex % sources.length].key);
    const index = preferred >= 0 ? preferred : 0;
    selected.push(available.splice(index, 1)[0]);
    sourceIndex += 1;
  }
  return selected;
}

function parseModelJson(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  const result = JSON.parse(cleaned);
  if (typeof result.message !== "string" || !result.message.trim()) throw new Error("AI returned an empty social message");
  return result.message.trim().slice(0, 63206);
}

async function createCaption(article, trends) {
  const apiKey = requireValue("OPENAI_API_KEY", process.env.OPENAI_API_KEY);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_SOCIAL_MODEL || "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [{
            type: "input_text",
            text: "Anda adalah editor media sosial film dan anime berbahasa Indonesia. Tulis caption orisinal, informatif, menarik, tidak clickbait, dan tidak mengklaim sebuah topik sedang tren kecuali didukung data yang diberikan. Jangan menyalin sinopsis atau dialog berhak cipta.",
          }],
        },
        {
          role: "user",
          content: [{
            type: "input_text",
            text: JSON.stringify({
              brand: article.label,
              title: article.title,
              excerpt: article.excerpt,
              url: article.url,
              googleTrendsIndonesia: trends,
              requirements: [
                "Bahasa Indonesia yang natural dan singkat.",
                "Buka dengan hook yang relevan, lalu beri konteks tanpa spoiler berat.",
                "Akhiri dengan ajakan membaca artikel di link.",
                "Tambahkan 3-5 hashtag yang relevan.",
                "Kembalikan JSON tepat dengan bentuk {\"message\":\"...\"}.",
              ],
            }),
          }],
        },
      ],
    }),
    signal: AbortSignal.timeout(90000),
  });
  if (!response.ok) throw new Error(`OpenAI returned HTTP ${response.status}`);
  const payload = await response.json();
  const text = payload.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
  if (!text) throw new Error("OpenAI returned no social caption");
  return parseModelJson(text);
}

async function publishToFacebook(source, message, link) {
  requireValue(`META_PAGE_ID_${source.key.toUpperCase()}`, source.pageId);
  requireValue(`META_PAGE_ACCESS_TOKEN_${source.key.toUpperCase()}`, source.token);
  const endpoint = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(source.pageId)}/feed`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, link, access_token: source.token }),
    signal: AbortSignal.timeout(20000),
  });
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error(`Meta API failed: ${payload.error?.message || response.status}`);
  return payload.id;
}

const state = await loadState();
const allArticles = (await Promise.all(sources.map(loadArticles))).flat();
const selected = chooseArticles(allArticles, state);
const trends = await loadTrends().catch(() => []);

if (!selected.length) {
  console.log("No new articles are available for social publishing.");
  process.exit(0);
}

if (!enabled && !dryRun) {
  throw new Error("SOCIAL_AUTOPUBLISH_ENABLED must be true, or use SOCIAL_DRY_RUN=true for a preview");
}

for (const article of selected) {
  const source = sources.find(item => item.key === article.source);
  const message = await createCaption(article, trends);
  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, article, message }, null, 2));
    continue;
  }
  const postId = await publishToFacebook(source, message, article.url);
  console.log(`Published ${article.id} to ${source.label}: ${postId}`);
  state.push(article.id);
}

if (!dryRun) {
  const retained = state.slice(-200);
  await writeFile(statePath, `${JSON.stringify(retained, null, 2)}\n`, "utf8");
}
