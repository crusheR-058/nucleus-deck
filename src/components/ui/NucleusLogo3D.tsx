"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMounted, usePrefersReducedMotion } from "@/lib/hooks";
import { NucleusMark } from "./NucleusMark";
import { cn } from "@/lib/utils";

// The WebGL scene is loaded client-side only; before then (or when 3D isn't
// available) we render the crisp 2D mark instead.
const NucleusAtom = dynamic(() => import("./NucleusAtom").then((m) => m.NucleusAtom), { ssr: false });

/**
 * Interactive 3D Nucleus logo — a glassy nucleus core with orbiting electron
 * rings. Drag to spin, auto-rotates when idle, brightens on hover. Falls back
 * to the flat <NucleusMark/> when WebGL is unavailable.
 */
export function NucleusLogo3D({ size = 140, className }: { size?: number; className?: string }) {
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const [can3d, setCan3d] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setCan3d(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setCan3d(false);
    }
  }, []);

  if (!mounted || !can3d) return <NucleusMark size={size} className={className} />;

  return (
    <div
      className={cn("relative select-none", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Nucleus Deck logo"
      title="Drag to spin"
    >
      <NucleusAtom reduced={reduced} />
    </div>
  );
}
