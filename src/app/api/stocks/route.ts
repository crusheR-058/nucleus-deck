/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/server/cache";
import type { StockQuote } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAME_MAP: Record<string, string> = {
  "^NSEI": "Nifty 50",
  "^BSESN": "Sensex",
  "^NSEBANK": "Bank Nifty",
  "^IXIC": "Nasdaq",
  "^GSPC": "S&P 500",
  "^DJI": "Dow Jones",
};

// Live indices/quotes via Yahoo Finance's unofficial chart endpoint — keyless.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbols = (searchParams.get("symbols") || "^NSEI,^BSESN")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const cacheKey = `stocks:${symbols.join(",")}`;

  const cached = getCache<{ quotes: StockQuote[] }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const quotes: StockQuote[] = await Promise.all(
    symbols.map(async (sym): Promise<StockQuote> => {
      try {
        const u = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=5m`;
        const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 0 } });
        if (!r.ok) throw new Error(String(r.status));
        const d = await r.json();
        const res = d?.chart?.result?.[0];
        const meta = res?.meta || {};
        const closes: number[] = (res?.indicators?.quote?.[0]?.close || []).filter((x: any) => x != null);
        const price = meta.regularMarketPrice ?? closes[closes.length - 1] ?? 0;
        const prev = meta.chartPreviousClose ?? meta.previousClose ?? closes[0] ?? price;
        const change = price - prev;
        const changePct = prev ? (change / prev) * 100 : 0;
        return {
          symbol: sym,
          name: NAME_MAP[sym] || meta.shortName || sym,
          price,
          change,
          changePct,
          spark: closes.filter((_, i) => i % 3 === 0),
        };
      } catch {
        return { symbol: sym, name: NAME_MAP[sym] || sym, price: 0, change: 0, changePct: 0, spark: [] };
      }
    }),
  );

  const out = { quotes };
  setCache(cacheKey, out, 3 * 60 * 1000);
  return NextResponse.json(out);
}
