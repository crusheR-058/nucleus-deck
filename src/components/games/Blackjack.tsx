"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { BetInput } from "./BetInput";

type Suit = "♠" | "♥" | "♦" | "♣";
interface PCard {
  rank: string;
  suit: Suit;
}

const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const CHIPS = [25, 50, 100, 250];

function freshDeck(): PCard[] {
  const d: PCard[] = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ rank: r, suit: s });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}
const cardVal = (r: string) => (r === "A" ? 11 : ["K", "Q", "J"].includes(r) ? 10 : parseInt(r));
function handValue(cards: PCard[]) {
  let total = cards.reduce((a, c) => a + cardVal(c.rank), 0);
  let aces = cards.filter((c) => c.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

type Phase = "bet" | "player" | "done";

export function Blackjack() {
  const chips = useDeck((s) => s.casinoChips);
  const adjustChips = useDeck((s) => s.adjustChips);

  const [deck, setDeck] = useState<PCard[]>([]);
  const [player, setPlayer] = useState<PCard[]>([]);
  const [dealer, setDealer] = useState<PCard[]>([]);
  const [phase, setPhase] = useState<Phase>("bet");
  const [bet, setBet] = useState(50);
  const [msg, setMsg] = useState("Place your bet and deal.");

  // Net settlement (nothing is deducted at deal; we apply the result once here).
  const settle = (p: PCard[], de: PCard[], stake: number) => {
    const pv = handValue(p);
    const dv = handValue(de);
    const pBJ = pv === 21 && p.length === 2;
    const dBJ = dv === 21 && de.length === 2;
    let net = 0;
    let m = "";
    if (pv > 21) {
      net = -stake;
      m = `Bust — you lose ${stake}`;
    } else if (pBJ && !dBJ) {
      net = Math.round(stake * 1.5);
      m = `Blackjack! +${net}`;
    } else if (dBJ && !pBJ) {
      net = -stake;
      m = `Dealer blackjack — you lose ${stake}`;
    } else if (dv > 21) {
      net = stake;
      m = `Dealer busts — you win +${stake}`;
    } else if (pv > dv) {
      net = stake;
      m = `You win +${stake}`;
    } else if (pv < dv) {
      net = -stake;
      m = `You lose ${stake}`;
    } else {
      m = "Push — bet returned";
    }
    adjustChips(net);
    setMsg(m);
    setPhase("done");
  };

  const dealerPlay = (p: PCard[], d: PCard[], stake: number) => {
    const de = [...dealer];
    while (handValue(de) < 17) de.push(d.pop()!);
    setDealer(de);
    setDeck(d);
    settle(p, de, stake);
  };

  const deal = () => {
    if (bet <= 0 || bet > chips) {
      setMsg("Not enough chips for that bet.");
      return;
    }
    const d = freshDeck();
    const p = [d.pop()!, d.pop()!];
    const de = [d.pop()!, d.pop()!];
    setDeck(d);
    setPlayer(p);
    setDealer(de);
    if (handValue(p) === 21 || handValue(de) === 21) {
      settle(p, de, bet); // natural blackjack(s) resolve immediately
    } else {
      setPhase("player");
      setMsg("Hit, stand, or double.");
    }
  };

  const hit = () => {
    const d = [...deck];
    const p = [...player, d.pop()!];
    setDeck(d);
    setPlayer(p);
    const v = handValue(p);
    if (v > 21) settle(p, dealer, bet);
    else if (v === 21) dealerPlay(p, d, bet);
  };

  const stand = () => dealerPlay(player, deck, bet);

  const double = () => {
    if (bet * 2 > chips) {
      setMsg("Not enough chips to double.");
      return;
    }
    const d = [...deck];
    const p = [...player, d.pop()!];
    setDeck(d);
    setPlayer(p);
    if (handValue(p) > 21) settle(p, dealer, bet * 2);
    else dealerPlay(p, d, bet * 2);
  };

  const hideHole = phase === "player";
  const canDouble = phase === "player" && player.length === 2 && bet * 2 <= chips;

  return (
    <GlassCard depth={2} delay={0.05}>
      {/* Dealer */}
      <div className="mb-5">
        <div className="label-eyebrow mb-2">
          Dealer {!hideHole && dealer.length > 0 && <span className="text-faint">· {handValue(dealer)}</span>}
        </div>
        <div className="flex gap-2">
          {dealer.length === 0 && <EmptySlot />}
          {dealer.map((c, i) => (
            <CardFace key={i} card={c} hidden={hideHole && i === 1} index={i} />
          ))}
        </div>
      </div>

      {/* Player */}
      <div className="mb-5">
        <div className="label-eyebrow mb-2">
          You {player.length > 0 && <span className="text-faint">· {handValue(player)}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {player.length === 0 && <EmptySlot />}
          {player.map((c, i) => (
            <CardFace key={i} card={c} index={i} />
          ))}
        </div>
      </div>

      <p className="mb-4 text-[13.5px] text-body">{msg}</p>

      {/* Controls */}
      {phase === "player" ? (
        <div className="flex flex-wrap gap-2">
          <ActionBtn onClick={hit} icon="Plus" label="Hit" primary />
          <ActionBtn onClick={stand} icon="Check" label="Stand" />
          {canDouble && <ActionBtn onClick={double} icon="ArrowUpRight" label={`Double (${bet * 2})`} />}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <BetInput value={bet} onChange={setBet} chips={chips} presets={CHIPS} />
          <ActionBtn onClick={deal} icon="Spade" label={phase === "done" ? "Deal again" : "Deal"} primary />
        </div>
      )}
    </GlassCard>
  );
}

function ActionBtn({ onClick, icon, label, primary }: { onClick: () => void; icon: string; label: string; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition active:scale-95",
        primary ? "bg-ink text-white hover:opacity-90" : "border border-ink/15 bg-white/50 text-strong hover:bg-white/75",
      )}
    >
      <Icon name={icon} size={14} /> {label}
    </button>
  );
}

function EmptySlot() {
  return <div className="h-24 w-16 rounded-xl border border-dashed border-ink/15 bg-white/20" />;
}

function CardFace({ card, hidden, index }: { card: PCard; hidden?: boolean; index: number }) {
  if (hidden) {
    return (
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ delay: index * 0.06 }}
        className="grid h-24 w-16 place-items-center rounded-xl border border-white/15 bg-ink text-2xl text-white/25"
      >
        ✦
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      className="relative grid h-24 w-16 place-items-center rounded-xl border border-ink/15 bg-white text-[#09090b] shadow-[0_6px_16px_-8px_rgba(8,8,12,0.5)]"
    >
      <span className="absolute left-1.5 top-1 text-[12px] font-semibold leading-none">{card.rank}</span>
      <span className="text-2xl leading-none">{card.suit}</span>
      <span className="absolute bottom-1 right-1.5 rotate-180 text-[12px] font-semibold leading-none">{card.rank}</span>
    </motion.div>
  );
}
