import mysql, { type Pool } from "mysql2/promise";

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
};

export type ArticleSource = {
  title: string;
  url: string;
};

export type PublishedArticle = {
  slug: string;
  trendKey: string;
  trendKeyword: string;
  trendTraffic: string;
  title: string;
  excerpt: string;
  animeSlug: string;
  sections: ArticleSection[];
  sources: ArticleSource[];
  publishedAt: string;
};

let pool: Pool | undefined;
let schemaReady: Promise<void> | undefined;

function getPool() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !password || !database) {
    throw new Error("Article database is not configured");
  }

  pool ??= mysql.createPool({
    host,
    port: Number(process.env.DB_PORT || 3306),
    user,
    password,
    database,
    connectionLimit: 3,
    connectTimeout: 5000,
    timezone: "Z",
    charset: "utf8mb4",
  });
  return pool;
}

export async function ensureArticleSchema() {
  schemaReady ??= (async () => {
    const connection = getPool();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(160) NOT NULL UNIQUE,
        trend_key VARCHAR(191) NOT NULL UNIQUE,
        trend_keyword VARCHAR(255) NOT NULL,
        trend_traffic VARCHAR(32) NOT NULL,
        title VARCHAR(180) NOT NULL,
        excerpt VARCHAR(320) NOT NULL,
        anime_slug VARCHAR(180) NOT NULL,
        sections_json JSON NOT NULL,
        sources_json JSON NOT NULL,
        published_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX articles_published_idx (published_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS article_generation_runs (
        slot_key VARCHAR(16) NOT NULL PRIMARY KEY,
        status VARCHAR(16) NOT NULL,
        detail VARCHAR(500) NULL,
        started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  })().catch((error) => {
    schemaReady = undefined;
    throw error;
  });
  return schemaReady;
}

function decodeJson<T>(value: T | string): T {
  return typeof value === "string" ? JSON.parse(value) as T : value;
}

function mapArticle(row: Record<string, unknown>): PublishedArticle {
  const publishedAt = row.published_at instanceof Date
    ? row.published_at.toISOString()
    : String(row.published_at);
  return {
    slug: String(row.slug),
    trendKey: String(row.trend_key),
    trendKeyword: String(row.trend_keyword),
    trendTraffic: String(row.trend_traffic),
    title: String(row.title),
    excerpt: String(row.excerpt),
    animeSlug: String(row.anime_slug),
    sections: decodeJson<ArticleSection[]>(row.sections_json as ArticleSection[] | string),
    sources: decodeJson<ArticleSource[]>(row.sources_json as ArticleSource[] | string),
    publishedAt,
  };
}

export async function beginArticleRun(slotKey: string) {
  await ensureArticleSchema();
  const connection = getPool();
  const [insertResult] = await connection.execute(
    "INSERT IGNORE INTO article_generation_runs (slot_key, status) VALUES (?, 'running')",
    [slotKey],
  );
  if ((insertResult as { affectedRows: number }).affectedRows === 1) return true;

  const [retryResult] = await connection.execute(
    `UPDATE article_generation_runs
     SET status = 'running', detail = NULL, started_at = CURRENT_TIMESTAMP, finished_at = NULL
     WHERE slot_key = ? AND (
       status IN ('failed', 'skipped') OR
       (status = 'running' AND started_at < UTC_TIMESTAMP() - INTERVAL 12 MINUTE)
     )`,
    [slotKey],
  );
  return (retryResult as { affectedRows: number }).affectedRows === 1;
}

export async function finishArticleRun(
  slotKey: string,
  status: "published" | "skipped" | "failed",
  detail: string,
) {
  await ensureArticleSchema();
  await getPool().execute(
    "UPDATE article_generation_runs SET status = ?, detail = ?, finished_at = UTC_TIMESTAMP() WHERE slot_key = ?",
    [status, detail.slice(0, 500), slotKey],
  );
}

export async function hasArticleForTrend(trendKey: string) {
  await ensureArticleSchema();
  const [rows] = await getPool().execute(
    "SELECT 1 FROM articles WHERE trend_key = ? LIMIT 1",
    [trendKey],
  );
  return (rows as unknown[]).length > 0;
}

export async function saveArticle(article: PublishedArticle) {
  await ensureArticleSchema();
  const [result] = await getPool().execute(
    `INSERT IGNORE INTO articles
      (slug, trend_key, trend_keyword, trend_traffic, title, excerpt, anime_slug, sections_json, sources_json, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      article.slug,
      article.trendKey,
      article.trendKeyword,
      article.trendTraffic,
      article.title,
      article.excerpt,
      article.animeSlug,
      JSON.stringify(article.sections),
      JSON.stringify(article.sources),
      new Date(article.publishedAt),
    ],
  );
  return (result as { affectedRows: number }).affectedRows === 1;
}

export async function getPublishedArticles(limit = 50) {
  await ensureArticleSchema();
  const [rows] = await getPool().execute(
    "SELECT * FROM articles ORDER BY published_at DESC LIMIT ?",
    [Math.max(1, Math.min(Math.trunc(limit), 100))],
  );
  return (rows as Record<string, unknown>[]).map(mapArticle);
}

export async function getPublishedArticle(slug: string) {
  await ensureArticleSchema();
  const [rows] = await getPool().execute(
    "SELECT * FROM articles WHERE slug = ? LIMIT 1",
    [slug],
  );
  const row = (rows as Record<string, unknown>[])[0];
  return row ? mapArticle(row) : null;
}
