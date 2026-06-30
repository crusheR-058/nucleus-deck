"use client";

import { useRef, useState } from "react";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { BetInput } from "./BetInput";

const ROWS = 8;
const MULT = [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6]; // ROWS + 1 buckets
const CHIPS = [50, 100, 500];

export function Plinko() {
  const chips = useDeck((s) => s.casinoChips);
  const adjust = useDeck((s) => s.adjustChips);
  const [bet, setBet] = useState(100);
  const [dropping, setDropping] = useState(false);
  const [ball, setBall] = useState<{ row: number; pos: number } | null>(null);
  const [landed, setLanded] = useState<number | null>(null);
  const [msg, setMsg] = useState("Drop the ball into a multiplier.");
  const ivRef = useRef<ReturnType<typeof setInterval>>();

  const drop = () => {
    if (dropping || bet > chips) {
      if (bet > chips) setMsg("Not enough chips.");
      return;
    }
    adjust(-bet);
    setDropping(true);
    setLanded(null);
    setMsg("Dropping…");
    let row = 0;
    let pos = 0; // number of right-moves so far
    setBall({ row: 0, pos: 0 });
    ivRef.current = setInterval(() => {
      if (Math.random() < 0.5) pos += 1;
      row += 1;
      setBall({ row, pos });
      if (row >= ROWS) {
        clearInterval(ivRef.current);
        const bucket = pos; // 0..ROWS
        const mult = MULT[bucket];
        setLanded(bucket);
        const win = Math.round(bet * mult);
        adjust(win);
        setMsg(`${mult}× — ${win >= bet ? "you win" : "you get back"} +${win}`);
        setDropping(false);
      }
    }, 130);
  };

  // ball pixel position (percent)
  const ballLeft = ball ? ((ball.pos - ball.row / 2) / ROWS + 0.5) * 100 : 50;
  const ballTop = ball ? (ball.row / ROWS) * 88 : 0;

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader iconName="Triangle" eyebrow="Drop & bounce" title="Plinko" />

      <div className="relative mx-auto mb-3 h-64 w-full max-w-sm">
        {/* pegs */}
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: r + 2 }).map((_, c) => {
            const left = ((c - (r + 1) / 2) / ROWS + 0.5) * 100;
            const top = (r / ROWS) * 88 + 4;
            return (
              <span
                key={`${r}-${c}`}
                className="absolute h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ink/25"
                style={{ left: `${left}%`, top: `${top}%` }}
              />
            );
          }),
        )}
        {/* ball */}
        {ball && (
          <span
            className="absolute z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-ink shadow transition-all duration-100 ease-linear"
            style={{ left: `${ballLeft}%`, top: `${ballTop}%` }}
          />
        )}
      </div>

      {/* buckets */}
      <div className="mb-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${MULT.length}, minmax(0, 1fr))` }}>
        {MULT.map((m, i) => (
          <div
            key={i}
            className={cn(
              "tabular rounded-lg border py-1.5 text-center text-[11px] font-medium transition",
              landed === i ? "border-transparent bg-ink text-white" : "border-ink/12 bg-white/40 text-strong",
            )}
          >
            {m}×
          </div>
        ))}
      </div>

      <p className="mb-4 text-center text-[13.5px] text-body">{msg}</p>

      <div className="flex flex-wrap items-center gap-3">
        <BetInput value={bet} onChange={setBet} chips={chips} presets={CHIPS} disabled={dropping} />
        <button
          onClick={drop}
          disabled={dropping || bet > chips}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          <Icon name="Triangle" size={14} /> Drop {bet}
        </button>
      </div>
    </GlassCard>
  );
}
