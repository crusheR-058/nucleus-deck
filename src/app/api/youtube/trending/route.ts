import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/server/cache";
import type { YTSearchResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VideoItem {
  id: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string };
}

// YouTube category IDs we treat as "recommendations": Gaming + Science & Technology.
const CATEGORIES = ["20", "28"];
const PER_CATEGORY = 25;

function mapItems(items: VideoItem[]): YTSearchResult[] {
  return items
    .map((it) => ({
      videoId: it.id,
      title: it.snippet?.title || "",
      channel: it.snippet?.channelTitle || "",
      thumbnail:
        it.snippet?.thumbnails?.high?.url ||
        it.snippet?.thumbnails?.medium?.url ||
        it.snippet?.thumbnails?.default?.url ||
        "",
      publishedAt: it.snippet?.publishedAt || "",
      duration: it.contentDetails?.duration,
      views: it.statistics?.viewCount,
    }))
    .filter((r) => r.videoId && r.title);
}

async function fetchCategory(key: string, region: string, categoryId?: string): Promise<YTSearchResult[]> {
  const url =
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics` +
    `&chart=mostPopular&maxResults=${PER_CATEGORY}&regionCode=${region}` +
    `${categoryId ? `&videoCategoryId=${categoryId}` : ""}&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    const reason = e?.error?.errors?.[0]?.reason;
    if (reason === "quotaExceeded") throw new Error("quota");
    return []; // some categories aren't charted in every region — skip quietly
  }
  const data = await res.json();
  return mapItems((data.items || []) as VideoItem[]);
}

/** Round-robin merge so tech and gaming videos are interleaved, deduped by id. */
function interleave(lists: YTSearchResult[][]): YTSearchResult[] {
  const seen = new Set<string>();
  const out: YTSearchResult[] = [];
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) {
    for (const list of lists) {
      const v = list[i];
      if (v && !seen.has(v.videoId)) {
        seen.add(v.videoId);
        out.push(v);
      }
    }
  }
  return out;
}

/**
 * Tech + gaming "recommendations" for a region — the closest the YouTube Data
 * API offers without a full OAuth sign-in. Cheap (~1 unit per category) and
 * cached for 2h.
 */
export async function GET(req: Request) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "YouTube isn't configured. Add YOUTUBE_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const region = (searchParams.get("region") || "IN").toUpperCase().slice(0, 2);

  const cacheKey = `yt:trending:${region}:tech-games`;
  const cached = getCache<YTSearchResult[]>(cacheKey);
  if (cached) return NextResponse.json({ results: cached, cached: true });

  try {
    const lists = await Promise.all(CATEGORIES.map((c) => fetchCategory(key, region, c)));
    const results = interleave(lists);

    if (!results.length) {
      // Fall back to overall most-popular if category charts are empty.
      const fallback = await fetchCategory(key, region).catch(() => []);
      const merged = interleave([fallback]);
      setCache(cacheKey, merged, 1000 * 60 * 30);
      return NextResponse.json({ results: merged });
    }

    setCache(cacheKey, results, 1000 * 60 * 60 * 2); // 2h cache
    return NextResponse.json({ results });
  } catch (err) {
    const msg = err instanceof Error && err.message === "quota"
      ? "Daily YouTube quota reached. Try again later."
      : err instanceof Error
        ? err.message
        : "Failed to load recommendations";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
