"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { habitStreak, useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader, IconCapsule } from "@/components/ui/CardHeader";
import { GlassInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn, lastNDays, shortDay, todayKey } from "@/lib/utils";

export function HabitsCard({ delay = 0 }: { delay?: number }) {
  const habits = useDeck((s) => s.habits);
  const addHabit = useDeck((s) => s.addHabit);
  const removeHabit = useDeck((s) => s.removeHabit);
  const toggleHabitToday = useDeck((s) => s.toggleHabitToday);

  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const days = lastNDays(7);
  const tk = todayKey();

  const submit = () => {
    if (!name.trim()) return;
    addHabit(name);
    setName("");
    setAdding(false);
  };

  return (
    <GlassCard delay={delay} depth={2.5} className="flex flex-col">
      <CardHeader
        iconName="Flame"
        eyebrow="Daily rituals"
        title="Habits"
        right={
          <button
            onClick={() => setAdding((v) => !v)}
            aria-label="Add habit"
            className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-white/50 text-strong transition hover:bg-white/80"
          >
            <Icon name={adding ? "X" : "Plus"} size={16} />
          </button>
        }
      />

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <GlassInput
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="New habit (e.g. Read 20 min)"
                className="py-2"
              />
              <button
                onClick={submit}
                className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink text-white transition hover:scale-105 active:scale-95"
                aria-label="Save habit"
              >
                <Icon name="Check" size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="scroll-area -mr-2 flex-1 space-y-2 pr-2" style={{ maxHeight: 290 }}>
        <AnimatePresence initial={false}>
          {habits.map((h) => {
            const streak = habitStreak(h.history);
            const doneToday = h.history.includes(tk);
            return (
              <motion.div
                key={h.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.96 }}
                className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-white/35 px-3 py-2.5"
              >
                <IconCapsule name={h.icon} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-medium text-body">{h.name}</span>
                    {streak > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted">
                        <Icon name="Flame" size={12} />
                        {streak}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1">
                    {days.map((d) => (
                      <span
                        key={d}
                        title={d}
                        className={cn(
                          "grid h-3.5 w-3.5 place-items-center rounded-full text-[7px]",
                          h.history.includes(d) ? "bg-ink text-white" : "bg-ink/10",
                        )}
                      >
                        {shortDay(d)}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => toggleHabitToday(h.id)}
                  aria-label={doneToday ? "Undo today" : "Mark done today"}
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition active:scale-90",
                    doneToday ? "border-ink bg-ink text-white shadow-[0_0_16px_-4px_rgba(8,8,12,0.6)]" : "border-graphite/40 bg-white/60 hover:border-ink",
                  )}
                >
                  <Icon name="Check" size={16} strokeWidth={2.4} />
                </button>
                <button
                  onClick={() => removeHabit(h.id)}
                  aria-label="Remove habit"
                  className="shrink-0 text-faint opacity-0 transition hover:text-ink group-hover:opacity-100"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {habits.length === 0 && <p className="py-8 text-center text-sm text-faint">No habits yet. Add one to start a streak.</p>}
      </div>
    </GlassCard>
  );
}
