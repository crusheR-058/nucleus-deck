"use client";

import { useState } from "react";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { freshDeck, rankIndex, type Card } from "@/lib/cards";
import { PlayingCard } from "./PlayingCard";
import { BetInput } from "./BetInput";

const CHIPS = [50, 100, 500];

// Jacks-or-Better pay table, expressed as profit "to 1".
const PAYS: { key: string; label: string; pay: number }[] = [
  { key: "royal", label: "Royal flush", pay: 250 },
  { key: "sflush", label: "Straight flush", pay: 50 },
  { key: "four", label: "Four of a kind", pay: 25 },
  { key: "full", label: "Full house", pay: 9 },
  { key: "flush", label: "Flush", pay: 6 },
  { key: "straight", label: "Straight", pay: 4 },
  { key: "three", label: "Three of a kind", pay: 3 },
  { key: "twopair", label: "Two pair", pay: 2 },
  { key: "jacks", label: "Jacks or better", pay: 1 },
];

function evaluate(cards: Card[]): { key: string; label: string; pay: number } {
  const idxs = cards.map((c) => rankIndex(c.rank)).sort((a, b) => a - b);
  const suits = cards.map((c) => c.suit);
  const flush = suits.every((s) => s === suits[0]);

  const uniq = Array.from(new Set(idxs));
  let straight = false;
  if (uniq.length === 5) {
    if (idxs[4] - idxs[0] === 4) straight = true;
    if (idxs.join(",") === "0,9,10,11,12") straight = true; // A-high (10-J-Q-K-A)
  }
  const aceHigh = idxs.join(",") === "0,9,10,11,12";

  const counts: Record<number, number> = {};
  for (const i of idxs) counts[i] = (counts[i] || 0) + 1;
  const groups = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = groups[0];

  const found = (key: string) => PAYS.find((p) => p.key === key)!;
  if (straight && flush && aceHigh) return found("royal");
  if (straight && flush) return found("sflush");
  if (top[1] === 4) return found("four");
  if (groups[0][1] === 3 && groups[1]?.[1] === 2) return found("full");
  if (flush) return found("flush");
  if (straight) return found("straight");
  if (top[1] === 3) return found("three");
  if (groups[0][1] === 2 && groups[1]?.[1] === 2) return found("twopair");
  if (top[1] === 2) {
    const r = Number(top[0]);
    if (r === 0 || r >= 10) return found("jacks"); // pair of A/J/Q/K
  }
  return { key: "none", label: "No win", pay: 0 };
}

export function VideoPoker() {
  const chips = useDeck((s) => s.casinoChips);
  const adjust = useDeck((s) => s.adjustChips);
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [phase, setPhase] = useState<"bet" | "draw">("bet");
  const [bet, setBet] = useState(100);
  const [msg, setMsg] = useState("Deal, hold cards, then draw.");

  const deal = () => {
    if (bet > chips) {
      setMsg("Not enough chips.");
      return;
    }
    adjust(-bet);
    const d = freshDeck();
    const h = [d.pop()!, d.pop()!, d.pop()!, d.pop()!, d.pop()!];
    setDeck(d);
    setHand(h);
    setHeld([false, false, false, false, false]);
    setPhase("draw");
    setMsg("Tap cards to hold, then Draw.");
  };

  const drawCards = () => {
    const d = [...deck];
    const h = hand.map((c, i) => (held[i] ? c : d.pop()!));
    setDeck(d);
    setHand(h);
    setPhase("bet");
    const r = evaluate(h);
    if (r.pay > 0) {
      adjust(bet * (r.pay + 1));
      setMsg(`${r.label} — you win +${bet * r.pay}`);
    } else {
      setMsg(`${r.label} — try again.`);
    }
  };

  const toggleHold = (i: number) => {
    if (phase !== "draw") return;
    setHeld((h) => h.map((v, j) => (j === i ? !v : v)));
  };

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader iconName="Club" eyebrow="Jacks or Better" title="Video poker" />

      <div className="mb-5 flex justify-center gap-2 pt-1">
        {hand.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <PlayingCard key={i} hidden />)
          : hand.map((c, i) => (
              <PlayingCard key={i} card={c} index={i} selected={held[i]} onClick={() => toggleHold(i)} />
            ))}
      </div>

      <p className="mb-4 text-center text-[13.5px] text-body">{msg}</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {phase === "draw" ? (
          <button
            onClick={drawCards}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95"
          >
            <Icon name="RefreshCw" size={14} /> Draw
          </button>
        ) : (
          <>
            <BetInput value={bet} onChange={setBet} chips={chips} presets={CHIPS} />
            <button
              onClick={deal}
              disabled={bet > chips}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
            >
              <Icon name="Club" size={14} /> Deal {bet}
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 border-t border-ink/10 pt-3 sm:grid-cols-3">
        {PAYS.map((p) => (
          <div key={p.key} className="flex items-baseline justify-between text-[11.5px]">
            <span className="text-muted">{p.label}</span>
            <span className="tabular font-medium text-strong">{p.pay}×</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
