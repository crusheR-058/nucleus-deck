"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { clamp, cn } from "@/lib/utils";

type Tone = "light" | "dark";

// ── Radial progress ring ──────────────────────────────────────
export function RadialRing({
  value,
  size = 128,
  stroke = 11,
  tone = "light",
  center,
  className,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  tone?: Tone;
  center?: React.ReactNode;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const id = useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = clamp(value, 0, 100) / 100;
  const track = tone === "dark" ? "rgba(255,255,255,0.12)" : "rgba(8,8,12,0.10)";

  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            {tone === "dark" ? (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#a1a1aa" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#71717a" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduced ? c * (1 - pct) : c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: reduced ? 0 : 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: tone === "dark" ? "drop-shadow(0 0 6px rgba(255,255,255,0.45))" : "drop-shadow(0 0 5px rgba(255,255,255,0.6))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{center}</div>
    </div>
  );
}

// ── Glass bars ────────────────────────────────────────────────
export function GlassBars({
  data,
  tone = "light",
  height = 132,
  highlightLast = true,
}: {
  data: { label: string; value: number }[];
  tone?: Tone;
  height?: number;
  highlightLast?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex w-full items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const pct = clamp(d.value / max, 0, 1);
        const isLast = i === data.length - 1;
        const accent = highlightLast && isLast;
        return (
          <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${d.label}: ${d.value}`}>
            <div className="relative flex h-full w-full items-end justify-center">
              <motion.div
                className="w-full max-w-[26px] rounded-t-[9px]"
                style={{
                  height: `${Math.max(pct * 100, 3)}%`,
                  transformOrigin: "bottom",
                  background:
                    tone === "dark"
                      ? accent
                        ? "linear-gradient(to top, rgba(255,255,255,0.55), #ffffff)"
                        : "linear-gradient(to top, rgba(255,255,255,0.12), rgba(255,255,255,0.55))"
                      : accent
                        ? "linear-gradient(to top, #18181b, #52525b)"
                        : "linear-gradient(to top, #3f3f46, rgba(255,255,255,0.92))",
                  boxShadow:
                    tone === "dark"
                      ? "inset 0 1px 1px rgba(255,255,255,0.4)"
                      : "inset 0 1px 1px rgba(255,255,255,0.9), 0 6px 14px -8px rgba(8,8,12,0.5)",
                }}
                initial={reduced ? false : { scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: reduced ? 0 : i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className={cn("text-[10px]", tone === "dark" ? "text-white/55" : "text-faint")}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Liquid area / line chart ──────────────────────────────────
function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

export function LiquidArea({
  values,
  tone = "light",
  height = 130,
  className,
}: {
  values: number[];
  tone?: Tone;
  height?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const id = useId().replace(/:/g, "");
  const W = 300;
  const H = height;
  const pad = 10;
  const data = values.length ? values : [0, 0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stroke = tone === "dark" ? "#ffffff" : "#18181b";

  const pts: [number, number][] = data.map((v, i) => {
    const x = pad + (i * (W - pad * 2)) / Math.max(1, data.length - 1);
    const y = pad + (1 - (v - min) / span) * (H - pad * 2);
    return [x, y];
  });
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1][0]},${H} L ${pts[0][0]},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" className={className}>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone === "dark" ? "rgba(255,255,255,0.45)" : "rgba(24,24,27,0.42)"} />
          <stop offset="100%" stopColor={tone === "dark" ? "rgba(255,255,255,0)" : "rgba(24,24,27,0)"} />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#fill-${id})`}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : 1.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ filter: "drop-shadow(0 1px 4px rgba(255,255,255,0.5))" }}
      />
    </svg>
  );
}

// ── Tiny sparkline ────────────────────────────────────────────
export function Sparkline({ values, tone = "light" }: { values: number[]; tone?: Tone }) {
  const W = 90;
  const H = 28;
  const data = values.length ? values : [0, 0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${(i * W) / Math.max(1, data.length - 1)},${H - ((v - min) / span) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={tone === "dark" ? "#fff" : "#18181b"}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}
