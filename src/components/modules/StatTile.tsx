"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { IconCapsule } from "@/components/ui/CardHeader";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Sparkline } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";

export function StatTile({
  iconName,
  label,
  value,
  suffix,
  decimals = 0,
  spark,
  delay = 0,
  variant = "frosted",
}: {
  iconName: string;
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  spark?: number[];
  delay?: number;
  variant?: "frosted" | "charcoal";
}) {
  const dark = variant === "charcoal";
  return (
    <GlassCard delay={delay} depth={1.5} variant={variant} className="flex flex-col justify-between" padded>
      <div className="flex items-start justify-between">
        <IconCapsule name={iconName} size={36} tone={dark ? "dark" : "light"} />
        {spark && <Sparkline values={spark} tone={dark ? "dark" : "light"} />}
      </div>
      <div className="mt-3">
        <div className={cn("flex items-baseline gap-1 font-display text-3xl font-medium tracking-tight", dark ? "text-white" : "text-strong")}>
          <AnimatedNumber value={value} decimals={decimals} className="tabular" />
          {suffix && <span className={cn("text-base font-normal", dark ? "text-white/55" : "text-muted")}>{suffix}</span>}
        </div>
        <div className={cn("mt-0.5 text-[12px]", dark ? "text-white/55" : "text-muted")}>{label}</div>
      </div>
    </GlassCard>
  );
}
