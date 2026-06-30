"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { FOCUS_VIEWS, VIEWS } from "@/lib/constants";
import { useDeck } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Icon } from "@/components/ui/Icon";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { cn } from "@/lib/utils";
import { AddMenu } from "./AddMenu";

export function Sidebar() {
  const view = useUI((s) => s.view);
  const setView = useUI((s) => s.setView);
  const addOpen = useUI((s) => s.addOpen);
  const setAddOpen = useUI((s) => s.setAddOpen);
  const focusMode = useDeck((s) => s.settings.focusMode);
  const updateSettings = useDeck((s) => s.updateSettings);

  // In focus mode only the MBBS hub + Assistant exist — if we're anywhere
  // else (e.g. after a reload that restores "home"), bounce to the MBBS hub.
  useEffect(() => {
    if (focusMode && !FOCUS_VIEWS.includes(view)) setView("insights");
  }, [focusMode, view, setView]);

  const items = focusMode ? VIEWS.filter((v) => FOCUS_VIEWS.includes(v.key)) : VIEWS;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -40, y: "-50%" }}
      animate={{ opacity: 1, x: 0, y: "-50%" }}
      transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-5 top-1/2 z-40"
    >
      <div className="glass-pill-dark flex flex-col items-center gap-1.5 rounded-full p-2.5">
        <div className="mb-1.5 grid h-11 w-11 place-items-center">
          <NucleusMark size={30} />
        </div>
        {items.map((v) => {
          const active = view === v.key;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              aria-label={v.label}
              aria-current={active ? "page" : undefined}
              title={`${v.label} — ${v.hint}`}
              className="focus-ring group relative grid h-11 w-11 place-items-center rounded-full"
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_0_22px_-2px_rgba(255,255,255,0.85)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                name={v.icon}
                size={19}
                strokeWidth={active ? 2 : 1.7}
                className={cn(
                  "relative z-10 transition-colors duration-300",
                  active ? "text-[#09090b]" : "text-white/60 group-hover:text-white",
                )}
              />
            </button>
          );
        })}

        <div className="my-1 h-px w-6 bg-white/10" />

        {/* Focus mode — strips the deck down to MBBS + Assistant */}
        <button
          type="button"
          onClick={() => updateSettings({ focusMode: !focusMode })}
          aria-pressed={focusMode}
          title={focusMode ? "Exit focus mode" : "Focus mode — only MBBS & Assistant"}
          className={cn(
            "focus-ring grid h-11 w-11 place-items-center rounded-full border transition",
            focusMode
              ? "border-transparent bg-white text-[#09090b] shadow-[0_0_22px_-2px_rgba(255,255,255,0.85)]"
              : "border-white/15 text-white/60 hover:bg-white/10 hover:text-white",
          )}
        >
          <Icon name="Target" size={19} strokeWidth={focusMode ? 2.1 : 1.7} />
        </button>

        {/* Quick add (hidden in focus mode) */}
        {!focusMode && (
          <div className="relative">
            <AnimatePresence>
              {addOpen && <AddMenu placement="sidebar" onClose={() => setAddOpen(false)} />}
            </AnimatePresence>
            <motion.button
              type="button"
              onClick={() => setAddOpen(!addOpen)}
              aria-label="Quick add"
              aria-expanded={addOpen}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.06 }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
              className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-white to-mist text-[#09090b] shadow-[0_10px_26px_-12px_rgba(8,8,12,0.7),inset_0_1px_1px_rgba(255,255,255,0.95)]"
            >
              <motion.span animate={{ rotate: addOpen ? 45 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                <Icon name="Plus" size={20} strokeWidth={2} />
              </motion.span>
            </motion.button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
