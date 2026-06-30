import { NextResponse } from "next/server";
import { PROFILE, wmoInfo } from "@/lib/constants";
import { getCache, setCache } from "@/lib/server/cache";
import type { WeatherNow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cacheKey = "weather";
  const cached = getCache<WeatherNow>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${PROFILE.lat}&longitude=${PROFILE.lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;

  try {
    const r = await fetch(url, { next: { revalidate: 0 } });
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
    const d = await r.json();
    const c = d.current;
    const code = c.weather_code as number;
    const out: WeatherNow = {
      tempC: c.temperature_2m,
      feelsC: c.apparent_temperature,
      code,
      label: wmoInfo(code).label,
      isDay: c.is_day === 1,
      windKph: Math.round((c.wind_speed_10m ?? 0) * 1) / 1,
      humidity: c.relative_humidity_2m ?? 0,
      high: d.daily?.temperature_2m_max?.[0] ?? c.temperature_2m,
      low: d.daily?.temperature_2m_min?.[0] ?? c.temperature_2m,
      city: PROFILE.city,
    };
    setCache(cacheKey, out, 10 * 60 * 1000);
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Weather unavailable" }, { status: 502 });
  }
}
