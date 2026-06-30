"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useDeck } from "@/lib/store";
import { MOODS, MOOD_ORDER } from "@/lib/constants";
import type { MoodKey } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { LiquidArea } from "@/components/charts/Charts";
import { Waveform } from "@/components/charts/Waveform";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

function moodScore(key: MoodKey, intensity: number) {
  return Math.round(MOODS[key].score * (0.55 + 0.45 * (intensity / 100)));
}

export function MoodCard({ delay = 0 }: { delay?: number }) {
  const moods = useDeck((s) => s.moods);
  const addMood = useDeck((s) => s.addMood);

  const last = moods[moods.length - 1];
  const [selected, setSelected] = useState<MoodKey>(last?.key ?? "calm");
  const [intensity, setIntensity] = useState<number>(last?.intensity ?? 70);
  const [justLogged, setJustLogged] = useState(false);

  const meta = MOODS[selected];
  const series = useMemo(() => {
    const s = moods.slice(-16).map((m) => moodScore(m.key, m.intensity));
    return s.length >= 2 ? s : [...s, moodScore(selected, intensity)];
  }, [moods, selected, intensity]);

  const trendDelta =
    series.length >= 2 ? series[series.length - 1] - series[Math.max(0, series.length - 4)] : 0;

  const checkIn = () => {
    addMood(selected, intensity);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1800);
  };

  return (
    <GlassCard delay={delay} depth={3.5} variant="charcoal" className="group flex flex-col">
      <CardHeader
        iconName="SmilePlus"
        eyebrow="Emotion"
        title="How are you?"
        tone="dark"
        right={
          <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">
            <Icon name={trendDelta >= 0 ? "TrendingUp" : "ChevronDown"} size={12} />
            {trendDelta >= 0 ? "+" : ""}
            {trendDelta}
          </span>
        }
      />

      {/* Stage */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/8 bg-black/25 px-4 py-6">
        {/* aura */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute"
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 220,
            height: 220,
            borderRadius: "9999px",
            background: `radial-gradient(circle, rgba(255,255,255,${0.25 + (intensity / 100) * 0.4}), transparent 62%)`,
            filter: "blur(8px)",
          }}
        />

        {/* emoji */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={selected}
            initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0, rotate: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative z-10"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="select-none text-[88px] leading-none drop-shadow-[0_14px_30px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-110"
              style={{ filter: "drop-shadow(0 0 22px rgba(255,255,255,0.25))" }}
            >
              {meta.emoji}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* score */}
        <div className="relative z-10 mt-3 flex flex-col items-center">
          <div className="font-display text-lg font-medium text-white">{meta.label}</div>
          <div className="text-[12px] text-white/55">{meta.blurb}</div>
        </div>

        {/* waveform */}
        <div className="relative z-10 mt-4 w-full max-w-[260px] opacity-90">
          <Waveform amp={meta.waveAmp} speed={meta.waveSpeed} tone="dark" />
        </div>

        {/* intensity badge */}
        <div className="absolute right-4 top-4 z-10 text-right">
          <div className="tabular font-display text-3xl font-medium leading-none text-white">{intensity}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">intensity</div>
        </div>
      </div>

      {/* picker */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {MOOD_ORDER.map((k) => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            aria-label={MOODS[k].label}
            title={MOODS[k].label}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full text-xl transition",
              selected === k ? "scale-110 bg-white/15 ring-1 ring-white/40" : "opacity-55 hover:opacity-100",
            )}
          >
            {MOODS[k].emoji}
          </button>
        ))}
      </div>

      {/* intensity slider + check-in */}
      <div className="mt-4 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          aria-label="Intensity"
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-white"
        />
        <button
          onClick={checkIn}
          className={cn(
            "liquid-btn liquid-btn-dark inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium",
            justLogged && "!bg-white !text-[#09090b]",
          )}
        >
          <Icon name={justLogged ? "Check" : "SmilePlus"} size={15} />
          {justLogged ? "Logged" : "Check in"}
        </button>
      </div>

      {/* trend */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="label-eyebrow">Mood trend</span>
          <span className="text-[11px] text-white/45">{moods.length} check-ins</span>
        </div>
        <LiquidArea values={series} tone="dark" height={64} />
      </div>
    </GlassCard>
  );
}
