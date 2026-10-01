"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/lib/hooks";

const PROMPTS = [
  {
    id: "plan",
    label: "Plan my day",
    userMsg: "Plan my day around clinical rounds at 11:30 AM.",
    aiReply:
      "Good morning, Om. You have 3 high-priority tasks and clinical rounds at 11:30 AM in Ward 4B. I recommend completing your Phase II pharmacology review in your current focus block, taking a hydration break, and wrapping your case summary before lunch.",
    contextTags: ["Tasks: 3 pending", "Agenda: 11:30 AM", "Hydration: 84%"],
  },
  {
    id: "briefing",
    label: "Spoken Daily Briefing",
    userMsg: "Play my morning audio briefing.",
    aiReply:
      "Initiating voice synthesis. Current temperature is 24°C and clear. Today's primary objective: complete the cardiovascular pathology module. You're on a 14-day habit streak. Drink 400ml of water before heading out.",
    contextTags: ["Voice TTS: Active", "Weather: 24°C", "Habits: 14d streak"],
  },
  {
    id: "tidy",
    label: "Tidy notes",
    userMsg: "Tidy and structure my scratchpad notes from last night.",
    aiReply:
      "Done. I extracted 4 clinical pearls on acute coronary syndrome, formatted diagnostic criteria for STEMI vs NSTEMI into a clean table, and linked related PubMed references into your MBBS hub.",
    contextTags: ["Notes: 4 categorized", "MBBS Hub: Linked", "Local storage"],
  },
  {
    id: "summarize",
    label: "Summarize clinical trial",
    userMsg: "Summarize the latest NEJM cardiology study on SGLT2 inhibitors.",
    aiReply:
      "Key findings: Statistically significant 26% reduction in cardiovascular death and heart failure hospitalization. Well-tolerated across cohorts with preserved eGFR. Added to your study tracker.",
    contextTags: ["Research: NEJM", "Key Metric: -26% risk", "Saved"],
  },
];

export function AIScene() {
  const reduced = usePrefersReducedMotion();
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const current = PROMPTS[selectedPrompt];

  return (
    <section id="scene-ai" className="relative min-h-screen w-full px-6 pt-36 pb-28 lg:px-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <div className="label-eyebrow text-white/50 mb-2">SCENE 06 // AMBIENT INTELLIGENCE</div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-5xl">
            Your system can talk back.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
            Not a detached chatbot. An intelligent operating layer grounded in your live tasks, habits, scratchpads,
            weather, and daily commitments.
          </p>
        </div>

        {/* Interactive Showcase Canvas */}
        <div className="relative mt-12 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Contextual Nodes (Reference Video Style) */}
          <div className="flex flex-col gap-3 lg:col-span-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              CONTEXTUAL INTEGRATIONS
            </span>

            {[
              { label: "Tasks & Priorities", val: "3 active items", icon: "CheckSquare" },
              { label: "Daily Habits", val: "5/6 completed", icon: "Flame" },
              { label: "Scratchpad Notes", val: "4 unstructured", icon: "FileText" },
              { label: "Atmospheric Weather", val: "24°C Clear", icon: "Sun" },
              { label: "Calendar Schedule", val: "Rounds 11:30 AM", icon: "Calendar" },
            ].map((ctx, idx) => (
              <div
                key={idx}
                className="glass-pill-dark group flex items-center justify-between rounded-xl border border-white/10 p-3 transition hover:border-white/30"
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid h-6 w-6 place-items-center rounded bg-white/10 text-white">
                    <Icon name={ctx.icon} size={13} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">{ctx.label}</span>
                    <span className="font-mono text-[10px] text-zinc-400">{ctx.val}</span>
                  </div>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              </div>
            ))}
          </div>

          {/* Center/Right: AI Terminal Window */}
          <div className="lg:col-span-8">
            <div className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-8">
              {/* Specular highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

              {/* Terminal header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white">
                    <Icon name="Sparkles" size={16} />
                  </div>
                  <div>
                    <div className="font-display text-sm font-semibold text-white">Nucleus Intelligence</div>
                    <div className="font-mono text-[10px] text-zinc-400">Model: Llama 3.3 70B // Groq Engine</div>
                  </div>
                </div>

                {/* Voice audio visualizer */}
                <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  <Icon name="Mic" size={12} className="text-emerald-400 mr-1" />
                  {[4, 12, 18, 10, 22, 14, 8].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={reduced ? false : { height: [4, h, 6] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 rounded-full bg-emerald-400"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                  <span className="ml-1 font-mono text-[10px] text-emerald-400">VOICE TTS</span>
                </div>
              </div>

              {/* Interactive prompt pills */}
              <div className="my-5 flex flex-wrap gap-2">
                {PROMPTS.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPrompt(idx)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      selectedPrompt === idx
                        ? "bg-white text-black shadow-md"
                        : "border border-white/15 bg-white/5 text-zinc-300 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Chat exchange */}
              <div className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs text-white sm:text-sm">
                    {current.userMsg}
                  </div>
                </div>

                {/* AI response */}
                <div className="flex items-start gap-3">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-black">
                    <Icon name="Sparkles" size={12} />
                  </div>
                  <div className="max-w-[90%] rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs text-zinc-200 sm:text-sm sm:leading-relaxed">
                    <p>{current.aiReply}</p>

                    {/* Context tags attached to response */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-2.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">GROUNDED IN:</span>
                      {current.contextTags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
