"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useDeck } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export function AddMenu({ onClose, placement = "dock" }: { onClose: () => void; placement?: "dock" | "sidebar" }) {
  const addTask = useDeck((s) => s.addTask);
  const addWater = useDeck((s) => s.addWater);
  const cup = useDeck((s) => s.water.cupMl);
  const setView = useUI((s) => s.setView);
  const askAssistant = useUI((s) => s.askAssistant);
  const [title, setTitle] = useState("");
  const [flash, setFlash] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    addTask(title);
    setTitle("");
    setFlash("Task added");
    setTimeout(() => setFlash(""), 1400);
  };

  const quick = [
    { label: `Water +${cup}ml`, icon: "GlassWater", onClick: () => { addWater(); setFlash("Water logged"); setTimeout(() => setFlash(""), 1400); } },
    { label: "Mood", icon: "SmilePlus", onClick: () => { setView("home"); onClose(); } },
    { label: "Focus", icon: "Timer", onClick: () => { setView("home"); onClose(); } },
    { label: "Ask AI", icon: "Sparkles", onClick: () => { askAssistant("Plan my day based on my tasks and the time right now."); onClose(); } },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={cn(
        "glass-charcoal absolute z-50 w-72 rounded-3xl p-4",
        placement === "sidebar" ? "bottom-0 left-14" : "bottom-16 right-0",
      )}
      role="dialog"
      aria-label="Quick add"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="label-eyebrow">Quick add</span>
        {flash && <span className="text-[11px] text-white/70">{flash}</span>}
      </div>
      <div className="flex items-center gap-2">
        <GlassInput
          tone="dark"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a task…"
          className="py-2"
        />
        <button
          onClick={submit}
          aria-label="Add task"
          className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#09090b] transition hover:scale-105 active:scale-95"
        >
          <Icon name="Plus" size={18} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {quick.map((q) => (
          <button
            key={q.label}
            onClick={q.onClick}
            className="focus-ring flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white/85 transition hover:bg-white/12"
          >
            <Icon name={q.icon} size={15} />
            {q.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
