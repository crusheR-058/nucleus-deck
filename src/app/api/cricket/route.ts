/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/server/cache";
import type { CricketMatch } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "https://api.cricapi.com/v1";

// Richer match list (teams + per-innings score). Free tier ~100/day → cached.
async function fetchCurrentMatches(apikey: string): Promise<CricketMatch[]> {
  const r = await fetch(`${BASE}/currentMatches?apikey=${apikey}&offset=0`, { next: { revalidate: 0 } });
  if (!r.ok) throw new Error(`CricketData ${r.status}`);
  const d = await r.json();
  if (d?.status !== "success") throw new Error(d?.status || "CricketData error");
  return (d.data || []).slice(0, 10).map((m: any): CricketMatch => {
    const teams: string[] = m.teams || [];
    const scoreFor = (team: string) => {
      const sc = (m.score || []).find((s: any) => (s.inning || "").toLowerCase().includes((team || "").toLowerCase()));
      return sc ? `${sc.r}/${sc.w} (${sc.o})` : "";
    };
    return {
      id: m.id,
      name: m.name || `${teams[0] || ""} vs ${teams[1] || ""}`,
      status: m.status || "",
      matchType: (m.matchType || "").toUpperCase(),
      t1: teams[0] || "",
      t2: teams[1] || "",
      t1s: scoreFor(teams[0]),
      t2s: scoreFor(teams[1]),
      series: m.series || "",
    };
  });
}

// Lightweight high-limit fallback (±7 day live/results) — already in t1/t2 shape.
async function fetchCricScore(apikey: string): Promise<CricketMatch[]> {
  const r = await fetch(`${BASE}/cricScore?apikey=${apikey}`, { next: { revalidate: 0 } });
  if (!r.ok) throw new Error(`CricketData ${r.status}`);
  const d = await r.json();
  if (d?.status !== "success") throw new Error(d?.status || "CricketData error");
  return (d.data || []).slice(0, 10).map((m: any): CricketMatch => ({
    id: m.id,
    name: `${m.t1 || ""} vs ${m.t2 || ""}`.trim(),
    status: m.status || "",
    matchType: (m.matchType || "").toUpperCase(),
    t1: m.t1 || "",
    t2: m.t2 || "",
    t1s: m.t1s || "",
    t2s: m.t2s || "",
    series: m.series || "",
  }));
}

export async function GET() {
  const apikey = process.env.CRICKET_API_KEY;
  if (!apikey) return NextResponse.json({ configured: false });

  const cacheKey = "cricket:matches";
  const cached = getCache<{ configured: true; matches: CricketMatch[] }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    let matches = await fetchCurrentMatches(apikey);
    if (!matches.length) matches = await fetchCricScore(apikey);
    const out = { configured: true as const, matches };
    setCache(cacheKey, out, 3 * 60 * 1000);
    return NextResponse.json(out);
  } catch (e) {
    // currentMatches failed (quota/permission) → try the high-limit score endpoint
    try {
      const matches = await fetchCricScore(apikey);
      const out = { configured: true as const, matches };
      setCache(cacheKey, out, 3 * 60 * 1000);
      return NextResponse.json(out);
    } catch {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Cricket unavailable" }, { status: 502 });
    }
  }
}
