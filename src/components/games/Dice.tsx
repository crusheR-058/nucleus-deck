"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { BetInput } from "./BetInput";

const CHIPS = [50, 100, 500];
type Pick = "under" | "seven" | "over";
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

function Die({ v }: { v: number }) {
  return (
    <div className="grid h-16 w-16 grid-cols-3 grid-rows-3 gap-1 rounded-2xl border border-ink/15 bg-white p-2 shadow-[0_6px_16px_-8px_rgba(8,8,12,0.5)]">
      {Array.from({ length: 9 }).map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const on = PIPS[v]?.some(([c, r]) => c === col && r === row);
        return <span key={i} className={cn("m-auto h-2.5 w-2.5 rounded-full", on ? "bg-[#09090b]" : "bg-transparent")} />;
      })}
    </div>
  );
}

export function Dice() {
  const chips = useDeck((s) => s.casinoChips);
  const adjust = useDeck((s) => s.adjustChips);
  const [dice, setDice] = useState<[number, number]>([3, 4]);
  const [pick, setPick] = useState<Pick>("under");
  const [bet, setBet] = useState(100);
  const [rolling, setRolling] = useState(false);
  const [msg, setMsg] = useState("Bet under, exactly, or over 7.");

  const roll = () => {
    if (rolling || bet > chips) {
      if (bet > chips) setMsg("Not enough chips.");
      return;
    }
    adjust(-bet);
    setRolling(true);
    setMsg("Rolling…");
    let t = 0;
    const iv = setInterval(() => {
      setDice([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]);
      if (++t > 10) {
        clearInterval(iv);
        const d: [number, number] = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
        setDice(d);
        const sum = d[0] + d[1];
        const won = (pick === "under" && sum < 7) || (pick === "over" && sum > 7) || (pick === "seven" && sum === 7);
        const mult = pick === "seven" ? 5 : 2; // exactly-7 pays 4:1 (return 5×), others 1:1 (return 2×)
        if (won) {
          adjust(bet * mult);
          setMsg(`Rolled ${sum} — you win +${bet * mult}`);
        } else setMsg(`Rolled ${sum} — you lose`);
        setRolling(false);
      }
    }, 70);
  };

  const opts: { key: Pick; label: string; pay: string }[] = [
    { key: "under", label: "Under 7", pay: "1:1" },
    { key: "seven", label: "Exactly 7", pay: "4:1" },
    { key: "over", label: "Over 7", pay: "1:1" },
  ];

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader iconName="Dices" eyebrow="Two dice" title="Dice" />
      <div className="mb-4 flex items-center justify-center gap-4">
        <motion.div animate={{ rotate: rolling ? [0, -8, 8, 0] : 0 }} transition={{ repeat: rolling ? Infinity : 0, duration: 0.3 }}>
          <Die v={dice[0]} />
        </motion.div>
        <span className="font-display text-2xl text-faint">+</span>
        <motion.div animate={{ rotate: rolling ? [0, 8, -8, 0] : 0 }} transition={{ repeat: rolling ? Infinity : 0, duration: 0.3 }}>
          <Die v={dice[1]} />
        </motion.div>
        <span className="font-display text-2xl text-faint">=</span>
        <span className="tabular font-display text-3xl font-semibold text-strong">{dice[0] + dice[1]}</span>
      </div>

      <p className="mb-4 text-center text-[13.5px] text-body">{msg}</p>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {opts.map((o) => (
          <button
            key={o.key}
            onClick={() => setPick(o.key)}
            disabled={rolling}
            className={cn(
              "rounded-2xl border p-3 text-center text-[13px] font-medium transition disabled:opacity-50",
              pick === o.key ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/40 text-strong hover:bg-white/70",
            )}
          >
            {o.label}
            <span className="ml-1 text-[10px] opacity-60">{o.pay}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BetInput value={bet} onChange={setBet} chips={chips} presets={CHIPS} disabled={rolling} />
        <button
          onClick={roll}
          disabled={rolling || bet > chips}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          <Icon name="Dices" size={14} /> Roll {bet}
        </button>
      </div>
    </GlassCard>
  );
}
