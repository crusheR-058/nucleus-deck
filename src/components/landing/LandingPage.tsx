"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePointerLight, useMounted } from "@/lib/hooks";
import { SmoothScroll } from "./SmoothScroll";
import { LandingBackground } from "./LandingBackground";
import { LandingNav } from "./LandingNav";
import { SceneProgress } from "./SceneProgress";
import { HeroScene } from "./HeroScene";
import { NucleusScene } from "./NucleusScene";
import { DashboardRevealScene } from "./DashboardRevealScene";
import { DailyScene } from "./DailyScene";
import { AIScene } from "./AIScene";
import { ExploreScene } from "./ExploreScene";
import { KnowledgeScene } from "./KnowledgeScene";
import { CompleteSystemScene } from "./CompleteSystemScene";
import { FinalCTA } from "./FinalCTA";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { SpatialCursor } from "@/components/ui/SpatialCursor";

export function LandingPage() {
  usePointerLight();
  const mounted = useMounted();
  const [booting, setBooting] = useState(true);

  // Minimal boot sequence under 1.2s as specified in creative requirements
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      setBooting(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [mounted]);

  return (
    <div className="relative min-h-screen bg-[#050506] text-white selection:bg-white selection:text-black">
      {/* Dynamic Spatial Ring Cursor */}
      <SpatialCursor />

      {/* Lenis Smooth Scroll Engine */}
      <SmoothScroll>
        {/* Background Spatial Atmosphere & Dust Particles */}
        <LandingBackground />

        {/* Global Floating HUD Navigation */}
        <LandingNav />

        {/* Floating Spatial Scene Progress Tracker */}
        <SceneProgress />

        {/* Cinematic Narrative Scenes */}
        <main className="relative z-10 flex flex-col">
          {/* Scene 01: ARRIVAL */}
          <HeroScene />

          {/* Scene 02 & 03: THE NUCLEUS & SYSTEM EXPANSION */}
          <NucleusScene />

          {/* Scene 04: DASHBOARD REVEAL */}
          <DashboardRevealScene />

          {/* Scene 05: YOUR DAY */}
          <DailyScene />

          {/* Scene 06: INTELLIGENCE */}
          <AIScene />

          {/* Scene 07: EXPLORE */}
          <ExploreScene />

          {/* Scene 08: KNOWLEDGE */}
          <KnowledgeScene />

          {/* Scene 09: COMPLETE SYSTEM */}
          <CompleteSystemScene />

          {/* Scene 10: FINAL CTA */}
          <FinalCTA />
        </main>
      </SmoothScroll>

      {/* Boot Curtain Sequence */}
      <AnimatePresence>
        {booting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050506]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-3"
            >
              <NucleusMark size={52} className="drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]" />
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="font-display text-sm font-semibold tracking-widest text-white uppercase"
              >
                Nucleus Deck
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
