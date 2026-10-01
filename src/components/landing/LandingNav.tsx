"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { Icon } from "@/components/ui/Icon";

export function LandingNav() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-5 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-16"
    >
      {/* Brand logo pill */}
      <Link
        href="/"
        className="glass-pill-dark group flex items-center gap-3 rounded-full py-2 pl-3.5 pr-4 transition-all duration-300 hover:border-white/30"
      >
        <NucleusMark size={22} />
        <span className="font-display text-[13px] font-semibold tracking-wider text-white">
          NUCLEUS <span className="text-white/40 font-normal">DECK</span>
        </span>
      </Link>

      {/* Navigation jumps (hidden on mobile, visible on desktop) */}
      <nav className="glass-pill-dark hidden items-center gap-1 rounded-full p-1.5 md:flex">
        {[
          { label: "Architecture", id: "scene-nucleus" },
          { label: "Dashboard", id: "scene-dashboard" },
          { label: "Day", id: "scene-day" },
          { label: "Intelligence", id: "scene-ai" },
          { label: "Explore", id: "scene-explore" },
          { label: "Knowledge", id: "scene-knowledge" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Enter Deck Primary CTA */}
      <div className="flex items-center gap-3">
        <Link
          href="/deck"
          className="liquid-btn group flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-xl transition hover:border-white/60 hover:bg-white/20 active:scale-95"
        >
          <span>Enter Deck</span>
          <Icon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.header>
  );
}
