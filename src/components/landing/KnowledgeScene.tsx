"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function KnowledgeScene() {
  const reduced = usePrefersReducedMotion();

  return (
    <section id="scene-knowledge" className="relative min-h-screen w-full px-6 py-28 lg:px-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <div className="label-eyebrow text-white/50 mb-2">SCENE 08 // DEDICATED KNOWLEDGE</div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-5xl">
            From managing your day to mastering what matters.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
            A serene, architectural study environment tailored for medical rigor — NMC competency trackers, clinical
            formulas, normal lab reference ranges, mnemonics, and an AI tutor.
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
                  <Icon name="Stethoscope" size={17} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">MBBS Curriculum Hub</h3>
                  <span className="font-mono text-[10px] text-zinc-400">NMC Competency-Based Tracker</span>
                </div>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-emerald-400">
                PHASE II ACTIVE
              </span>
            </div>

            {/* Phases Progress */}
            <div className="mt-6 space-y-4">
              {[
                { phase: "Phase I", subjects: "Anatomy · Physiology · Biochemistry", progress: 94, status: "Complete" },
                { phase: "Phase II", subjects: "Pathology · Pharmacology · Microbiology", progress: 68, status: "In Progress" },
                { phase: "Phase III (Part 1)", subjects: "Community Med · Forensic · ENT · Eye", progress: 24, status: "Upcoming" },
                { phase: "Phase III (Part 2)", subjects: "General Medicine · General Surgery · OBG · Peds", progress: 10, status: "Planned" },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-display font-semibold text-white">{item.phase}</span>
                    <span className="font-mono text-[10px] text-zinc-400">{item.progress}% • {item.status}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-400">{item.subjects}</div>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-zinc-400 to-white transition-all duration-1000"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-zinc-500">
              <span>OFFLINE STORAGE // LOCAL-FIRST SYNC</span>
              <span>100% PERSISTENT</span>
            </div>
          </motion.div>

          {/* Right Column: Clinical Formulas & Lab Values (span 5) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Formulas Card */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-display text-xs font-semibold text-white">Clinical Formula Engine</span>
                <span className="font-mono text-[10px] text-zinc-400">Instant Calculation</span>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs">
                {[
                  { name: "Anion Gap", eq: "[Na⁺] - ([Cl⁻] + [HCO₃⁻])", norm: "8–12 mEq/L" },
                  { name: "Mean Arterial Pressure", eq: "DBP + 1/3 (SBP - DBP)", norm: "70–105 mmHg" },
                  { name: "Parkland Formula", eq: "4 mL × kg × % TBSA", norm: "1st 8h: 50%" },
                ].map((f, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{f.name}</span>
                      <span className="font-mono text-[10px] text-emerald-400">{f.norm}</span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-zinc-400">{f.eq}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Normal Values & Mnemonics */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass-charcoal relative overflow-hidden rounded-[28px] border border-white/20 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-display text-xs font-semibold text-white">Diagnostic Reference</span>
                <span className="font-mono text-[10px] text-zinc-400">SI Units</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {[
                  { test: "Hemoglobin", val: "13.5–17.5 g/dL" },
                  { test: "Potassium (K⁺)", val: "3.5–5.0 mEq/L" },
                  { test: "Platelets", val: "150–450 ×10³/µL" },
                  { test: "Arterial pH", val: "7.35–7.45" },
                ].map((lab, i) => (
                  <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
                    <span className="text-zinc-400 block text-[10px]">{lab.test}</span>
                    <span className="font-mono font-medium text-white">{lab.val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block mb-0.5">
                  MNEMONIC: MUDPILES (HIGH ANION GAP)
                </span>
                <span className="text-zinc-300">
                  Methanol, Uremia, DKA, Paraldehyde, Iron/INH, Lactic acidosis, Ethylene glycol, Salicylates
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
