"use client";

import { cn } from "@/lib/utils";

/** The Nucleus Deck logo mark — a glassy nucleus with orbiting rings. */
export function NucleusMark({ size = 34, className, spin = true }: { size?: number; className?: string; spin?: boolean }) {
  return (
    <span
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <span
        className={cn("absolute inset-0 rounded-full border border-white/60", spin && "animate-spin-slow")}
        style={{ borderTopColor: "rgba(255,255,255,0.95)", borderRightColor: "transparent" }}
      />
      <span
        className="absolute rounded-full border border-white/30"
        style={{ inset: size * 0.16 }}
      />
      <span
        className="rounded-full bg-gradient-to-br from-white to-silver shadow-[0_0_12px_-1px_rgba(255,255,255,0.9)]"
        style={{ width: size * 0.34, height: size * 0.34 }}
      />
    </span>
  );
}
