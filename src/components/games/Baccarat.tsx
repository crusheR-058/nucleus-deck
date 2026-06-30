"use client";

import { useState } from "react";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { freshDeck, type Card } from "@/lib/cards";
import { PlayingCard } from "./PlayingCard";
import { BetInput } from "./BetInput";

const CHIPS = [50, 100, 500];
type Bet = "player" | "banker" | "tie";

const val = (c: Card) => (c.rank === "A" ? 1 : ["10", "J", "Q", "K"].includes(c.rank) ? 0 : parseInt(c.rank));
const total = (cards: Card[]) => cards.reduce((a, c) => a + val(c), 0) % 10;

export function Baccarat() {
  const chips = useDeck((s) => s.casinoChips);
  const adjust = useDeck((s) => s.adjustChips);

  const [bet, setBet] = useState<Bet>("player");
  const [amount, setAmount] = useState(100);
  const [player, setPlayer] = useState<Card[]>([]);
  const [banker, setBanker] = useState<Card[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("Bet on Player, Banker, or Tie.");

  const deal = () => {
    if (busy || amount > chips) {
      if (amount > chips) setMsg("Not enough chips.");
      return;
    }
    adjust(-amount);
    setBusy(true);
    const d = freshDeck();
    const p = [d.pop()!, d.pop()!];
    const b = [d.pop()!, d.pop()!];
    let pt = total(p);
    let bt = total(b);

    if (pt < 8 && bt < 8) {
      let p3: Card | undefined;
      if (pt <= 5) {
        p3 = d.pop();
        p.push(p3!);
      }
      const bankerTwo = total(b);
      const drawB = () => b.push(d.pop()!);
      if (p3 === undefined) {
        if (bankerTwo <= 5) drawB();
      } else {
        const v = val(p3);
        if (bankerTwo <= 2) drawB();
        else if (bankerTwo === 3 && v !== 8) drawB();
        else if (bankerTwo === 4 && v >= 2 && v <= 7) drawB();
        else if (bankerTwo === 5 && v >= 4 && v <= 7) drawB();
        else if (bankerTwo === 6 && v >= 6 && v <= 7) drawB();
      }
    }

    pt = total(p);
    bt = total(b);
    setPlayer(p);
    setBanker(b);

    const winner: Bet = pt > bt ? "player" : bt > pt ? "banker" : "tie";
    let net = -amount;
    if (winner === bet) {
      if (bet === "player") net = amount; // 1:1
      else if (bet === "banker") net = Math.round(amount * 0.95); // 5% commission
      else net = amount * 8; // tie 8:1
    } else if (winner === "tie" && bet !== "tie") {
      net = 0; // player/banker push on a tie
    }
    adjust(amount + net > 0 ? amount + net : 0); // return stake + winnings (or 0 if lost)
    // NOTE: we deducted `amount` up front; give back stake+net so the math nets to `net`.
    const resultWord = winner === "player" ? "Player" : winner === "banker" ? "Banker" : "Tie";
    setMsg(
      `${resultWord} wins · P ${pt} – B ${bt} · ${net > 0 ? `+${net}` : net < 0 ? `${net}` : "push"}`,
    );
    setBusy(false);
  };

  const opts: { key: Bet; label: string; pay: string }[] = [
    { key: "player", label: "Player", pay: "1:1" },
    { key: "banker", label: "Banker", pay: "0.95:1" },
    { key: "tie", label: "Tie", pay: "8:1" },
  ];

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader iconName="Diamond" eyebrow="Punto Banco" title="Baccarat" />

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <div className="label-eyebrow mb-2">Player {player.length > 0 && <span className="text-faint">· {total(player)}</span>}</div>
          <div className="flex gap-2">
            {player.length === 0 ? <PlayingCard hidden /> : player.map((c, i) => <PlayingCard key={i} card={c} index={i} />)}
          </div>
        </div>
        <div>
          <div className="label-eyebrow mb-2">Banker {banker.length > 0 && <span className="text-faint">· {total(banker)}</span>}</div>
          <div className="flex gap-2">
            {banker.length === 0 ? <PlayingCard hidden /> : banker.map((c, i) => <PlayingCard key={i} card={c} index={i} />)}
          </div>
        </div>
      </div>

      <p className="mb-4 text-[13.5px] text-body">{msg}</p>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {opts.map((o) => (
          <button
            key={o.key}
            onClick={() => setBet(o.key)}
            disabled={busy}
            className={cn(
              "rounded-2xl border p-3 text-center text-[13px] font-medium transition disabled:opacity-50",
              bet === o.key ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/40 text-strong hover:bg-white/70",
            )}
          >
            {o.label}
            <span className="ml-1 text-[10px] opacity-60">{o.pay}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BetInput value={amount} onChange={setAmount} chips={chips} presets={CHIPS} disabled={busy} />
        <button
          onClick={deal}
          disabled={busy || amount > chips}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          <Icon name="Diamond" size={14} /> Deal {amount}
        </button>
      </div>
    </GlassCard>
  );
}
