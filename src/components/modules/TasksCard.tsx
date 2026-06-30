"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useDeck } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { GlassInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

const PRIO: { key: Priority; bar: string; label: string }[] = [
  { key: "low", bar: "bg-silver", label: "Low" },
  { key: "med", bar: "bg-graphite", label: "Med" },
  { key: "high", bar: "bg-ink", label: "High" },
];

export function TasksCard({ delay = 0 }: { delay?: number }) {
  const tasks = useDeck((s) => s.tasks);
  const addTask = useDeck((s) => s.addTask);
  const toggleTask = useDeck((s) => s.toggleTask);
  const removeTask = useDeck((s) => s.removeTask);
  const clearCompleted = useDeck((s) => s.clearCompleted);
  const askAssistant = useUI((s) => s.askAssistant);

  const [title, setTitle] = useState("");
  const [prio, setPrio] = useState<Priority>("med");

  const remaining = tasks.filter((t) => !t.done).length;
  const done = tasks.length - remaining;

  const submit = () => {
    if (!title.trim()) return;
    addTask(title, prio);
    setTitle("");
  };

  return (
    <GlassCard delay={delay} depth={2} className="flex flex-col">
      <CardHeader
        iconName="ListTodo"
        eyebrow="Focus list"
        title="Tasks"
        right={
          <span className="glass-pill rounded-full px-3 py-1 text-[12px] font-medium text-strong">
            {remaining} left
          </span>
        }
      />

      <div className="mb-3 flex items-center gap-2">
        <GlassInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="What needs doing?"
          className="py-2"
        />
        <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-white/40 bg-white/40 p-1">
          {PRIO.map((p) => (
            <button
              key={p.key}
              onClick={() => setPrio(p.key)}
              title={`${p.label} priority`}
              aria-label={`${p.label} priority`}
              className={cn(
                "h-7 w-3 rounded-full transition",
                p.bar,
                prio === p.key ? "opacity-100 ring-2 ring-white" : "opacity-35 hover:opacity-70",
              )}
            />
          ))}
        </div>
        <button
          onClick={submit}
          aria-label="Add task"
          className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink text-white transition hover:scale-105 active:scale-95"
        >
          <Icon name="Plus" size={18} />
        </button>
      </div>

      <div className="scroll-area -mr-2 flex-1 space-y-1.5 pr-2" style={{ maxHeight: 260 }}>
        <AnimatePresence initial={false}>
          {tasks.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-sm text-faint"
            >
              All clear. Add your first task.
            </motion.p>
          )}
          {tasks.map((t) => {
            const bar = PRIO.find((p) => p.key === t.priority)?.bar ?? "bg-graphite";
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-white/35 px-3 py-2.5"
              >
                <span className={cn("h-7 w-1 rounded-full", bar, t.done && "opacity-30")} />
                <button
                  onClick={() => toggleTask(t.id)}
                  aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition",
                    t.done ? "border-ink bg-ink text-white" : "border-graphite/50 bg-white/60 hover:border-ink",
                  )}
                >
                  {t.done && <Icon name="Check" size={14} strokeWidth={2.5} />}
                </button>
                <span className={cn("flex-1 text-[15px] leading-snug text-body", t.done && "text-faint line-through")}>
                  {t.title}
                </span>
                <button
                  onClick={() => removeTask(t.id)}
                  aria-label="Delete task"
                  className="shrink-0 text-faint opacity-0 transition hover:text-ink group-hover:opacity-100"
                >
                  <Icon name="Trash2" size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
        <span className="text-[12px] text-muted">
          {done}/{tasks.length} done
        </span>
        <div className="flex items-center gap-2">
          {done > 0 && (
            <button onClick={clearCompleted} className="text-[12px] text-muted transition hover:text-ink">
              Clear done
            </button>
          )}
          <button
            onClick={() => askAssistant("Plan my day into a realistic, time-blocked schedule from now until evening, using my current tasks and their priorities.")}
            className="liquid-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
          >
            <Icon name="Sparkles" size={13} />
            Plan my day
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
