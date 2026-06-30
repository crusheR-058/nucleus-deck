"use client";

import { useEffect, useRef, useState } from "react";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { RadialRing } from "@/components/charts/Charts";
import { Icon } from "@/components/ui/Icon";
import { cn, mmss } from "@/lib/utils";

const FOCUS = 25 * 60;
const BREAK = 5 * 60;

export function FocusTimerCard({ delay = 0, variant = "frosted" }: { delay?: number; variant?: "frosted" | "charcoal" }) {
  const completePomodoro = useDeck((s) => s.completePomodoro);
  const completedToday = useDeck((s) => s.focus.completedToday);
  const dark = variant === "charcoal";

  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [left, setLeft] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval>>();
  const total = mode === "focus" ? FOCUS : BREAK;

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setLeft((s) => {
        if (s > 1) return s - 1;
        // phase complete
        if (mode === "focus") {
          completePomodoro(25);
          setMode("break");
          return BREAK;
        }
        setMode("focus");
        setRunning(false);
        return FOCUS;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running, mode, completePomodoro]);

  const reset = () => {
    setRunning(false);
    setLeft(mode === "focus" ? FOCUS : BREAK);
  };
  const skip = () => {
    setRunning(false);
    if (mode === "focus") {
      setMode("break");
      setLeft(BREAK);
    } else {
      setMode("focus");
      setLeft(FOCUS);
    }
  };

  const pct = ((total - left) / total) * 100;

  return (
    <GlassCard delay={delay} depth={3} variant={variant} className="flex flex-col">
      <CardHeader iconName="Timer" eyebrow="Deep work" title="Focus" tone={dark ? "dark" : "light"} />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-1">
        <RadialRing
          value={pct}
          size={172}
          stroke={13}
          tone={dark ? "dark" : "light"}
          center={
            <div className="flex flex-col items-center">
              <span className={cn("tabular font-display text-4xl font-medium tracking-tight", dark ? "text-white" : "text-strong")}>
                {mmss(left)}
              </span>
              <span className={cn("mt-1 text-[11px] uppercase tracking-[0.25em]", dark ? "text-white/55" : "text-faint")}>
                {mode === "focus" ? "Focus" : "Break"}
              </span>
            </div>
          }
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? "Pause" : "Start"}
            className={cn(
              "grid h-14 w-14 place-items-center rounded-full transition active:scale-90",
              dark ? "bg-white text-[#09090b]" : "bg-ink text-white",
              "shadow-[0_12px_30px_-12px_rgba(8,8,12,0.7)] hover:scale-105",
            )}
          >
            <Icon name={running ? "Pause" : "Play"} size={22} strokeWidth={2.2} />
          </button>
          <button
            onClick={reset}
            aria-label="Reset"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full border transition active:scale-90 hover:scale-105",
              dark ? "border-white/15 bg-white/8 text-white/80" : "border-graphite/30 bg-white/50 text-strong",
            )}
          >
            <Icon name="RotateCcw" size={18} />
          </button>
          <button
            onClick={skip}
            aria-label="Skip phase"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full border transition active:scale-90 hover:scale-105",
              dark ? "border-white/15 bg-white/8 text-white/80" : "border-graphite/30 bg-white/50 text-strong",
            )}
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t pt-3" style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(8,8,12,0.1)" }}>
        <span className={cn("text-[12px]", dark ? "text-white/55" : "text-muted")}>Sessions today</span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.max(4, completedToday) }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                i < completedToday ? (dark ? "bg-white" : "bg-ink") : dark ? "bg-white/15" : "bg-ink/12",
              )}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
