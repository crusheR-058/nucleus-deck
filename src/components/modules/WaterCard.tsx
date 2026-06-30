"use client";

import { todayWater, useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { RadialRing } from "@/components/charts/Charts";
import { Icon } from "@/components/ui/Icon";
import { clamp, cn } from "@/lib/utils";

export function WaterCard({ delay = 0 }: { delay?: number }) {
  const water = useDeck((s) => s.water);
  const addWater = useDeck((s) => s.addWater);
  const today = todayWater(water);
  const pct = clamp((today / water.goalMl) * 100, 0, 100);
  const cups = Math.round(water.goalMl / water.cupMl);
  const filled = Math.floor(today / water.cupMl);

  return (
    <GlassCard delay={delay} depth={2} className="flex flex-col">
      <CardHeader iconName="GlassWater" eyebrow="Hydration" title="Water" />

      <div className="flex flex-1 items-center gap-5">
        <RadialRing
          value={pct}
          size={130}
          stroke={12}
          center={
            <div className="flex flex-col items-center">
              <span className="tabular font-display text-2xl font-medium text-strong">{(today / 1000).toFixed(2)}L</span>
              <span className="text-[10px] text-faint">of {(water.goalMl / 1000).toFixed(1)}L</span>
            </div>
          }
        />

        <div className="flex-1">
          <div className="mb-3 grid grid-cols-6 gap-1.5">
            {Array.from({ length: cups }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "grid aspect-square place-items-center rounded-lg border transition",
                  i < filled ? "border-ink/30 bg-ink/85 text-white" : "border-ink/12 bg-white/40 text-ink/25",
                )}
                title={`Cup ${i + 1}`}
              >
                <Icon name="Droplet" size={12} />
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => addWater()}
              className="liquid-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium"
            >
              <Icon name="Plus" size={14} /> {water.cupMl}ml
            </button>
            <button
              onClick={() => addWater(500)}
              className="focus-ring rounded-full border border-ink/15 bg-white/50 px-3 py-2 text-[13px] font-medium text-strong transition hover:bg-white/75"
            >
              +500
            </button>
            <button
              onClick={() => today > 0 && addWater(-Math.min(water.cupMl, today))}
              aria-label="Undo"
              disabled={today <= 0}
              className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-white/50 text-strong transition hover:bg-white/75 disabled:opacity-40"
            >
              <Icon name="RotateCcw" size={15} />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
