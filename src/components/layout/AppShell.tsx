"use client";

import { useEffect, useState } from "react";
import { usePointerLight, useMounted } from "@/lib/hooks";
import { useDeck } from "@/lib/store";
import { Background } from "@/components/background/Background";
import { Overlays } from "@/components/background/Overlays";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Boot } from "./Boot";
import { Workspace } from "@/components/Workspace";

export function AppShell() {
  usePointerLight();
  const mounted = useMounted();
  const [booting, setBooting] = useState(true);
  const theme = useDeck((s) => s.settings.theme);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setBooting(false), 1250);
    return () => clearTimeout(t);
  }, [mounted]);

  // Keep the <html> `dark` class in sync with the chosen theme. In "auto"
  // mode it follows the OS and live-updates when that preference changes.
  useEffect(() => {
    const pref = theme ?? "dark";
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = pref === "dark" || (pref === "auto" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    if (pref === "auto") {
      mq.addEventListener?.("change", apply);
      return () => mq.removeEventListener?.("change", apply);
    }
  }, [theme]);

  return (
    <div className="relative min-h-dvh">
      <Background />

      {/* Chrome + workspace mount only on the client to avoid hydrating
          server HTML against localStorage-restored state. The boot curtain
          covers this until ready. */}
      {mounted && (
        <>
          <Sidebar />
          <TopBar />

          <main className="scroll-area relative z-10 h-dvh overflow-x-hidden pb-16 pl-24 pr-5 pt-28 sm:pr-6 lg:pl-28 lg:pr-8">
            <div className="mx-auto max-w-[1520px]">
              <Workspace />
            </div>
          </main>

          <Overlays />
        </>
      )}

      <Boot show={booting || !mounted} />
    </div>
  );
}
