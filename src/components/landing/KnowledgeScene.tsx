"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface Track {
  id: string;
  name: string;
  tag: string;
  progress: number;
  status: "Mastered" | "In Progress" | "Upcoming" | "Active";
  modules: string;
}

const TRACKS: Track[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithmic Rigor",
    tag: "Core Foundations",
    progress: 88,
    status: "Mastered",
    modules: "DP · Trees · Graphs · Tries · Bit Manipulation · Monotonic Queues",
  },
  {
    id: "systems",
    name: "Systems & Low-Level Engineering",
    tag: "OS & Concurrency",
    progress: 74,
    status: "Active",
    modules: "Virtual Memory · Threading & Locks · TCP/IP · HTTP/3 QUIC · Epoll",
  },
  {
    id: "sysdesign",
    name: "System Design & Distributed Systems",
    tag: "Scalability & Reliability",
    progress: 42,
    status: "In Progress",
    modules: "CAP Theorem · Raft Consensus · Sharding · Kafka · LSM-Trees",
  },
  {
    id: "cloud",
    name: "Cloud, Infrastructure & DevOps",
    tag: "Deployment & Observability",
    progress: 20,
    status: "Upcoming",
    modules: "Kubernetes · Docker · CI/CD Pipelines · OpenTelemetry · Zero Trust",
  },
];

const BIG_O_PREVIEWS = [
  { algo: "Quicksort", time: "O(n log n)", space: "O(log n)", badge: "Divide & Conquer" },
  { algo: "Mergesort", time: "O(n log n)", space: "O(n)", badge: "Stable" },
  { algo: "Hash Table", time: "O(1) avg", space: "O(n)", badge: "O(1) Lookups" },
  { algo: "Dijkstra (Heap)", time: "O((V+E) log V)", space: "O(V)", badge: "Shortest Path" },
  { algo: "Binary Search", time: "O(log n)", space: "O(1)", badge: "Sorted Arrays" },
];

const LATENCIES = [
  { metric: "L1 Cache Reference", val: "0.5 ns", bar: 4 },
  { metric: "Mutex Lock / Unlock", val: "25 ns", bar: 12 },
  { metric: "Main Memory (RAM)", val: "100 ns", bar: 24 },
  { metric: "SSD Random Read", val: "16 µs", bar: 52 },
  { metric: "Datacenter Roundtrip", val: "500 µs", bar: 78 },
  { metric: "Disk Seek (HDD)", val: "4 ms", bar: 100 },
];

const TUTOR_ACTIONS = [
  { label: "Explain Architecture", icon: "Sparkles", prompt: "Explain Raft consensus & leader election mechanics" },
  { label: "Big-O Breakdown", icon: "Binary", prompt: "Derive time & space complexity for Tarjan's bridge finding" },
  { label: "System Design", icon: "Server", prompt: "Design a high-throughput distributed rate limiter with Redis" },
  { label: "Debug Race Condition", icon: "Terminal", prompt: "Spot memory leak & deadlock in Go goroutine sync pool" },
];

export function KnowledgeScene() {
  const reduced = usePrefersReducedMotion();
  const [activeTrack, setActiveTrack] = useState<string>("systems");
  const [selectedTutorPrompt, setSelectedTutorPrompt] = useState<number>(0);

  return (
    <section id="scene-knowledge" className="relative min-h-screen w-full px-6 py-28 lg:px-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <div className="label-eyebrow text-white/50 mb-2">SCENE 08 // DEDICATED KNOWLEDGE</div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-5xl">
            From managing your day to mastering systems architecture.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
            An architectural command center tailored for computer science and engineering rigor — CS tracks, Big-O algorithm
            matrices, distributed systems blueprints, latency constants, and an AI coding tutor.
          </p>
        </div>

        {/* 2-Column Knowledge Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Curriculum Progress & Tracker (span 7) */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-2xl backdrop-blur-2xl lg:col-span-7 sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white">
                  <Icon name="Terminal" size={17} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">Software Engineering Hub</h3>
                  <span className="font-mono text-[10px] text-zinc-400">CS & Systems Architecture Tracks</span>
                </div>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-emerald-400">
                SYSTEMS TRACK ACTIVE
              </span>
            </div>

            {/* Tracks Progress */}
            <div className="mt-6 space-y-3.5">
              {TRACKS.map((t) => {
                const isActive = activeTrack === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTrack(t.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                      isActive
                        ? "border-white/30 bg-white/[0.06] shadow-lg"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-white">{t.name}</span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-zinc-300">
                          {t.tag}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {t.progress}% •{" "}
                        <span className={t.status === "Mastered" ? "text-emerald-400" : "text-white/80"}>
                          {t.status}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 text-[11px] text-zinc-400 font-mono">{t.modules}</div>
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-zinc-400 via-white to-emerald-300 transition-all duration-1000"
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Coding Tutor Preview */}
            <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Sparkles" size={14} className="text-emerald-400" />
                  <span className="font-display text-xs font-semibold text-white">AI Engineering Tutor</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">Contextual Coding Copilot</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TUTOR_ACTIONS.map((action, idx) => (
                  <button
                    key={action.label}
                    onClick={() => setSelectedTutorPrompt(idx)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition ${
                      selectedTutorPrompt === idx
                        ? "border-white/40 bg-white/20 text-white"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <Icon name={action.icon} size={12} className="shrink-0 text-zinc-300" />
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-2.5 font-mono text-[11px] text-zinc-300">
                <span className="text-emerald-400 mr-2">❯</span>
                {TUTOR_ACTIONS[selectedTutorPrompt].prompt}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-zinc-500">
              <span>LOCAL-FIRST OFFLINE SYNC</span>
              <span>100% PERSISTENT CLIENT STORAGE</span>
            </div>
          </motion.div>

          {/* Right Column: Big-O Matrix & Latency Numbers (span 5) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Big-O Cheat Sheet Card */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="Binary" size={15} className="text-zinc-300" />
                  <span className="font-display text-xs font-semibold text-white">Big-O Complexity Matrix</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">Time | Space</span>
              </div>

              <div className="mt-3.5 space-y-2 text-xs">
                {BIG_O_PREVIEWS.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                    <div>
                      <div className="font-medium text-white">{f.algo}</div>
                      <span className="font-mono text-[9px] text-zinc-400">{f.badge}</span>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <span className="text-emerald-400 font-semibold">{f.time}</span>
                      <span className="text-zinc-500 ml-1.5">| {f.space}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Latencies Every Programmer Should Know */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={15} className="text-zinc-300" />
                  <span className="font-display text-xs font-semibold text-white">Latency Numbers You Must Know</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">Jeff Dean Rules</span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {LATENCIES.map((l, i) => (
                  <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 text-[11px]">{l.metric}</span>
                      <span className="font-mono font-medium text-white">{l.val}</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-white"
                        style={{ width: `${l.bar}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block mb-0.5">
                  SYSTEM DESIGN PRINCIPLE: CAP THEOREM
                </span>
                <span className="text-zinc-300 text-[11px]">
                  Under a network partition (P), a distributed system can guarantee either Consistency (C) or Availability (A), but never both simultaneously.
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
