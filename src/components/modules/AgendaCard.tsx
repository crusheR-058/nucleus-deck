"use client";

import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { cn } from "@/lib/utils";

const WD = ["S", "M", "T", "W", "T", "F", "S"];
const PRIO_BAR: Record<string, string> = { low: "bg-silver", med: "bg-graphite", high: "bg-ink" };

export function AgendaCard({ delay = 0 }: { delay?: number }) {
  const tasks = useDeck((s) => s.tasks);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const order: Record<string, number> = { high: 0, med: 1, low: 2 };
  const agenda = tasks
    .filter((t) => !t.done)
    .sort((a, b) => order[a.priority] - order[b.priority])
    .slice(0, 3);

  return (
    <GlassCard delay={delay} depth={2} className="flex flex-col">
      <CardHeader
        iconName="CalendarDays"
        eyebrow={now.toLocaleDateString("en-US", { weekday: "long" })}
        title={now.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
      />

      <div className="mb-1 grid grid-cols-7 gap-1 text-center">
        {WD.map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-faint">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => (
          <div key={i} className="grid aspect-square place-items-center">
            {c && (
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-[12px] transition",
                  c === today ? "bg-ink font-semibold text-white shadow-[0_0_16px_-4px_rgba(8,8,12,0.7)]" : "text-body hover:bg-ink/8",
                )}
              >
                {c}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-ink/10 pt-3">
        <div className="label-eyebrow mb-2">Up next</div>
        <div className="space-y-1.5">
          {agenda.length === 0 && <p className="py-2 text-center text-[13px] text-faint">Nothing scheduled — enjoy the calm.</p>}
          {agenda.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5 rounded-xl bg-white/30 px-2.5 py-2">
              <span className={cn("h-5 w-1 rounded-full", PRIO_BAR[t.priority])} />
              <span className="flex-1 truncate text-[13px] text-body">{t.title}</span>
              {t.estimateMin && <span className="tabular text-[11px] text-faint">{t.estimateMin}m</span>}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
