"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { SYSTEM_NODES, type SystemNode } from "./types";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { Icon } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { playHoverTick } from "@/lib/sound";

export function NucleusScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Scene transforms driven by scroll progress [0 -> 1]
  const nucleusScale = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.95, 1.25, 1.15, 1.05]);
  // Expansion starts at 0 (inside nucleus) and expands out to full orbit
  const expansionProgress = useTransform(scrollYProgress, [0.04, 0.52, 1], [0, 1.0, 1.15]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [1, 0.85, 0.6, 0.2]);

  return (
    <div ref={containerRef} id="scene-nucleus" className="relative h-[220vh] w-full">
      {/* Sticky viewport stage */}
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4">
        {/* Section title & subtitle overlay */}
        <motion.div
          style={{ opacity: headlineOpacity }}
          className="pointer-events-none absolute top-20 z-20 mx-auto text-center"
        >
          <div className="label-eyebrow text-white/50 mb-2">SCENE 02 & 03 // ARCHITECTURE</div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-white sm:text-4xl">
            Everything revolves around one Nucleus.
          </h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Scroll to observe orbital system expansion and interconnected nodes.
          </p>
        </motion.div>

        {/* Central Constellation Canvas */}
        <div className="relative flex h-[760px] w-full max-w-[1200px] items-center justify-center">
          {/* Central 3D Core with radial pulsing aura */}
          <motion.div
            style={{ scale: reduced ? 1 : nucleusScale }}
            className="relative z-20 flex flex-col items-center justify-center"
          >
            {/* Ambient core glow */}
            <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-white/[0.07] blur-3xl" />
            <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-radial from-white/[0.15] to-transparent blur-xl" />

            {/* Nucleus Core Badge */}
            <div className="glass-pill-dark group relative flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/30 p-2 shadow-[0_0_50px_rgba(255,255,255,0.15)] transition-all duration-500 hover:scale-110 hover:border-white/60">
              <NucleusMark size={46} className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
              <span className="mt-1 font-mono text-[9px] tracking-widest text-white/80 uppercase">
                CORE
              </span>
            </div>
          </motion.div>

          {/* SVG Animated Connector Filaments: Emerges fully from inside the Nucleus core (600, 380) */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1200 760"
            fill="none"
          >
            <defs>
              <linearGradient id="lineGrad" x1="600" y1="380" x2="0" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#a1a1aa" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#71717a" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {SYSTEM_NODES.map((node) => (
              <BranchConnector
                key={`branch-${node.id}`}
                node={node}
                isActive={activeNode === node.id}
                scrollYProgress={scrollYProgress}
                reduced={reduced}
              />
            ))}
          </svg>

          {/* Floating Spatial Nodes: Pops out fully from inside the Nucleus core */}
          <div className="pointer-events-auto absolute inset-0">
            {SYSTEM_NODES.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const baseDist = node.distance * 0.95;
              const isActive = activeNode === node.id;

              return (
                <FloatingNodeItem
                  key={`node-${node.id}`}
                  node={node}
                  angleRad={rad}
                  baseDistance={baseDist}
                  expansionProgress={expansionProgress}
                  scrollYProgress={scrollYProgress}
                  reduced={reduced}
                  isActive={isActive}
                  onHover={(active) => setActiveNode(active ? node.id : null)}
                />
              );
            })}
          </div>
        </div>

        {/* Ambient bottom status strip */}
        <div className="absolute bottom-6 flex items-center gap-6 rounded-full border border-white/10 bg-black/40 px-5 py-2 text-[11px] font-mono text-zinc-400 backdrop-blur-md">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            12 SYSTEM NODES LINKED
          </span>
          <span className="text-zinc-600">|</span>
          <span className="hidden sm:inline">ZERO CLOUD LATENCY • LOCAL MEMORY</span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span>AUTONOMOUS ROUTING</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Animated filament branch that traces out organically from inside the Nucleus center (600, 380)
 * out to each constellation orbital coordinate.
 */
function BranchConnector({
  node,
  isActive,
  scrollYProgress,
  reduced,
}: {
  node: SystemNode;
  isActive: boolean;
  scrollYProgress: MotionValue<number>;
  reduced: boolean;
}) {
  const rad = (node.angle * Math.PI) / 180;
  const r = node.distance * 0.95;
  const targetX = 600 + Math.cos(rad) * r;
  const targetY = 380 + Math.sin(rad) * r * 0.7; // elliptical perspective

  // Quadratic bezier control point for organic curvature
  const midX = 600 + Math.cos(rad - 0.2) * (r * 0.45);
  const midY = 380 + Math.sin(rad - 0.2) * (r * 0.45 * 0.7);

  // Stagger emergence by node order
  const nodeIndex = parseInt(node.code.replace("#", ""), 10) - 1;
  const staggerOffset = Math.max(0, nodeIndex) * 0.015;
  const start = 0.04 + staggerOffset;
  const end = Math.min(0.52, 0.28 + staggerOffset * 1.5);

  const pathLength = useTransform(scrollYProgress, [start, end], [0, 1]);
  const branchOpacity = useTransform(
    scrollYProgress,
    [start, start + 0.04, 0.75, 1],
    [0, 1, 0.9, 0.4]
  );
  const dotScale = useTransform(scrollYProgress, [end - 0.04, end], [0, 1]);

  return (
    <g>
      <motion.path
        d={`M 600 380 Q ${midX} ${midY} ${targetX} ${targetY}`}
        stroke={isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.22)"}
        strokeWidth={isActive ? 1.75 : 1}
        strokeDasharray={isActive ? "none" : "3 5"}
        style={{
          pathLength: reduced ? 1 : pathLength,
          opacity: reduced ? 0.7 : branchOpacity,
        }}
        className="transition-all duration-300"
      />
      {/* Glowing connector junction dot at branch tip */}
      <motion.circle
        cx={targetX}
        cy={targetY}
        r={isActive ? 3.5 : 2}
        fill={isActive ? "#ffffff" : "rgba(255,255,255,0.6)"}
        style={{
          scale: reduced ? 1 : dotScale,
          opacity: reduced ? 0.8 : dotScale,
        }}
        className="transition-all duration-300"
      />
    </g>
  );
}

/**
 * Floating node item that scales and pops out from inside the Nucleus core (center 50%, 50%)
 * as the user scrolls, traveling to its designated orbital position.
 */
function FloatingNodeItem({
  node,
  angleRad,
  baseDistance,
  expansionProgress,
  scrollYProgress,
  reduced,
  isActive,
  onHover,
}: {
  node: SystemNode;
  angleRad: number;
  baseDistance: number;
  expansionProgress: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  reduced: boolean;
  isActive: boolean;
  onHover: (active: boolean) => void;
}) {
  const depthFactor = 1 + (node.zDepth || 0) / 250;

  // Staggered emergence & pop timing
  const nodeIndex = parseInt(node.code.replace("#", ""), 10) - 1;
  const staggerOffset = Math.max(0, nodeIndex) * 0.015;
  const start = 0.04 + staggerOffset;
  const popEnd = Math.min(0.44, 0.22 + staggerOffset * 1.5);

  const nodeScale = useTransform(
    scrollYProgress,
    [start, popEnd, 0.85, 1],
    [0, 1, 1, 0.96]
  );
  const nodeOpacity = useTransform(
    scrollYProgress,
    [start, start + 0.05, 0.85, 1],
    [0, 1, 1, 0.7]
  );

  // Compute position relative to center (50%, 50%) - when expansion is 0, node sits inside the core
  const x = useTransform(
    expansionProgress,
    (p: number) => Math.cos(angleRad) * baseDistance * (reduced ? 1 : p) * depthFactor
  );
  const y = useTransform(
    expansionProgress,
    (p: number) => Math.sin(angleRad) * baseDistance * 0.7 * (reduced ? 1 : p) * depthFactor
  );

  return (
    <motion.div
      style={{
        left: "50%",
        top: "50%",
        x,
        y,
        scale: reduced ? 1 : nodeScale,
        opacity: reduced ? 1 : nodeOpacity,
        translateX: "-50%",
        translateY: "-50%",
        willChange: "transform, opacity",
      }}
      className="absolute cursor-pointer"
      onPointerEnter={() => {
        playHoverTick();
        onHover(true);
      }}
      onPointerLeave={() => onHover(false)}
      whileHover={{ scale: 1.08, zIndex: 30 }}
    >
      <div
        className={`glass-pill-dark group relative flex items-center gap-2.5 rounded-full border px-3 py-1.5 backdrop-blur-xl transition-all duration-300 ${
          isActive
            ? "border-white/70 bg-white/[0.14] shadow-[0_0_24px_rgba(255,255,255,0.25)] text-white"
            : "border-white/15 bg-[#121215]/85 hover:border-white/40 hover:bg-white/10 text-zinc-300"
        }`}
      >
        {/* Node index tag */}
        <span className="font-mono text-[9px] font-semibold text-zinc-500 group-hover:text-zinc-300">
          {node.code}
        </span>

        {/* Icon */}
        <div className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-white">
          <Icon name={node.icon} size={12} strokeWidth={2} />
        </div>

        {/* Title and live count */}
        <div className="flex flex-col text-left leading-none">
          <span className="text-[11px] font-medium tracking-tight text-white">
            {node.title}
          </span>
          <span className="mt-0.5 text-[9px] font-mono text-zinc-400">
            {node.count}
          </span>
        </div>

        {/* Subtle indicator dot */}
        <div
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            isActive ? "bg-white shadow-[0_0_8px_#ffffff]" : "bg-white/30"
          }`}
        />
      </div>

      {/* Expanded detail tooltip when hovered */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute left-1/2 top-full z-40 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/20 bg-black/90 px-2.5 py-1 text-[10px] text-zinc-300 shadow-xl backdrop-blur-md"
        >
          {node.description}
        </motion.div>
      )}
    </motion.div>
  );
}
