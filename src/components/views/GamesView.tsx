"use client";

import { useState } from "react";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { Blackjack } from "@/components/games/Blackjack";
import { Roulette } from "@/components/games/Roulette";
import { Slots } from "@/components/games/Slots";
import { VideoPoker } from "@/components/games/VideoPoker";
import { Baccarat } from "@/components/games/Baccarat";
import { HiLo } from "@/components/games/HiLo";
import { Dice } from "@/components/games/Dice";
import { Keno } from "@/components/games/Keno";
import { Crash } from "@/components/games/Crash";
import { Plinko } from "@/components/games/Plinko";

const GAMES = [
  { key: "blackjack", label: "Blackjack", icon: "Spade", Comp: Blackjack },
  { key: "roulette", label: "Roulette", icon: "CircleDot", Comp: Roulette },
  { key: "slots", label: "Slots", icon: "Cherry", Comp: Slots },
  { key: "videopoker", label: "Video Poker", icon: "Club", Comp: VideoPoker },
  { key: "baccarat", label: "Baccarat", icon: "Diamond", Comp: Baccarat },
  { key: "hilo", label: "Hi-Lo", icon: "ArrowUpDown", Comp: HiLo },
  { key: "dice", label: "Dice", icon: "Dices", Comp: Dice },
  { key: "keno", label: "Keno", icon: "Hash", Comp: Keno },
  { key: "crash", label: "Crash", icon: "Rocket", Comp: Crash },
  { key: "plinko", label: "Plinko", icon: "Triangle", Comp: Plinko },
] as const;

export function GamesView() {
  const chips = useDeck((s) => s.casinoChips);
  const resetChips = useDeck((s) => s.resetChips);
  const [active, setActive] = useState<string>("blackjack");
  const Active = GAMES.find((g) => g.key === active)!.Comp;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <GlassCard depth={1.5} delay={0}>
        <CardHeader
          iconName="Dices"
          eyebrow="Casino"
          title="Games"
          right={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/50 px-3 py-1.5 text-[13px] font-medium text-strong">
                <Icon name="Coins" size={14} />
                <span className="tabular">{chips.toLocaleString()}</span>
              </span>
              {chips <= 0 && (
                <button
                  onClick={resetChips}
                  className="rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-white transition hover:opacity-90"
                >
                  Refill
                </button>
              )}
            </div>
          }
        />
        <div className="flex flex-wrap gap-2">
          {GAMES.map((g) => (
            <button
              key={g.key}
              onClick={() => setActive(g.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition",
                active === g.key ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/40 text-muted hover:bg-white/70",
              )}
            >
              <Icon name={g.icon} size={14} /> {g.label}
            </button>
          ))}
        </div>
      </GlassCard>

      <Active />
    </div>
  );
}
