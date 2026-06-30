/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/server/cache";
import type { MediaItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripHtml = (s: string) => (s || "").replace(/<[^>]+>/g, "").trim();

function mapShow(show: any): MediaItem {
  return {
    id: `tvmaze-${show.id}`,
    title: show.name,
    type: "tv",
    year: (show.premiered || "").slice(0, 4),
    poster: show.image?.medium || show.image?.original || "",
    rating: show.rating?.average || 0,
    overview: stripHtml(show.summary || ""),
  };
}

// TV via TVmaze (keyless). Movies via OMDb when OMDB_API_KEY is set (free key).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const omdb = process.env.OMDB_API_KEY;
  const cacheKey = q ? `media:q:${q.toLowerCase()}` : "media:popular";

  const cached = getCache<{ movies: MediaItem[]; tv: MediaItem[]; moviesConfigured: boolean }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    if (q) {
      const [omdbRaw, tvRaw] = await Promise.all([
        omdb
          ? fetch(`https://www.omdbapi.com/?apikey=${omdb}&type=movie&s=${encodeURIComponent(q)}`)
              .then((r) => r.json())
              .catch(() => ({}))
          : Promise.resolve(null),
        fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`)
          .then((r) => r.json())
          .catch(() => []),
      ]);
      const movies: MediaItem[] =
        omdb && Array.isArray(omdbRaw?.Search)
          ? omdbRaw.Search.map((m: any) => ({
              id: `omdb-${m.imdbID}`,
              title: m.Title,
              type: "movie" as const,
              year: (m.Year || "").slice(0, 4),
              poster: m.Poster && m.Poster !== "N/A" ? m.Poster : "",
              rating: 0,
              overview: "",
            }))
          : [];
      const tv: MediaItem[] = (Array.isArray(tvRaw) ? tvRaw : []).slice(0, 12).map((x: any) => mapShow(x.show));
      const out = { movies, tv, moviesConfigured: !!omdb };
      setCache(cacheKey, out, 30 * 60 * 1000);
      return NextResponse.json(out);
    }

    // No query → most-popular TV (TVmaze "weight" is a popularity score)
    const shows = await fetch(`https://api.tvmaze.com/shows?page=0`)
      .then((r) => r.json())
      .catch(() => []);
    const tv: MediaItem[] = (Array.isArray(shows) ? shows : [])
      .sort((a: any, b: any) => (b.weight || 0) - (a.weight || 0))
      .slice(0, 12)
      .map(mapShow);
    const out = { movies: [] as MediaItem[], tv, moviesConfigured: !!omdb };
    setCache(cacheKey, out, 30 * 60 * 1000);
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Media unavailable" }, { status: 502 });
  }
}
