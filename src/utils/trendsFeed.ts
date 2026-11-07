export type TrendItem = {
  query: string;
  traffic: string;
  publishedAt: Date;
};

const MIN_TREND_TRAFFIC = 200;

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function readTag(xml: string, tagName: string) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

export function parseTrendFeed(xml: string, now = Date.now()): TrendItem[] {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
    .map(([, item]) => {
      const query = readTag(item, "title");
      const traffic = readTag(item, "ht:approx_traffic");
      const publishedAt = new Date(readTag(item, "pubDate"));
      const trafficCount = Number(traffic.replace(/[^\d]/g, ""));
      if (!query || !Number.isFinite(trafficCount) || trafficCount < MIN_TREND_TRAFFIC) return null;
      if (Number.isNaN(publishedAt.getTime()) || now - publishedAt.getTime() > 36 * 60 * 60 * 1000 || publishedAt.getTime() > now + 60 * 60 * 1000) return null;
      return { query, traffic, publishedAt };
    })
    .filter((item): item is TrendItem => item !== null);
}
