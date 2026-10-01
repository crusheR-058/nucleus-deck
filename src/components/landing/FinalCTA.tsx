"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { Icon } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function FinalCTA() {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();

  // Quick keyboard shortcut 'D' to launch the deck
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "d" || e.key === "D") {
        router.push("/deck");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <footer className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Subtle bottom lighting */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl" />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Nucleus Mark */}
        <div className="mb-6 grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/5 p-4 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <NucleusMark size={44} className="drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
        </div>

        {/* Title */}
        <h2 className="font-display text-3xl font-semibold tracking-wider text-white sm:text-5xl">
          NUCLEUS DECK
        </h2>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">
          Your personal command center.
        </p>

        {/* Liquid Action Button */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/deck"
            className="liquid-btn group flex items-center gap-3 rounded-full border border-white/40 bg-white/15 px-9 py-4 text-sm font-semibold tracking-wider text-white shadow-[0_0_40px_rgba(255,255,255,0.25)] backdrop-blur-2xl transition hover:scale-105 hover:border-white/80 hover:bg-white/25 active:scale-95"
          >
            <span>ENTER THE DECK</span>
            <Icon name="ArrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <span className="font-mono text-[11px] text-zinc-500">
            Press <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-zinc-300">D</kbd> anywhere to enter
          </span>
        </div>

        {/* Quiet metadata and GitHub link */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-6 text-xs text-zinc-500">
          <span>MIT License © 2026 Om Devi Shankar</span>
          <span>·</span>
          <a
            href="https://github.com/crusheR-058/nucleus-deck"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 transition hover:text-white"
          >
            <Icon name="Github" size={13} />
            <span>GitHub Repository</span>
          </a>
          <span>·</span>
          <span>Local-First Architecture</span>
        </div>
      </motion.div>
    </footer>
  );
}
