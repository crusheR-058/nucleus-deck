"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/lib/ui";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { HomeView } from "@/components/views/HomeView";
import { StudioView } from "@/components/views/StudioView";
import { NewsView } from "@/components/views/NewsView";
import { AssistantView } from "@/components/views/AssistantView";
import { MbbsView } from "@/components/views/MbbsView";
import { PlayView } from "@/components/views/PlayView";
import { GamesView } from "@/components/views/GamesView";
import { SettingsView } from "@/components/views/SettingsView";

export function Workspace() {
  const view = useUI((s) => s.view);
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {view === "home" && <HomeView />}
        {view === "studio" && <StudioView />}
        {view === "news" && <NewsView />}
        {view === "assistant" && <AssistantView />}
        {view === "insights" && <MbbsView />}
        {view === "play" && <PlayView />}
        {view === "games" && <GamesView />}
        {view === "settings" && <SettingsView />}
      </motion.div>
    </AnimatePresence>
  );
}
