"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { usePrefersReducedMotion, useMounted } from "@/lib/hooks";
import { playHoverTick, playGlassClick, playEnterDeckChime } from "@/lib/sound";

const NucleusAtom = dynamic(() => import("@/components/ui/NucleusAtom").then((m) => m.NucleusAtom), {
  ssr: false,
  loading: () => <NucleusMark size={200} className="opacity-80" />,
});

export function HeroScene() {
  const reduced = usePrefersReducedMotion();
  const mounted = useMounted();

  const scrollToNext = () => {
    playGlassClick();
    const el = document.getElementById("scene-nucleus");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="scene-arrival"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-16 text-center"
    >
      {/* Central 3D Nucleus with soft radial light halo */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto mb-8 grid place-items-center"
      >
        {/* Soft volumetric light aura behind nucleus */}
        <div className="pointer-events-none absolute -inset-16 rounded-full bg-radial from-white/[0.08] via-white/[0.02] to-transparent blur-2xl" />

        <div className="relative h-[220px] w-[220px] sm:h-[260px] sm:w-[260px] lg:h-[300px] lg:w-[300px]">
          {mounted ? <NucleusAtom reduced={reduced} /> : <NucleusMark size={220} className="mx-auto" />}
        </div>
      </motion.div>

      {/* Hero Eyebrow Metadata */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.25em] text-white/70 backdrop-blur-md"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        <span>System Version 1.0 // Command Center</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-4xl font-display text-4xl font-medium tracking-tight text-white sm:text-6xl lg:text-7xl"
      >
        Your personal command center.
      </motion.h1>

      {/* Supporting text */}
      <motion.p
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-5 max-w-xl text-base text-zinc-400 sm:text-lg sm:leading-relaxed"
      >
        Everything important. One intelligent surface.
      </motion.p>

      {/* Small descriptor */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-mono tracking-widest text-zinc-500 uppercase"
      >
        <span>Tasks</span>
        <span>·</span>
        <span>Focus</span>
        <span>·</span>
        <span>Knowledge</span>
        <span>·</span>
        <span>Media</span>
        <span>·</span>
        <span>Markets</span>
        <span>·</span>
        <span>AI</span>
      </motion.div>

      {/* Actions / CTAs */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-9 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Link
          href="/deck"
          onMouseEnter={playHoverTick}
          onClick={playEnterDeckChime}
          className="liquid-btn group flex items-center justify-center gap-3 rounded-full border border-white/40 bg-white/15 px-8 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_35px_-5px_rgba(255,255,255,0.3)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] hover:border-white/80 hover:bg-white/25 active:scale-95"
        >
          <span>ENTER THE DECK</span>
          <Icon name="ArrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>

        <button
          type="button"
          onMouseEnter={playHoverTick}
          onClick={scrollToNext}
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-zinc-300 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
        >
          <span>EXPLORE THE SYSTEM</span>
          <Icon name="ChevronDown" size={16} className="transition-transform duration-300 group-hover:translate-y-0.5" />
        </button>
      </motion.div>

      {/* Ambient bottom cues */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[10px] font-mono tracking-widest text-zinc-600 uppercase"
      >
        <span>SCROLL TO EXPAND ARCHITECTURE</span>
        <div className="h-4 w-px bg-gradient-to-b from-zinc-500 to-transparent animate-bounce" />
      </motion.div>
    </section>
  );
}
