"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks";

function wavePath(width: number, mid: number, amp: number, wavelength: number, phase: number) {
  let d = `M 0 ${mid}`;
  for (let x = 0; x <= width; x += 6) {
    const y = mid + Math.sin(x / wavelength + phase) * amp;
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

/** Animated, mood-reactive monochrome waveform. */
export function Waveform({
  amp = 0.6,
  speed = 1,
  tone = "dark",
}: {
  amp?: number;
  speed?: number;
  tone?: "light" | "dark";
}) {
  const reduced = usePrefersReducedMotion();
  const W = 240;
  const H = 64;
  const mid = H / 2;
  const stroke = tone === "dark" ? "#ffffff" : "#18181b";

  const layers = [
    { a: 16 * amp, wl: 30, op: 0.9, dur: 6 / speed, w: 2 },
    { a: 11 * amp, wl: 22, op: 0.45, dur: 8 / speed, w: 1.5 },
    { a: 7 * amp, wl: 16, op: 0.25, dur: 10 / speed, w: 1 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" aria-hidden>
      {layers.map((l, i) => (
        <motion.path
          key={i}
          d={wavePath(W * 2, mid, l.a, l.wl, i * 1.3)}
          fill="none"
          stroke={stroke}
          strokeWidth={l.w}
          strokeLinecap="round"
          opacity={l.op}
          initial={{ x: 0 }}
          animate={reduced ? { x: 0 } : { x: -W }}
          transition={{ duration: l.dur, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </svg>
  );
}
