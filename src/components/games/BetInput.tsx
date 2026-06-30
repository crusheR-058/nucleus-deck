"use client";

import { cn } from "@/lib/utils";

/** Manual bet entry + quick-fill presets + Max, clamped to the bankroll. */
export function BetInput({
  value,
  onChange,
  chips,
  presets = [50, 100, 500],
  disabled,
  label = "Bet",
}: {
  value: number;
  onChange: (v: number) => void;
  chips: number;
  presets?: number[];
  disabled?: boolean;
  label?: string;
}) {
  const clamp = (v: number) => Math.max(0, Math.min(Math.floor(Number.isFinite(v) ? v : 0), chips));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] text-faint">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={chips}
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value)))}
        disabled={disabled}
        placeholder="0"
        aria-label={`${label} amount`}
        className="tabular w-28 rounded-full border border-ink/15 bg-white/50 px-3.5 py-1.5 text-[13px] font-medium text-strong outline-none transition placeholder:text-faint focus:bg-white/80 disabled:opacity-50"
      />
      {presets.map((p) => (
        <button
          key={p}
          onClick={() => onChange(Math.min(p, chips))}
          disabled={disabled}
          className={cn(
            "tabular rounded-full border px-2.5 py-1 text-[11px] font-medium transition disabled:opacity-30",
            value === p ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/40 text-muted hover:bg-white/70",
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(chips)}
        disabled={disabled}
        className="rounded-full border border-ink/15 bg-white/40 px-2.5 py-1 text-[11px] font-medium text-muted transition hover:bg-white/70 disabled:opacity-30"
      >
        Max
      </button>
    </div>
  );
}
