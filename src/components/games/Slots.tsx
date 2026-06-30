"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { BetInput } from "./BetInput";

const SYMBOLS = ["7", "★", "◆", "♣", "●", "▲"];
const CHIPS = [100, 500, 2500];

function payout(r: string[]) {
  if (r[0] === r[1] && r[1] === r[2]) return r[0] === "7" ? 50 : 12;
  if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) return 2;
  return 0;
}

export function Slots() {
  const chips = useDeck((s) => s.casinoChips);
  const adjust = useDeck((s) => s.adjustChips);
  const [reels, setReels] = useState(["7", "★", "◆"]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const [msg, setMsg] = useState("Match symbols to win. Three 7s pays 50×.");
  const ivs = useRef<ReturnType<typeof setInterval>[]>([]);

  const spin = () => {
    if (spinning) return;
    if (bet > chips) {
      setMsg("Not enough chips.");
      return;
    }
    adjust(-bet);
    setSpinning(true);
    setMsg("Spinning…");
    const final = [0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    ivs.current.forEach(clearInterval);
    ivs.current = [];
    [0, 1, 2].forEach((i) => {
      const iv = setInterval(() => {
        setReels((prev) => {
          const n = [...prev];
          n[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          return n;
        });
      }, 80);
      ivs.current.push(iv);
      setTimeout(() => {
        clearInterval(iv);
        setReels((prev) => {
          const n = [...prev];
          n[i] = final[i];
          return n;
        });
        if (i === 2) {
          const mult = payout(final);
          if (mult > 0) {
            adjust(bet * mult);
            setMsg(`${mult}× — you win +${bet * mult}`);
          } else setMsg("No match — spin again.");
          setSpinning(false);
        }
      }, 700 + i * 450);
    });
  };

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader iconName="Cherry" eyebrow="Reels" title="Slots" />
      <div className="mb-4 flex justify-center gap-3">
        {reels.map((sym, i) => (
          <div
            key={i}
            className="grid h-24 w-20 place-items-center overflow-hidden rounded-2xl border border-ink/15 bg-white/70"
          >
            <motion.span
              key={sym + i + (spinning ? "s" : "")}
              initial={{ y: spinning ? -12 : 0, opacity: spinning ? 0.5 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-display text-4xl font-semibold text-[#09090b]"
            >
              {sym}
            </motion.span>
          </div>
        ))}
      </div>

      <p className="mb-4 text-center text-[13.5px] text-body">{msg}</p>

      <div className="flex flex-wrap items-center gap-3">
        <BetInput value={bet} onChange={setBet} chips={chips} presets={CHIPS} disabled={spinning} />
        <button
          onClick={spin}
          disabled={spinning || bet > chips}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          <Icon name="RefreshCw" size={14} className={spinning ? "animate-spin" : ""} /> Spin {bet}
        </button>
        <span className="ml-auto text-[11px] text-faint">3× same = 12× · 3× seven = 50× · pair = 2×</span>
      </div>
    </GlassCard>
  );
}
