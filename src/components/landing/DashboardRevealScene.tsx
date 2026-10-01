"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { Icon } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function DashboardRevealScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 3D Perspective Zoom and Straightening
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.65, 0.82, 0.96, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.7, 1], [22, 6, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 0.7, 1], [-12, -3, 0]);
  const z = useTransform(scrollYProgress, [0, 0.8, 1], [-300, -80, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.6], [0.3, 0.8, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.35, 0.8], [1, 0.8, 0.2]);

  return (
    <div ref={containerRef} id="scene-dashboard" className="relative h-[230vh] w-full">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8">
        {/* Scene Heading */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="pointer-events-none absolute top-16 z-20 mx-auto text-center"
        >
          <div className="label-eyebrow text-white/50 mb-1.5">SCENE 04 // MANIFESTATION</div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-white sm:text-4xl">
            From abstract constellation to living surface.
          </h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Entering the Nucleus: The personal operating deck approaches the viewer.
          </p>
        </motion.div>

        {/* 3D Stage Container */}
        <div className="relative w-full max-w-[1240px] perspective-1200 preserve-3d">
          <motion.div
            style={{
              scale: reduced ? 1 : scale,
              rotateX: reduced ? 0 : rotateX,
              rotateY: reduced ? 0 : rotateY,
              z: reduced ? 0 : z,
              opacity,
              transformStyle: "preserve-3d",
            }}
            className="group relative overflow-hidden rounded-[28px] border border-white/25 bg-[#0a0a0d]/90 p-4 shadow-[0_40px_140px_-30px_rgba(0,0,0,0.9),0_0_80px_rgba(255,255,255,0.06)] backdrop-blur-3xl transition-shadow duration-500 hover:shadow-[0_50px_160px_-20px_rgba(255,255,255,0.12)] sm:p-6"
          >
            {/* Top edge liquid specular highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

            {/* Simulated Live TopBar */}
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="glass-pill-dark flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5 border border-white/20">
                  <NucleusMark size={20} />
                  <span className="font-display text-xs font-semibold text-white">Nucleus Deck</span>
                  <span className="text-[10px] text-zinc-400">· Ready</span>
                </div>
              </div>

              {/* Center status */}
              <div className="hidden items-center gap-2 font-mono text-[11px] text-zinc-400 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>COMMAND MODE ACTIVE</span>
              </div>

              {/* Right clock & weather */}
              <div className="glass-pill-dark flex items-center gap-3 rounded-full py-1.5 px-3 border border-white/15 text-[11px] font-mono text-zinc-300">
                <span>09:41 AM</span>
                <span className="text-zinc-600">|</span>
                <span className="flex items-center gap-1">
                  <Icon name="CloudSun" size={13} />
                  24°C
                </span>
              </div>
            </div>

            {/* Dashboard Workspace Mock Layout */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Mini sidebar representation */}
              <div className="hidden flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 lg:col-span-1 lg:flex">
                {["Home", "Sparkles", "Stethoscope", "TrendingUp", "Youtube", "Dices", "Settings"].map((ic, i) => (
                  <div
                    key={ic}
                    className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
                      i === 0 ? "bg-white text-black shadow-md" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <Icon name={ic} size={15} />
                  </div>
                ))}
              </div>

              {/* Main content grid */}
              <div className="flex flex-col gap-4 lg:col-span-11">
                {/* 4 Quick Stat Tiles */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "TASKS REMAINING", val: "3", sub: "1 high priority", icon: "CheckSquare" },
                    { label: "HABITS STREAK", val: "5/6", sub: "83% completion", icon: "Flame" },
                    { label: "FOCUS TIME", val: "50m", sub: "2 intervals completed", icon: "Timer" },
                    { label: "HYDRATION", val: "2.1L", sub: "Goal 2.5L", icon: "Droplets" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="glass-pill-dark flex flex-col justify-between rounded-2xl border border-white/10 p-3.5"
                    >
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="font-mono text-[9px] tracking-wider uppercase">{stat.label}</span>
                        <Icon name={stat.icon} size={13} className="text-white/60" />
                      </div>
                      <div className="my-1 font-display text-2xl font-semibold text-white">{stat.val}</div>
                      <div className="text-[10px] text-zinc-400">{stat.sub}</div>
                    </div>
                  ))}
                </div>

                {/* 3 Main Feature Columns */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Task Card Preview */}
                  <div className="glass-pill-dark rounded-2xl border border-white/10 p-4">
                    <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-display text-xs font-semibold text-white">Priority Queue</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                        AI Plan Ready
                      </span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { text: "Review Phase II pharmacology notes", done: true, priority: "High" },
                        { text: "Complete clinical case summary", done: false, priority: "High" },
                        { text: "Check crypto portfolio & stocks", done: false, priority: "Normal" },
                      ].map((task, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] p-2 text-xs"
                        >
                          <div
                            className={`h-3.5 w-3.5 rounded border ${
                              task.done ? "border-white bg-white text-black" : "border-white/30"
                            } grid place-items-center`}
                          >
                            {task.done && <Icon name="Check" size={10} />}
                          </div>
                          <span
                            className={`flex-1 truncate ${
                              task.done ? "text-zinc-500 line-through" : "text-zinc-200"
                            }`}
                          >
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Focus Pomodoro Preview */}
                  <div className="glass-pill-dark flex flex-col items-center justify-between rounded-2xl border border-white/10 p-4 text-center">
                    <div className="flex w-full items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-display text-xs font-semibold text-white">Focus Engine</span>
                      <span className="text-[10px] font-mono text-emerald-400">● RUNNING</span>
                    </div>

                    <div className="relative my-2 grid h-24 w-24 place-items-center">
                      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#ffffff"
                          strokeWidth="6"
                          strokeDasharray="264"
                          strokeDashoffset="66"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="font-display text-lg font-semibold text-white">21:40</span>
                        <span className="text-[8px] font-mono uppercase text-zinc-400">Deep Work</span>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-center gap-2">
                      <div className="rounded-full bg-white px-3 py-1 text-[10px] font-medium text-black">Pause</div>
                      <div className="rounded-full border border-white/20 px-3 py-1 text-[10px] text-zinc-300">Reset</div>
                    </div>
                  </div>

                  {/* Mood & Living Aura Preview */}
                  <div className="glass-pill-dark rounded-2xl border border-white/10 p-4">
                    <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-display text-xs font-semibold text-white">Living Emotion</span>
                      <span className="font-mono text-[10px] text-zinc-400">Optimal 84%</span>
                    </div>
                    <div className="relative flex flex-col items-center py-2">
                      <div className="pointer-events-none absolute h-20 w-20 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
                      <span className="text-3xl">🧘‍♂️</span>
                      <span className="mt-2 text-xs font-medium text-white">Focused & Calm</span>
                      <div className="mt-2 flex w-full items-center justify-center gap-1">
                        {[40, 65, 80, 55, 90, 75, 85].map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 rounded-full bg-white/40"
                            style={{ height: `${h * 0.25}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Live Interaction Callout Banner */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
              <Link
                href="/deck"
                className="liquid-btn flex items-center gap-3 rounded-full border border-white/60 bg-white/20 px-7 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-2xl transition hover:scale-105 hover:bg-white/30"
              >
                <span>ENTER LIVE COMMAND DECK</span>
                <Icon name="ArrowRight" size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
