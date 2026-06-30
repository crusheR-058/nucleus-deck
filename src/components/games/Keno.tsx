"use client";

import { useState } from "react";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { BetInput } from "./BetInput";

const POOL = 40; // numbers 1..40
const DRAW = 10; // numbers drawn
const MAX_PICKS = 10;
const CHIPS = [50, 100, 500];

// payout (gross return multiple) by picks -> hits
const PAYS: Record<number, Record<number, number>> = {
  1: { 1: 3 },
  2: { 2: 9 },
  3: { 2: 1, 3: 16 },
  4: { 2: 1, 3: 4, 4: 30 },
  5: { 3: 2, 4: 10, 5: 80 },
  6: { 3: 1, 4: 4, 5: 25, 6: 150 },
  7: { 4: 2, 5: 10, 6: 50, 7: 300 },
  8: { 5: 5, 6: 20, 7: 100, 8: 600 },
  9: { 5: 2, 6: 8, 7: 40, 8: 200, 9: 1200 },
  10: { 5: 2, 6: 6, 7: 20, 8: 80, 9: 400, 10: 2500 },
};

export function Keno() {
  const chips = useDeck((s) => s.casinoChips);
  const adjust = useDeck((s) => s.adjustChips);
  const [picks, setPicks] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [bet, setBet] = useState(100);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("Pick up to 10 numbers.");

  const toggle = (n: number) => {
    if (busy) return;
    setPicks((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < MAX_PICKS ? [...p, n] : p));
  };
  const quickPick = () => {
    if (busy) return;
    const all = Array.from({ length: POOL }, (_, i) => i + 1);
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    setPicks(all.slice(0, MAX_PICKS).sort((a, b) => a - b));
  };

  const play = () => {
    if (busy || picks.length === 0 || bet > chips) {
      if (bet > chips) setMsg("Not enough chips.");
      else if (picks.length === 0) setMsg("Pick at least one number.");
      return;
    }
    adjust(-bet);
    setBusy(true);
    setDrawn([]);
    setMsg("Drawing…");
    const all = Array.from({ length: POOL }, (_, i) => i + 1);
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    const result = all.slice(0, DRAW);
    let shown: number[] = [];
    const iv = setInterval(() => {
      shown = [...shown, result[shown.length]];
      setDrawn([...shown]);
      if (shown.length === DRAW) {
        clearInterval(iv);
        const hits = picks.filter((p) => result.includes(p)).length;
        const mult = PAYS[picks.length]?.[hits] || 0;
        if (mult > 0) {
          adjust(bet * mult);
          setMsg(`${hits}/${picks.length} hits · ${mult}× — you win +${bet * mult}`);
        } else {
          setMsg(`${hits}/${picks.length} hits — no win`);
        }
        setBusy(false);
      }
    }, 140);
  };

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader
        iconName="Hash"
        eyebrow="Pick & draw"
        title="Keno"
        right={
          <button onClick={quickPick} disabled={busy} className="rounded-full border border-ink/15 bg-white/50 px-3 py-1.5 text-[12px] font-medium text-strong transition hover:bg-white/75 disabled:opacity-40">
            Quick pick
          </button>
        }
      />

      <div className="mb-3 grid grid-cols-8 gap-1.5">
        {Array.from({ length: POOL }, (_, i) => i + 1).map((n) => {
          const picked = picks.includes(n);
          const hit = drawn.includes(n);
          return (
            <button
              key={n}
              onClick={() => toggle(n)}
              disabled={busy}
              className={cn(
                "tabular grid aspect-square place-items-center rounded-lg border text-[12px] font-medium transition",
                hit && picked && "border-transparent bg-ink text-white ring-2 ring-ink",
                hit && !picked && "border-ink/30 bg-white/80 text-strong",
                !hit && picked && "border-ink bg-ink/85 text-white",
                !hit && !picked && "border-ink/12 bg-white/40 text-muted hover:bg-white/70",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>

      <p className="mb-3 text-[13.5px] text-body">{msg}</p>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[12px] text-faint">Picked {picks.length}/{MAX_PICKS}</span>
        <BetInput value={bet} onChange={setBet} chips={chips} presets={CHIPS} disabled={busy} />
        <button
          onClick={play}
          disabled={busy || picks.length === 0 || bet > chips}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          <Icon name="Hash" size={14} /> Draw {bet}
        </button>
        {picks.length > 0 && !busy && (
          <button onClick={() => setPicks([])} className="text-[12px] text-muted transition hover:text-strong">
            Clear
          </button>
        )}
      </div>
    </GlassCard>
  );
}
