"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SCENES = [
  { id: "scene-arrival", label: "01 ARRIVAL" },
  { id: "scene-nucleus", label: "02 THE NUCLEUS" },
  { id: "scene-dashboard", label: "03 COMMAND DECK" },
  { id: "scene-day", label: "04 YOUR DAY" },
  { id: "scene-ai", label: "05 INTELLIGENCE" },
  { id: "scene-explore", label: "06 EXPLORE" },
  { id: "scene-knowledge", label: "07 KNOWLEDGE" },
  { id: "scene-ecosystem", label: "08 COMPLETE SYSTEM" },
];

export function SceneProgress() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      for (let i = SCENES.length - 1; i >= 0; i--) {
        const el = document.getElementById(SCENES[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActive(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex">
      <div className="glass-pill-dark flex flex-col gap-2 rounded-full p-2 py-3 backdrop-blur-xl">
        {SCENES.map((scene, i) => {
          const isCurrent = active === i;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => scrollTo(scene.id)}
              aria-label={scene.label}
              className="group relative flex items-center justify-end"
            >
              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-md border border-white/10 bg-[#09090b]/90 px-2.5 py-1 text-[10px] font-mono tracking-widest text-white/80 opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
                {scene.label}
              </span>

              {/* Dot indicator */}
              <div className="relative grid h-4 w-4 place-items-center">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "h-2.5 w-2.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                      : "h-1.5 w-1.5 bg-white/30 group-hover:bg-white/60"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
      <span className="pr-1 font-mono text-[9px] uppercase tracking-widest text-white/30">
        {SCENES[active]?.label.split(" ")[0]}
      </span>
    </div>
  );
}
