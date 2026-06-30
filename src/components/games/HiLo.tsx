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
const EDGE = 0.97;

export function HiLo() {
  const chips = useDeck((s) => s.casinoChips);
  const adjust = useDeck((s) => s.adjustChips);

  const [deck, setDeck] = useState<Card[]>([]);
  const [current, setCurrent] = useState<Card | null>(null);
  const [playing, setPlaying] = useState(false);
  const [bet, setBet] = useState(100);
  const [mult, setMult] = useState(1);
  const [msg, setMsg] = useState("Place a bet and start.");

  const draw = (d: Card[]): [Card, Card[]] => {
    let deckArr = d;
    if (deckArr.length < 5) deckArr = freshDeck();
    const nd = [...deckArr];
    return [nd.pop()!, nd];
  };

  const start = () => {
    if (playing || bet > chips) {
      if (bet > chips) setMsg("Not enough chips.");
      return;
    }
    adjust(-bet);
    const [c, nd] = draw(freshDeck());
    setDeck(nd);
    setCurrent(c);
    setMult(1);
    setPlaying(true);
    setMsg("Higher or lower than the card?");
  };

  const idx = current ? rankIndex(current.rank) : 0;
  const pHigher = (12 - idx) / 13;
  const pLower = idx / 13;
  const stepHigher = pHigher > 0 ? EDGE / pHigher : 0;
  const stepLower = pLower > 0 ? EDGE / pLower : 0;

  const guess = (dir: "hi" | "lo") => {
    if (!playing || !current) return;
    const [next, nd] = draw(deck);
    const ni = rankIndex(next.rank);
    const correct = dir === "hi" ? ni > idx : ni < idx;
    setCurrent(next);
    setDeck(nd);
    if (correct) {
      const step = dir === "hi" ? stepHigher : stepLower;
      const m = mult * step;
      setMult(m);
      setMsg(`${next.rank} — correct! Bank ${Math.round(bet * m)} or keep going.`);
    } else {
      setPlaying(false);
      setMult(1);
      setMsg(`${next.rank} — wrong. You lose ${bet}.`);
    }
  };

  const cashOut = () => {
    if (!playing) return;
    const win = Math.round(bet * mult);
    adjust(win);
    setPlaying(false);
    setMsg(`Cashed out +${win} (${mult.toFixed(2)}×).`);
    setMult(1);
  };

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader iconName="ArrowUpDown" eyebrow="Higher or lower" title="Hi-Lo" />

      <div className="mb-4 flex items-center justify-center gap-5">
        {current ? <PlayingCard card={current} /> : <PlayingCard hidden />}
        {playing && (
          <div className="text-center">
            <div className="tabular font-display text-3xl font-semibold text-strong">{mult.toFixed(2)}×</div>
            <div className="text-[11px] text-faint">cash out {Math.round(bet * mult)}</div>
          </div>
        )}
      </div>

      <p className="mb-4 text-center text-[13.5px] text-body">{msg}</p>

      {playing ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => guess("hi")}
            disabled={stepHigher === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-30"
          >
            <Icon name="ChevronUp" size={15} /> Higher {stepHigher > 0 && `(${stepHigher.toFixed(2)}×)`}
          </button>
          <button
            onClick={() => guess("lo")}
            disabled={stepLower === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-30"
          >
            <Icon name="ChevronDown" size={15} /> Lower {stepLower > 0 && `(${stepLower.toFixed(2)}×)`}
          </button>
          <button
            onClick={cashOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/50 px-4 py-2.5 text-[13px] font-medium text-strong transition hover:bg-white/75"
          >
            <Icon name="Coins" size={14} /> Cash out
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <BetInput value={bet} onChange={setBet} chips={chips} presets={CHIPS} />
          <button
            onClick={start}
            disabled={bet > chips}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
          >
            <Icon name="Play" size={14} /> Deal {bet}
          </button>
        </div>
      )}
    </GlassCard>
  );
}
