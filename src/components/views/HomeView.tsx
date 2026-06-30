"use client";

import { habitStreak, todayWater, useDeck } from "@/lib/store";
import { clamp, lastNDays, todayKey } from "@/lib/utils";
import { StatTile } from "@/components/modules/StatTile";
import { TasksCard } from "@/components/modules/TasksCard";
import { HabitsCard } from "@/components/modules/HabitsCard";
import { NotesCard } from "@/components/modules/NotesCard";
import { FocusTimerCard } from "@/components/modules/FocusTimerCard";
import { MoodCard } from "@/components/modules/MoodCard";
import { WaterCard } from "@/components/modules/WaterCard";
import { QuickLinksCard } from "@/components/modules/QuickLinksCard";
import { AgendaCard } from "@/components/modules/AgendaCard";

export function HomeView() {
  const tasks = useDeck((s) => s.tasks);
  const habits = useDeck((s) => s.habits);
  const focus = useDeck((s) => s.focus);
  const water = useDeck((s) => s.water);

  const remaining = tasks.filter((t) => !t.done).length;
  const bestStreak = habits.reduce((m, h) => Math.max(m, habitStreak(h.history)), 0);
  const focusToday = Math.round(focus.minutesByDay[todayKey()] || 0);
  const waterPct = clamp((todayWater(water) / water.goalMl) * 100, 0, 100);
  const focusSpark = lastNDays(7).map((d) => Math.round(focus.minutesByDay[d] || 0));

  return (
    <div className="space-y-5">
      {/* small stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile iconName="ListTodo" label="Tasks left" value={remaining} delay={0.05} />
        <StatTile iconName="Flame" label="Best streak" value={bestStreak} suffix="d" delay={0.1} />
        <StatTile iconName="Timer" label="Focus today" value={focusToday} suffix="m" spark={focusSpark} delay={0.15} />
        <StatTile iconName="GlassWater" label="Hydration" value={Math.round(waterPct)} suffix="%" delay={0.2} variant="charcoal" />
      </div>

      {/* bento masonry — varied heights, true glass depth */}
      <div className="gap-5 [column-fill:_balance] md:columns-2 xl:columns-3">
        <Bento><MoodCard delay={0.22} /></Bento>
        <Bento><TasksCard delay={0.26} /></Bento>
        <Bento><FocusTimerCard delay={0.3} /></Bento>
        <Bento><HabitsCard delay={0.34} /></Bento>
        <Bento><AgendaCard delay={0.38} /></Bento>
        <Bento><WaterCard delay={0.42} /></Bento>
        <Bento><NotesCard delay={0.46} /></Bento>
        <Bento><QuickLinksCard delay={0.5} /></Bento>
      </div>
    </div>
  );
}

/** Wrapper that keeps a card intact within a CSS masonry column. */
function Bento({ children }: { children: React.ReactNode }) {
  return <div className="mb-5 break-inside-avoid">{children}</div>;
}
