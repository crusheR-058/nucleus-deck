/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/server/cache";
import type { CryptoCoin } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Live crypto prices via CoinGecko — keyless, cached to respect their rate limit.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get("ids") || "bitcoin,ethereum,solana").toLowerCase();
  const cacheKey = `crypto:${ids}`;

  const cached = getCache<{ coins: CryptoCoin[] }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const url =
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}` +
    `&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;

  try {
    const r = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 0 } });
    if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
    const data = await r.json();
    const coins: CryptoCoin[] = (data || []).map((c: any) => ({
      id: c.id,
      symbol: (c.symbol || "").toUpperCase(),
      name: c.name,
      price: c.current_price ?? 0,
      change24h: c.price_change_percentage_24h ?? 0,
      // ~168 hourly points over 7d → downsample to keep the sparkline light
      spark: (c.sparkline_in_7d?.price || []).filter((_: number, i: number) => i % 4 === 0),
      image: c.image || "",
    }));
    const out = { coins };
    setCache(cacheKey, out, 3 * 60 * 1000);
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Crypto unavailable" }, { status: 502 });
  }
}
