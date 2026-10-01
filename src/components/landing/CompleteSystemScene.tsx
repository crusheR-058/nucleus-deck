"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { Icon } from "@/components/ui/Icon";
import { SYSTEM_NODES } from "./types";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function CompleteSystemScene() {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      id="scene-ecosystem"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-32 text-center"
    >
      {/* Background concentric cosmic rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[100px] rounded-full border border-white/[0.07]" />
        <div className="absolute inset-[220px] rounded-full border border-dashed border-white/[0.09]" />
        <div className="absolute inset-[340px] rounded-full border border-white/[0.12]" />
      </div>

      {/* Centerpiece Macro Nucleus with Orbiting Constellation */}
      <div className="relative z-10 mb-12 flex h-[380px] w-full max-w-[700px] items-center justify-center">
        {/* Central glowing Nucleus core */}
        <motion.div
          animate={reduced ? false : { scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="glass-pill-dark relative z-20 grid h-32 w-32 place-items-center rounded-full border border-white/40 shadow-[0_0_80px_rgba(255,255,255,0.25)]"
        >
          <NucleusMark size={56} className="drop-shadow-[0_0_16px_rgba(255,255,255,0.8)]" />
        </motion.div>

        {/* Orbiting domain tags */}
        {SYSTEM_NODES.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const r = 240; // visual orbit radius
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * (r * 0.55); // elliptical perspective

          return (
            <motion.div
              key={node.id}
              initial={reduced ? false : { opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                x,
                y,
                translateX: "-50%",
                translateY: "-50%",
              }}
              className="glass-pill-dark group flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/50 hover:text-white"
            >
              <Icon name={node.icon} size={12} className="text-white/70" />
              <span className="font-medium text-[11px]">{node.title}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Main Copy */}
      <div className="relative z-10 max-w-3xl">
        <div className="label-eyebrow text-white/50 mb-3">SCENE 09 // COMPLETE SYSTEM</div>
        <h2 className="font-display text-4xl font-medium tracking-tight text-white sm:text-6xl">
          Your entire digital life. One surface.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400 sm:text-lg sm:leading-relaxed">
          Nucleus Deck brings your day, knowledge, media, markets and intelligence into one personal command center.
        </p>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/deck"
            className="liquid-btn group flex items-center gap-3 rounded-full border border-white/50 bg-white/20 px-9 py-4 text-sm font-semibold tracking-wider text-white shadow-[0_0_50px_rgba(255,255,255,0.35)] backdrop-blur-2xl transition hover:scale-105 hover:bg-white/30"
          >
            <span>ENTER NUCLEUS</span>
            <Icon name="ArrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Seamless bottom fade into Final CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[#050506]" />
    </section>
  );
}
