"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMounted, usePrefersReducedMotion } from "@/lib/hooks";
import { useDeck } from "@/lib/store";

const CrystalField = dynamic(() => import("./CrystalField").then((m) => m.CrystalField), {
  ssr: false,
});

/**
 * The living background: a bright silvery crystal field (CSS) that always
 * renders, with the WebGL crystal layer composited on top when the device
 * can handle it and motion is allowed.
 */
export function Background() {
  const mounted = useMounted();
  const prefersReduced = usePrefersReducedMotion();
  const webglPref = useDeck((s) => s.settings.webglBackground);
  const reduceSetting = useDeck((s) => s.settings.reduceMotion);
  const [can3d, setCan3d] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const cores = navigator.hardwareConcurrency || 4;
      setCan3d(!!gl && cores >= 4);
    } catch {
      setCan3d(false);
    }
  }, []);

  const reduce = reduceSetting === "on" || (reduceSetting === "auto" && prefersReduced);
  const show3d = mounted && can3d && webglPref && !reduce;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base ice field — silver in light, deep slate in dark */}
      <div className="absolute inset-0" style={{ background: "var(--bg-field)" }} />

      {/* Ambient light layer — dimmed in dark via --bg-glow */}
      <div className="absolute inset-0" style={{ opacity: "var(--bg-glow, 1)" }}>
        {/* slow ambient light wash */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(40% 50% at 78% 22%, rgba(255,255,255,0.9), transparent 60%), radial-gradient(45% 55% at 22% 82%, rgba(255,255,255,0.55), transparent 65%)",
          }}
        />

        {/* drifting volumetric orbs / light blobs */}
        <Orb className="left-[-8%] top-[-6%] h-[42vw] w-[42vw] animate-float-slow" />
        <Orb className="right-[-10%] top-[28%] h-[34vw] w-[34vw] animate-drift" opacity={0.5} />
        <Orb className="bottom-[-12%] left-[24%] h-[38vw] w-[38vw] animate-float-slow" opacity={0.45} delay="-6s" />

        {/* faint diagonal light streaks */}
        <div
          className="absolute left-1/4 top-0 h-[140%] w-px rotate-[18deg] animate-pulse-soft"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.5), transparent)" }}
        />
        <div
          className="absolute right-1/3 top-0 h-[140%] w-px rotate-[-14deg] animate-pulse-soft"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.35), transparent)", animationDelay: "-1.4s" }}
        />
      </div>

      {/* WebGL crystal layer */}
      {show3d && <CrystalField particles={prefersReduced ? 300 : 720} />}

      {/* CSS fallback shards when 3D is off */}
      {mounted && !show3d && <FauxCrystals />}
    </div>
  );
}

function Orb({ className, opacity = 0.7, delay }: { className?: string; opacity?: number; delay?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl ${className ?? ""}`}
      style={{
        background: "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.95), rgba(255,255,255,0.15) 55%, transparent 72%)",
        opacity,
        mixBlendMode: "screen",
        animationDelay: delay,
      }}
    />
  );
}

function FauxCrystals() {
  const shards = [
    { left: "12%", top: "18%", size: 220, rot: 12, op: 0.4 },
    { left: "72%", top: "24%", size: 300, rot: -18, op: 0.32 },
    { left: "58%", top: "64%", size: 180, rot: 24, op: 0.36 },
  ];
  return (
    <>
      {shards.map((s, i) => (
        <div
          key={i}
          className="absolute animate-float-slow"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: s.op,
            transform: `rotate(${s.rot}deg)`,
            clipPath: "polygon(50% 0%, 90% 28%, 78% 82%, 22% 82%, 10% 28%)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.1))",
            backdropFilter: "blur(6px)",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.9)",
            animationDelay: `${i * -4}s`,
          }}
        />
      ))}
    </>
  );
}
