"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { BetInput } from "./BetInput";

const CHIPS = [50, 100, 500];

export function Crash() {
  const chips = useDeck((s) => s.casinoChips);
  const adjust = useDeck((s) => s.adjustChips);
  const [phase, setPhase] = useState<"bet" | "running" | "done">("bet");
  const [mult, setMult] = useState(1);
  const [bet, setBet] = useState(100);
  const [msg, setMsg] = useState("Cash out before it crashes.");
  const crashRef = useRef(0);
  const ivRef = useRef<ReturnType<typeof setInterval>>();
  const cashedRef = useRef(false);

  const start = () => {
    if (phase === "running" || bet > chips) {
      if (bet > chips) setMsg("Not enough chips.");
      return;
    }
    adjust(-bet);
    cashedRef.current = false;
    const r = Math.random();
    crashRef.current = r < 0.02 ? 1 : Math.max(1, 0.99 / (1 - r));
    setMult(1);
    setPhase("running");
    setMsg("Rising… cash out!");
    let m = 1;
    ivRef.current = setInterval(() => {
      m = m * 1.012 + 0.002;
      if (m >= crashRef.current) {
        clearInterval(ivRef.current);
        setMult(crashRef.current);
        setPhase("done");
        if (!cashedRef.current) setMsg(`Crashed at ${crashRef.current.toFixed(2)}× — you lose ${bet}`);
        return;
      }
      setMult(m);
    }, 60);
  };

  const cashOut = () => {
    if (phase !== "running" || cashedRef.current) return;
    cashedRef.current = true;
    clearInterval(ivRef.current);
    const win = Math.round(bet * mult);
    adjust(win);
    setPhase("done");
    setMsg(`Cashed out at ${mult.toFixed(2)}× — +${win}`);
  };

  const crashed = phase === "done" && !cashedRef.current;
  const barPct = Math.min(100, (mult - 1) * 18);

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader iconName="Rocket" eyebrow="Cash out in time" title="Crash" />

      <div className="relative mb-4 h-40 overflow-hidden rounded-2xl border border-ink/10 bg-white/40">
        <div
          className={cn("absolute bottom-0 left-0 w-full transition-all duration-75", crashed ? "bg-ink/10" : "bg-ink/15")}
          style={{ height: `${barPct}%` }}
        />
        <div className="absolute inset-0 grid place-items-center">
          <motion.div
            key={crashed ? "x" : "m"}
            animate={{ scale: phase === "running" ? [1, 1.04, 1] : 1 }}
            transition={{ repeat: phase === "running" ? Infinity : 0, duration: 0.5 }}
            className={cn(
              "tabular font-display text-5xl font-semibold",
              crashed ? "text-faint line-through" : "text-strong",
            )}
          >
            {mult.toFixed(2)}×
          </motion.div>
        </div>
        <Icon
          name="Rocket"
          size={20}
          className={cn(
            "absolute left-1/2 -translate-x-1/2 transition-all duration-75",
            crashed ? "text-faint" : "text-strong",
          )}
          style={{ bottom: `calc(${barPct}% - 10px)` }}
        />
      </div>

      <p className="mb-4 text-center text-[13.5px] text-body">{msg}</p>

      <div className="flex flex-wrap items-center gap-3">
        {phase === "running" ? (
          <button
            onClick={cashOut}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-6 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95"
          >
            <Icon name="Coins" size={14} /> Cash out {Math.round(bet * mult)}
          </button>
        ) : (
          <>
            <BetInput value={bet} onChange={setBet} chips={chips} presets={CHIPS} />
            <button
              onClick={start}
              disabled={bet > chips}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
            >
              <Icon name="Rocket" size={14} /> Bet {bet}
            </button>
          </>
        )}
      </div>
    </GlassCard>
  );
}
