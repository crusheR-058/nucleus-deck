"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/lib/hooks";

const WORLDS = [
  {
    id: "tasks",
    title: "Tasks & Priority Queue",
    subtitle: "Autonomous day planning with priority triage",
    badge: "01 // WORKFLOW",
    icon: "CheckSquare",
    content: (
      <div className="flex h-full flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">
                <Icon name="CheckSquare" size={15} />
              </div>
              <span className="font-display text-sm font-semibold text-white">Today&apos;s Priorities</span>
            </div>
            <button className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white transition hover:bg-white/20">
              <Icon name="Sparkles" size={12} />
              <span>AI Plan My Day</span>
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {[
              { title: "Review Phase II Pathology slide deck", tag: "MBBS", prio: "High", done: true },
              { title: "Synthesize cardiology clinical case notes", tag: "Clinical", prio: "High", done: false },
              { title: "Calibrate crypto stop-loss & equity holdings", tag: "Finance", prio: "Med", done: false },
              { title: "Hydration check: target 2.5L", tag: "Wellness", prio: "Normal", done: true },
            ].map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-4 w-4 place-items-center rounded ${
                      t.done ? "bg-white text-black" : "border border-white/40"
                    }`}
                  >
                    {t.done && <Icon name="Check" size={11} />}
                  </div>
                  <span className={t.done ? "text-zinc-500 line-through" : "text-zinc-200"}>{t.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[9px] text-zinc-400">{t.tag}</span>
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] text-white">{t.prio}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-zinc-400">
          <span>2 OF 4 COMPLETED (50%)</span>
          <span className="text-emerald-400">+12% VS YESTERDAY</span>
        </div>
      </div>
    ),
  },
  {
    id: "focus",
    title: "Focus Pomodoro Engine",
    subtitle: "Distraction-free 25/5 intervals with ambient audio cues",
    badge: "02 // DEEP WORK",
    icon: "Timer",
    content: (
      <div className="flex h-full flex-col items-center justify-between p-6 text-center">
        <div className="flex w-full items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">
              <Icon name="Timer" size={15} />
            </div>
            <span className="font-display text-sm font-semibold text-white">Precision Timer</span>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] text-emerald-300">
            INTERVAL 2/4
          </span>
        </div>

        {/* Circular Dial */}
        <div className="relative my-4 grid h-44 w-44 place-items-center">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#ffffff"
              strokeWidth="5"
              strokeDasharray="276"
              strokeDashoffset="69"
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-display text-4xl font-semibold tracking-tighter text-white">18:45</span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              FLOW STATE ACTIVE
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex w-full items-center justify-center gap-3">
          <button className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-medium text-white transition hover:bg-white/20">
            Pause
          </button>
          <button className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs text-zinc-300 transition hover:bg-white/10">
            Skip Break
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "habits",
    title: "Habit Streak Matrices",
    subtitle: "7-day momentum tracking for immutable daily rituals",
    badge: "03 // MOMENTUM",
    icon: "Flame",
    content: (
      <div className="flex h-full flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">
                <Icon name="Flame" size={15} />
              </div>
              <span className="font-display text-sm font-semibold text-white">Daily Consistency</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">83% WEEKLY TARGET</span>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { name: "Morning Clinical Reading (30m)", streak: 14, days: [1, 1, 1, 1, 1, 1, 1] },
              { name: "Hydration Target 2.5 Liters", streak: 9, days: [1, 1, 1, 1, 1, 1, 0] },
              { name: "Pharmacology Flashcard Recall", streak: 21, days: [1, 1, 1, 1, 1, 1, 1] },
              { name: "Meditation & Breathwork", streak: 5, days: [1, 1, 0, 1, 1, 1, 0] },
            ].map((habit, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-200">{habit.name}</span>
                  <span className="font-mono text-[10px] text-amber-400">🔥 {habit.streak}d streak</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  {habit.days.map((done, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`h-6 w-8 rounded-md transition-all ${
                        done ? "bg-white text-black font-mono text-[9px] flex items-center justify-center font-bold" : "border border-white/10 bg-white/[0.04]"
                      }`}
                    >
                      {done ? "✓" : ""}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 font-mono text-[10px] text-zinc-500">
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
          <span>SUN</span>
        </div>
      </div>
    ),
  },
  {
    id: "mood",
    title: "Living Emotion & Aura",
    subtitle: "Affective resonance tracking with real-time biometric waveform",
    badge: "04 // WELLNESS",
    icon: "Smile",
    content: (
      <div className="flex h-full flex-col items-center justify-between p-6 text-center">
        <div className="flex w-full items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">
              <Icon name="Smile" size={15} />
            </div>
            <span className="font-display text-sm font-semibold text-white">Emotion State</span>
          </div>
          <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
            Aura: Serene
          </span>
        </div>

        {/* 3D Emoji & Aura */}
        <div className="relative my-3 flex flex-col items-center">
          <div className="pointer-events-none absolute h-36 w-36 rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/25 to-purple-500/20 blur-2xl animate-pulse" />
          <div className="relative grid h-24 w-24 place-items-center rounded-full border border-white/30 bg-white/5 backdrop-blur-md">
            <span className="text-5xl">⚡</span>
          </div>
          <span className="mt-3 font-display text-lg font-medium text-white">Deep Clarity</span>
          <span className="text-xs text-zinc-400">High focus, low cognitive fatigue</span>
        </div>

        {/* Dynamic Waveform */}
        <div className="flex w-full items-end justify-center gap-1.5 h-12">
          {[20, 35, 60, 85, 95, 75, 55, 70, 90, 65, 45, 80, 100, 70, 40].map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-white/20 to-white"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "hydration",
    title: "Hydration & Temporal Agenda",
    subtitle: "Precision fluid intake tracking & next scheduled commitments",
    badge: "05 // EQUILIBRIUM",
    icon: "Droplets",
    content: (
      <div className="flex h-full flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">
                <Icon name="Droplets" size={15} />
              </div>
              <span className="font-display text-sm font-semibold text-white">Fluid & Schedule</span>
            </div>
            <span className="font-mono text-[10px] text-cyan-400">84% GOAL MET</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* Water card */}
            <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <div className="font-display text-2xl font-bold text-white">2.1L</div>
              <span className="font-mono text-[9px] text-zinc-400">OF 2.5L DAILY GOAL</span>
              <div className="mt-2.5 flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((cup) => (
                  <div
                    key={cup}
                    className={`h-4 w-3 rounded-sm ${cup <= 6 ? "bg-white" : "border border-white/30"}`}
                  />
                ))}
              </div>
            </div>

            {/* Upcoming Agenda */}
            <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <span className="font-mono text-[9px] text-zinc-400 uppercase">NEXT EVENT</span>
              <div className="text-xs font-semibold text-white">Hospital Clinical Rounds</div>
              <span className="font-mono text-[10px] text-zinc-400">11:30 AM · Ward 4B</span>
            </div>
          </div>

          {/* Quick links summary */}
          <div className="mt-3 space-y-1.5">
            {[
              { title: "PubMed Medical Library", url: "ncbi.nlm.nih.gov", icon: "BookOpen" },
              { title: "CoinGecko Portfolio Live", url: "coingecko.com", icon: "TrendingUp" },
            ].map((link, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2 text-xs text-zinc-300"
              >
                <div className="flex items-center gap-2">
                  <Icon name={link.icon} size={13} className="text-white/60" />
                  <span>{link.title}</span>
                </div>
                <span className="font-mono text-[9px] text-zinc-500">{link.url}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] font-mono text-zinc-500">
          <span>ALL DATA ENCRYPTED LOCALLY</span>
          <span>NO TELEMETRY</span>
        </div>
      </div>
    ),
  },
];

export function DailyScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [activeTab, setActiveTab] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate current active world index [0..4] based on scroll
  const scrollIndex = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 1, 2, 3, 4]);

  return (
    <div ref={containerRef} id="scene-day" className="relative h-[300vh] w-full">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8">
        {/* Section Header */}
        <div className="pointer-events-none absolute top-16 z-20 mx-auto text-center">
          <div className="label-eyebrow text-white/50 mb-1.5">SCENE 05 // TEMPORAL RHYTHM</div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-white sm:text-4xl">
            Your day, in one view.
          </h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Continuous spatial carousel: Scroll through your tasks, focus, habits, mood and hydration.
          </p>
        </div>

        {/* 3D Spatial Carousel Stage */}
        <div className="relative flex h-[480px] w-full max-w-[620px] items-center justify-center perspective-1200 preserve-3d">
          {WORLDS.map((world, i) => (
            <SpatialCarouselCard
              key={world.id}
              world={world}
              index={i}
              scrollIndex={scrollIndex}
              manualIndex={activeTab}
              reduced={reduced}
            />
          ))}
        </div>

        {/* Interactive World Switcher Pills */}
        <div className="z-30 mt-6 flex flex-wrap items-center justify-center gap-2">
          {WORLDS.map((w, idx) => (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                setActiveTab(idx);
                if (containerRef.current) {
                  const targetScroll = containerRef.current.offsetTop + (containerRef.current.offsetHeight - window.innerHeight) * (idx / (WORLDS.length - 1));
                  window.scrollTo({ top: targetScroll, behavior: "smooth" });
                }
              }}
              className="glass-pill-dark group flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-zinc-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <Icon name={w.icon} size={13} />
              <span>{w.title.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpatialCarouselCard({
  world,
  index,
  scrollIndex,
  reduced,
}: {
  world: any;
  index: number;
  scrollIndex: any;
  manualIndex: number;
  reduced: boolean;
}) {
  // Transform scroll progress distance into 3D position
  const x = useTransform(scrollIndex, (curr: number) => {
    const diff = index - curr;
    return diff * 320; // spread comfortably in px
  });

  const z = useTransform(scrollIndex, (curr: number) => {
    const diff = Math.abs(index - curr);
    return -diff * 180;
  });

  const rotateY = useTransform(scrollIndex, (curr: number) => {
    const diff = index - curr;
    return diff * -12;
  });

  const scale = useTransform(scrollIndex, (curr: number) => {
    const diff = Math.abs(index - curr);
    return Math.max(0.72, 1 - diff * 0.16);
  });

  const opacity = useTransform(scrollIndex, (curr: number) => {
    const diff = Math.abs(index - curr);
    return Math.max(0, 1 - diff * 0.65);
  });

  const zIndex = useTransform(scrollIndex, (curr: number) => {
    return Math.max(1, 10 - Math.round(Math.abs(index - curr) * 2));
  });

  return (
    <motion.div
      style={{
        position: "absolute",
        width: "100%",
        maxWidth: "540px",
        height: "440px",
        x: reduced ? 0 : x,
        z: reduced ? 0 : z,
        scale: reduced ? (index === 0 ? 1 : 0) : scale,
        rotateY: reduced ? 0 : rotateY,
        opacity: reduced ? (index === 0 ? 1 : 0) : opacity,
        zIndex,
        transformStyle: "preserve-3d",
      }}
      className="glass-charcoal bg-[#0c0c10]/95 overflow-hidden rounded-[28px] border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-3xl"
    >
      {/* Internal top specular highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      {world.content}
    </motion.div>
  );
}
