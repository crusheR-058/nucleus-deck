import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/server/cache";
import type { YTSearchResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "YouTube search isn't configured. Add YOUTUBE_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ error: "Empty query" }, { status: 400 });

  const cacheKey = `yt:${q.toLowerCase()}`;
  const cached = getCache<YTSearchResult[]>(cacheKey);
  if (cached) return NextResponse.json({ results: cached, cached: true });

  try {
    // search.list (~100 quota units)
    const sUrl =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12` +
      `&q=${encodeURIComponent(q)}&key=${key}`;
    const sRes = await fetch(sUrl);
    if (!sRes.ok) {
      const e = await sRes.json().catch(() => ({}));
      const reason = e?.error?.errors?.[0]?.reason;
      const msg =
        reason === "quotaExceeded"
          ? "Daily YouTube quota reached (≈100 searches/day). Try again tomorrow."
          : e?.error?.message || `YouTube API error (${sRes.status})`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    const sData = await sRes.json();
    const ids: string[] = (sData.items || []).map((it: { id: { videoId: string } }) => it.id.videoId).filter(Boolean);

    // videos.list for durations + view counts (cheap: 1 unit)
    let details: Record<string, { duration?: string; views?: string }> = {};
    if (ids.length) {
      const vUrl =
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics` +
        `&id=${ids.join(",")}&key=${key}`;
      const vRes = await fetch(vUrl);
      if (vRes.ok) {
        const vData = await vRes.json();
        for (const it of vData.items || []) {
          details[it.id] = { duration: it.contentDetails?.duration, views: it.statistics?.viewCount };
        }
      }
    }

    const results: YTSearchResult[] = (sData.items || [])
      .filter((it: { id: { videoId?: string } }) => it.id?.videoId)
      .map((it: { id: { videoId: string }; snippet: Record<string, unknown> }) => {
        const sn = it.snippet as {
          title: string;
          channelTitle: string;
          publishedAt: string;
          thumbnails: { medium?: { url: string }; high?: { url: string }; default?: { url: string } };
        };
        return {
          videoId: it.id.videoId,
          title: sn.title,
          channel: sn.channelTitle,
          thumbnail: sn.thumbnails.high?.url || sn.thumbnails.medium?.url || sn.thumbnails.default?.url || "",
          publishedAt: sn.publishedAt,
          duration: details[it.id.videoId]?.duration,
          views: details[it.id.videoId]?.views,
        };
      });

    setCache(cacheKey, results, 1000 * 60 * 60 * 3); // 3h cache to conserve quota
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Search failed" }, { status: 502 });
  }
}
