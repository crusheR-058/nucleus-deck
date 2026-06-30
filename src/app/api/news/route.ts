import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { NEWS_SECTIONS } from "@/lib/constants";
import { getCache, setCache } from "@/lib/server/cache";
import type { NewsItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const parser = new Parser({
  timeout: 9000,
  headers: { "User-Agent": "NucleusDeck/1.0 (+local dashboard)" },
});

function clip(s = "", n = 200) {
  const t = s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

// ── NewsAPI.org (real photos) ─────────────────────────────────
interface NewsApiArticle {
  title?: string;
  url?: string;
  urlToImage?: string | null;
  publishedAt?: string;
  description?: string;
  source?: { name?: string };
}

async function fromNewsApi(key: string, country: string, category: string, q: string): Promise<NewsItem[]> {
  const base = q
    ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=48`
    : `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=48`;
  const r = await fetch(`${base}&apiKey=${key}`, { headers: { "User-Agent": "NucleusDeck/1.0" } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.status === "error") throw new Error(d?.message || `NewsAPI error (${r.status})`);
  return ((d.articles || []) as NewsApiArticle[])
    .filter((a) => a.title && a.url && a.title !== "[Removed]")
    .map((a, i) => ({
      id: a.url || `na-${i}`,
      title: a.title as string,
      url: a.url as string,
      source: a.source?.name || "News",
      publishedAt: a.publishedAt || new Date().toISOString(),
      snippet: clip(a.description || ""),
      image: a.urlToImage || undefined,
    }));
}

// ── Google News RSS (no key, no images) — fallback ────────────
async function fromGoogleNews(topic: string, q: string): Promise<NewsItem[]> {
  const url = q
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`
    : topic
      ? `https://news.google.com/rss/headlines/section/topic/${topic}?hl=en-IN&gl=IN&ceid=IN:en`
      : `https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en`;
  const feed = await parser.parseURL(url);
  return (feed.items ?? []).slice(0, 40).map((it, i) => {
    const raw = it.title ?? "Untitled";
    // Google News titles look like "Headline - Source"
    const source = raw.includes(" - ") ? raw.slice(raw.lastIndexOf(" - ") + 3) : "Google News";
    const title = raw.includes(" - ") ? raw.slice(0, raw.lastIndexOf(" - ")) : raw;
    return {
      id: it.guid || it.link || `gn-${i}`,
      title,
      url: it.link ?? "#",
      source,
      publishedAt: it.isoDate || it.pubDate || new Date().toISOString(),
      snippet: "",
      image: undefined,
    };
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const sectionId = searchParams.get("section") || "top";
  const section = NEWS_SECTIONS.find((s) => s.id === sectionId) || NEWS_SECTIONS[0];
  const key = process.env.NEWS_API_KEY;
  // NewsAPI free tier serves top-headlines for the US reliably; India-flavoured
  // sections (and the search box) go through the /everything endpoint instead.
  const apiQuery = q || section.query || "";

  const cacheKey = `news:${key ? "api" : "gn"}:${q ? `q:${q.toLowerCase()}` : section.id}`;
  const cached = getCache<{ items: NewsItem[]; provider: string }>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  try {
    let items: NewsItem[];
    let provider: string;
    if (key) {
      items = await fromNewsApi(key, "us", section.category, apiQuery);
      provider = "newsapi";
    } else {
      items = await fromGoogleNews(section.topic, q);
      provider = "googlenews";
    }
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    const payload = { items, provider };
    setCache(cacheKey, payload, 10 * 60 * 1000); // 10 min
    return NextResponse.json(payload);
  } catch (err) {
    // If NewsAPI fails (missing/invalid key, rate limit), fall back to Google News
    // so the page still shows stories (just without photos).
    try {
      const items = await fromGoogleNews(section.topic, q);
      items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      return NextResponse.json({
        items,
        provider: "googlenews",
        warning: err instanceof Error ? err.message : "Falling back to Google News",
      });
    } catch {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to load news" },
        { status: 502 },
      );
    }
  }
}
