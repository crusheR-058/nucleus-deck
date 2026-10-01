"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function ExploreScene() {
  const reduced = usePrefersReducedMotion();

  return (
    <section id="scene-explore" className="relative min-h-screen w-full px-6 py-28 lg:px-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <div className="label-eyebrow text-white/50 mb-2">SCENE 07 // EXPLORE & ENTERTAINMENT</div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-5xl">
            A constellation of personal information.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
            Live markets, studio media downloads, real-time sports scorecards, and a full monochrome casino — all
            harmonized within the same glass architecture.
          </p>
        </div>

        {/* Spatial Constellation Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
          {/* Panel 1: Live Financial Markets (span 7) */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-2xl backdrop-blur-2xl lg:col-span-7"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">
                  <Icon name="TrendingUp" size={15} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">Live Markets & Equities</h3>
                  <span className="font-mono text-[10px] text-zinc-400">CoinGecko & Yahoo Finance APIs</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE TICKS
              </div>
            </div>

            {/* Market Tickers */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { sym: "BTC", price: "$94,240", change: "+3.42%", positive: true },
                { sym: "ETH", price: "$3,415", change: "+2.15%", positive: true },
                { sym: "SOL", price: "$186.50", change: "+5.80%", positive: true },
                { sym: "S&P 500", price: "5,984", change: "+0.64%", positive: true },
                { sym: "NVDA", price: "$142.20", change: "+1.92%", positive: true },
                { sym: "AAPL", price: "$232.80", change: "-0.34%", positive: false },
              ].map((item) => (
                <div key={item.sym} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-semibold text-white">{item.sym}</span>
                    <span
                      className={`font-mono text-[10px] ${
                        item.positive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {item.change}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-medium text-zinc-200">{item.price}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-zinc-500">
              <span>ZERO TRACKING • KEYLESS WHERE POSSIBLE</span>
              <span>AUTO REFRESH: 30S</span>
            </div>
          </motion.div>

          {/* Panel 2: Studio Media Downloader (span 5) */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-2xl backdrop-blur-2xl lg:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">
                  <Icon name="Youtube" size={15} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">Media Studio</h3>
                  <span className="font-mono text-[10px] text-zinc-400">yt-dlp + ffmpeg Core</span>
                </div>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[9px] text-zinc-300">
                Lossless
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-zinc-400">
                <Icon name="Search" size={13} />
                <span className="truncate">Search YouTube or paste URL...</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-xs text-white">
                  <span className="font-medium truncate max-w-[200px]">Neurology Lecture 04 — CNS Anatomy</span>
                  <span className="font-mono text-[10px] text-emerald-400">1080p MP4</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-3/4 rounded-full bg-white" />
                </div>
                <div className="mt-1 flex justify-between font-mono text-[9px] text-zinc-500">
                  <span>Downloading... 75%</span>
                  <span>14.2 MB/s</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-zinc-500">
              <span>LOCAL DISK STORAGE</span>
              <span>NO 3RD PARTY CLOUD</span>
            </div>
          </motion.div>

          {/* Panel 3: Live Sports & Cinema Watchlist (span 6) */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-2xl backdrop-blur-2xl lg:col-span-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">
                  <Icon name="Film" size={15} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">Cricket & Cinema</h3>
                  <span className="font-mono text-[10px] text-zinc-400">Live scorecards & watchlists</span>
                </div>
              </div>
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 font-mono text-[10px] text-rose-300">
                LIVE MATCH
              </span>
            </div>

            {/* Cricket Scorecard Preview */}
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="font-semibold text-white">IND vs AUS — 2nd Test</span>
                <span className="font-mono text-[10px] text-emerald-400">Day 3, Session 2</span>
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-xs">
                <div>IND: 384/6 (92.4 ov)</div>
                <div className="text-zinc-400">CRR: 4.14</div>
              </div>
            </div>

            {/* Movies list */}
            <div className="mt-3 flex gap-2">
              {["Oppenheimer", "Dune: Part Two", "Interstellar"].map((film) => (
                <div
                  key={film}
                  className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] p-2 text-center text-[11px] text-zinc-300"
                >
                  <span className="truncate block">{film}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Panel 4: Monochrome Casino (span 6) */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-2xl backdrop-blur-2xl lg:col-span-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">
                  <Icon name="Dices" size={15} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">Monochrome Casino</h3>
                  <span className="font-mono text-[10px] text-zinc-400">10 games • 1,000,000 chips</span>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold text-amber-400">1,000,000 🪙</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="font-mono text-[10px] text-zinc-400">BLACKJACK</span>
                <div className="my-1 text-sm font-semibold text-white">Natural 21</div>
                <div className="flex gap-1.5 font-mono text-[11px]">
                  <span className="rounded bg-white px-1.5 text-black font-bold">A♠</span>
                  <span className="rounded bg-white px-1.5 text-black font-bold">K♠</span>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="font-mono text-[10px] text-zinc-400">3D ROULETTE</span>
                <div className="my-1 text-sm font-semibold text-white">European Wheel</div>
                <span className="font-mono text-[10px] text-zinc-400">Physics simulation active</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-zinc-500">
              <span>LOCAL RANDOM SEED</span>
              <span>NO REAL MONEY</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
