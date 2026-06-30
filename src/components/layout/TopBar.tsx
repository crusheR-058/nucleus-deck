"use client";

import { motion } from "framer-motion";
import { useClock } from "@/lib/hooks";
import { useDeck } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { Weather } from "./Weather";
import { Icon } from "@/components/ui/Icon";

export function TopBar() {
  const name = useDeck((s) => s.settings.name);
  const theme = useDeck((s) => s.settings.theme);
  const focusMode = useDeck((s) => s.settings.focusMode);
  const updateSettings = useDeck((s) => s.updateSettings);
  const firstName = name.split(" ")[0] || name;
  const clock = useClock(firstName);
  const setView = useUI((s) => s.setView);
  const isDark = (theme ?? "dark") === "dark";

  return (
    <motion.header
      initial={{ opacity: 0, y: -28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-5 z-40 flex items-start justify-between gap-4 px-6 lg:pl-28 lg:pr-8"
    >
      {/* Branding + greeting */}
      <div className="flex items-center gap-3">
        <div className="glass-pill flex items-center gap-3 rounded-full py-2.5 pl-3 pr-5">
          <NucleusMark size={32} />
          <div className="leading-tight">
            <div className="font-display text-[17px] font-semibold tracking-tight text-strong">Nucleus Deck</div>
            <div className="text-[12px] text-muted">{clock.greeting}</div>
          </div>
        </div>
      </div>

      {/* Clock + weather */}
      <div className="glass-pill flex items-center gap-4 rounded-full py-2 pl-5 pr-3">
        <div className="text-right leading-none">
          <div className="tabular text-[19px] font-semibold tracking-tight text-strong">
            {clock.time}
            <span className="ml-1 align-top text-[11px] font-medium text-muted">{clock.meridiem}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted">
            {clock.weekday}, {clock.date}
          </div>
        </div>
        {focusMode ? (
          <button
            type="button"
            onClick={() => updateSettings({ focusMode: false })}
            aria-label="Exit focus mode"
            title="Exit focus mode"
            className="focus-ring ml-1 grid h-9 w-9 place-items-center rounded-full bg-ink text-white transition hover:scale-105 active:scale-95"
          >
            <Icon name="Target" size={17} />
          </button>
        ) : (
          <>
            <div className="h-9 w-px bg-ink/10" />
            <Weather />
            <button
              type="button"
              onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
              className="focus-ring ml-1 grid h-9 w-9 place-items-center rounded-full bg-white/40 text-strong transition hover:bg-white/70"
            >
              <Icon name={isDark ? "Sun" : "Moon"} size={17} />
            </button>
            <button
              type="button"
              onClick={() => setView("settings")}
              aria-label="Settings"
              title="Settings"
              className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white/40 text-strong transition hover:bg-white/70"
            >
              <Icon name="Settings2" size={17} />
            </button>
          </>
        )}
      </div>
    </motion.header>
  );
}
