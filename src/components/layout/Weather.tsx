"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { wmoInfo } from "@/lib/constants";
import type { WeatherNow } from "@/lib/types";

export function Weather() {
  const [w, setW] = useState<WeatherNow | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && setW(d))
      .catch(() => alive && setErr(true));
    const id = setInterval(() => {
      fetch("/api/weather")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => alive && setW(d))
        .catch(() => {});
    }, 1000 * 60 * 15);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (err && !w) return null;

  if (!w) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="skeleton h-9 w-9 rounded-full" />
        <div className="space-y-1.5">
          <div className="skeleton h-3 w-10 rounded" />
          <div className="skeleton h-2 w-16 rounded" />
        </div>
      </div>
    );
  }

  const info = wmoInfo(w.code);
  return (
    <div className="flex items-center gap-2.5" title={`${w.label} · feels ${Math.round(w.feelsC)}° · H${Math.round(w.high)}° L${Math.round(w.low)}°`}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/55 text-strong shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
        <Icon name={info.icon} size={18} />
      </span>
      <div className="leading-tight">
        <div className="tabular text-[15px] font-medium text-strong">{Math.round(w.tempC)}°C</div>
        <div className="text-[11px] text-muted">{info.label}</div>
      </div>
    </div>
  );
}
