"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Variant = "frosted" | "charcoal";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: Variant;
  /** Parallax strength / perceived Z-depth. 0 disables. */
  depth?: number;
  /** Entrance delay (seconds) for the cinematic load sequence. */
  delay?: number;
  hoverLift?: boolean;
  padded?: boolean;
}

/**
 * A floating liquid-glass panel. The outer wrapper carries mouse-driven
 * parallax (pure CSS vars → 60fps, no re-renders); the inner motion layer
 * carries the cinematic entrance + hover lift.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { variant = "frosted", depth = 2, delay = 0, hoverLift = true, padded = true, className, children, ...rest },
  ref,
) {
  const reduced = usePrefersReducedMotion();

  // NOTE: no persistent 3D/will-change transform on this (text-bearing) layer —
  // those rasterize text to a GPU texture and blur it on scaled displays.
  // Depth/parallax is carried by the background crystal layer instead; cards
  // animate only on entrance + hover, which settle on integer transforms.
  return (
    <div className={cn("w-full", className?.includes("h-full") ? "h-full" : "")}>
      <motion.div
        ref={ref}
        className={cn(
          variant === "charcoal" ? "glass-charcoal" : "glass",
          "relative overflow-hidden",
          className?.includes("h-full") && "h-full",
          padded && "p-5 sm:p-6",
          className,
        )}
        initial={reduced ? false : { opacity: 0, y: 22 + depth * 2, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        whileHover={hoverLift && !reduced ? { y: -5, transition: { type: "spring", stiffness: 260, damping: 18 } } : undefined}
        {...rest}
      >
        {children}
      </motion.div>
    </div>
  );
});
