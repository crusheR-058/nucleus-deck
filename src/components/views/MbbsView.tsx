"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUI } from "@/lib/ui";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader, IconCapsule } from "@/components/ui/CardHeader";
import { GlassInput } from "@/components/ui/Field";
import { StatTile } from "@/components/modules/StatTile";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/* ───────────────────────── Curriculum data (NMC · CBME) ───────────────────────── */

interface Subject {
  name: string;
  icon: string;
  sub: string; // standard textbook(s) / for internship: posting length
}
interface Phase {
  id: string;
  label: string;
  tag: string;
  subjects: Subject[];
  highYield: string[];
}

const PHASES: Phase[] = [
  {
    id: "p1",
    label: "Phase I",
    tag: "1st Prof · ~12 mo",
    subjects: [
      { name: "Anatomy", icon: "Bone", sub: "BD Chaurasia · Netter · Inderbir Singh" },
      { name: "Physiology", icon: "Activity", sub: "Guyton & Hall · Ganong · AK Jain" },
      { name: "Biochemistry", icon: "FlaskConical", sub: "Harper · Vasudevan · Lippincott" },
    ],
    highYield: [
      "Brachial & lumbosacral plexus lesions",
      "Cranial nerves, nuclei & foramina",
      "Cardiac, nerve & muscle action potentials",
      "Acid–base balance & ABG basics",
      "Glycolysis · TCA · urea cycle",
      "Vitamins, coenzymes & deficiencies",
      "Embryology of heart, gut & neural tube",
    ],
  },
  {
    id: "p2",
    label: "Phase II",
    tag: "2nd Prof · ~12 mo",
    subjects: [
      { name: "Pathology", icon: "Microscope", sub: "Robbins & Cotran · Harsh Mohan" },
      { name: "Pharmacology", icon: "Pill", sub: "KD Tripathi · Katzung · Lippincott" },
      { name: "Microbiology", icon: "Dna", sub: "Ananthanarayan & Paniker · Jawetz" },
      { name: "Forensic Medicine", icon: "Scale", sub: "KSN Reddy · The Synopsis" },
    ],
    highYield: [
      "Cell injury, inflammation & healing",
      "Neoplasia, grading & tumour markers",
      "ANS drugs & autacoids",
      "Antimicrobials & resistance",
      "Gram stain, culture media & sterilization",
      "Hypersensitivity & immunology",
      "Autopsy, poisons & medico-legal reports",
    ],
  },
  {
    id: "p3a",
    label: "Phase III · Pt 1",
    tag: "3rd Prof Pt 1 · ~12 mo",
    subjects: [
      { name: "Community Medicine", icon: "Syringe", sub: "Park's Textbook of PSM" },
      { name: "Ophthalmology", icon: "Eye", sub: "AK Khurana" },
      { name: "ENT", icon: "Ear", sub: "Dhingra — Ear, Nose & Throat" },
    ],
    highYield: [
      "Epidemiology & study designs",
      "National health programmes & schedules",
      "Biostatistics, screening & sensitivity/specificity",
      "Red eye, glaucoma & cataract",
      "Refractive errors & visual acuity",
      "Otitis media & deafness work-up",
      "Epistaxis, sinusitis & airway",
    ],
  },
  {
    id: "p3b",
    label: "Final Prof",
    tag: "3rd Prof Pt 2 · ~14 mo",
    subjects: [
      { name: "General Medicine", icon: "HeartPulse", sub: "Harrison · Davidson · API" },
      { name: "General Surgery", icon: "Scissors", sub: "Bailey & Love · SRB · Sabiston" },
      { name: "Obstetrics & Gynae", icon: "Baby", sub: "DC Dutta · Shaw · Williams" },
      { name: "Paediatrics", icon: "SmilePlus", sub: "Ghai Essential · Nelson" },
      { name: "Orthopaedics", icon: "Bone", sub: "Maheshwari · Apley" },
      { name: "Psychiatry", icon: "Brain", sub: "Niraj Ahuja — Short Textbook" },
      { name: "Dermatology", icon: "Stethoscope", sub: "Neena Khanna — IADVL" },
    ],
    highYield: [
      "ECG reading & acute MI / ACS",
      "Diabetes, thyroid & electrolyte emergencies",
      "Acute abdomen, appendicitis & hernia",
      "Breast & thyroid swellings",
      "Antenatal care, partograph & PPH",
      "IMNCI & immunization schedule",
      "Fracture principles & polytrauma (ATLS)",
    ],
  },
  {
    id: "intern",
    label: "Internship",
    tag: "CRMI · 12 months",
    subjects: [
      { name: "Medicine posting", icon: "HeartPulse", sub: "2 months" },
      { name: "Surgery posting", icon: "Scissors", sub: "2 months" },
      { name: "Obs & Gynae", icon: "Baby", sub: "2 months" },
      { name: "Community Medicine", icon: "Syringe", sub: "2 months" },
      { name: "Paediatrics", icon: "SmilePlus", sub: "1 month" },
      { name: "Casualty / Emergency", icon: "Hospital", sub: "1 month" },
      { name: "Orthopaedics", icon: "Bone", sub: "15 days" },
      { name: "Anaesthesia + electives", icon: "Syringe", sub: "balance" },
    ],
    highYield: [
      "Logbook & skill sign-offs",
      "BLS / ACLS & code drills",
      "IV cannula, catheter, NG & suturing",
      "Rational prescription writing",
      "Discharge summaries & referrals",
    ],
  },
];

/* ───────────────────────── Reference data ───────────────────────── */

const LAB_VALUES: { test: string; range: string }[] = [
  { test: "Hb (M / F)", range: "13–17 / 12–15 g/dL" },
  { test: "TLC", range: "4,000–11,000 /µL" },
  { test: "Platelets", range: "1.5–4.5 lakh /µL" },
  { test: "ESR (M / F)", range: "<15 / <20 mm/hr" },
  { test: "Sodium", range: "135–145 mmol/L" },
  { test: "Potassium", range: "3.5–5.0 mmol/L" },
  { test: "Chloride", range: "98–106 mmol/L" },
  { test: "Bicarbonate", range: "22–28 mmol/L" },
  { test: "Urea / BUN", range: "15–40 / 7–20 mg/dL" },
  { test: "Creatinine", range: "0.6–1.2 mg/dL" },
  { test: "Fasting glucose", range: "70–100 mg/dL" },
  { test: "HbA1c", range: "<5.7 %" },
  { test: "Total bilirubin", range: "0.3–1.2 mg/dL" },
  { test: "AST / ALT", range: "5–40 U/L" },
  { test: "Calcium", range: "8.5–10.5 mg/dL" },
  { test: "Albumin", range: "3.5–5.0 g/dL" },
  { test: "TSH", range: "0.4–4.0 mIU/L" },
  { test: "INR", range: "0.8–1.2" },
  { test: "Arterial pH", range: "7.35–7.45" },
  { test: "PaCO₂ / PaO₂", range: "35–45 / 80–100 mmHg" },
];

const VITALS: { k: string; v: string }[] = [
  { k: "Heart rate", v: "60–100 /min" },
  { k: "Respiratory rate", v: "12–20 /min" },
  { k: "Blood pressure", v: "<120/80 mmHg" },
  { k: "SpO₂", v: "95–100 %" },
  { k: "Temperature", v: "36.5–37.5 °C" },
];

const FORMULAS: { k: string; v: string }[] = [
  { k: "BMI", v: "weight(kg) ÷ height(m)²" },
  { k: "MAP", v: "DBP + ⅓ (SBP − DBP)" },
  { k: "Anion gap", v: "Na − (Cl + HCO₃)  ·  8–12" },
  { k: "Corrected Na", v: "Na + 1.6 × (glucose−100)/100" },
  { k: "Winters'", v: "exp. PaCO₂ = 1.5×HCO₃ + 8 ± 2" },
  { k: "CrCl (C–G)", v: "(140−age)×wt ÷ (72×Cr) · ×0.85 ♀" },
  { k: "Fluids (4-2-1)", v: "4·2·1 mL/kg/h by weight band" },
  { k: "Paeds weight", v: "(age × 2) + 8 kg" },
];

const MNEMONICS: { topic: string; m: string }[] = [
  { topic: "Cranial nerves (I–XII)", m: "Ooh Ooh Ooh To Touch And Feel Very Good Velvet, Such Heaven" },
  { topic: "CN — Sensory/Motor/Both", m: "Some Say Marry Money But My Brother Says Big Brains Matter Most" },
  { topic: "Carpal bones", m: "Some Lovers Try Positions That They Can't Handle" },
  { topic: "External carotid branches", m: "Some Anatomists Like Freaking Out Poor Medical Students" },
  { topic: "Causes of pancreatitis", m: "I GET SMASHED" },
  { topic: "Hypercalcaemia signs", m: "Stones, Bones, Groans, Thrones & Psychiatric overtones" },
];

const RESOURCES: { label: string; url: string; icon: string }[] = [
  { label: "NMC", url: "https://www.nmc.org.in", icon: "GraduationCap" },
  { label: "NBE / NEET-PG", url: "https://natboard.edu.in", icon: "Award" },
  { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov", icon: "Search" },
  { label: "Medscape", url: "https://www.medscape.com", icon: "Stethoscope" },
  { label: "Radiopaedia", url: "https://radiopaedia.org", icon: "Activity" },
  { label: "Geeky Medics", url: "https://geekymedics.com", icon: "ListChecks" },
  { label: "Osmosis", url: "https://www.osmosis.org", icon: "Brain" },
  { label: "AMBOSS", url: "https://www.amboss.com", icon: "BookOpen" },
  { label: "Kenhub", url: "https://www.kenhub.com", icon: "Bone" },
  { label: "TeachMeAnatomy", url: "https://teachmeanatomy.info", icon: "Bone" },
  { label: "Drugs.com", url: "https://www.drugs.com", icon: "Pill" },
  { label: "WHO", url: "https://www.who.int", icon: "Syringe" },
];

/* ───────────────────────── Persistent study tracker ───────────────────────── */

type Status = 0 | 1 | 2; // to-do · learning · confident
const PROG_KEY = "nucleus-mbbs-progress-v1";

const STATUS_META = [
  { label: "To-do", icon: "Circle", cls: "border-ink/15 bg-white/40 text-faint" },
  { label: "Learning", icon: "BookOpen", cls: "border-ink/25 bg-white/75 text-strong" },
  { label: "Confident", icon: "CheckCircle2", cls: "border-transparent bg-ink text-white" },
] as const;

function useProgress() {
  const [map, setMap] = useState<Record<string, Status>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROG_KEY);
      if (raw) setMap(JSON.parse(raw));
    } catch {
      /* ignore corrupt state */
    }
  }, []);
  const cycle = (name: string) =>
    setMap((m) => {
      const next = { ...m, [name]: (((m[name] ?? 0) + 1) % 3) as Status };
      try {
        localStorage.setItem(PROG_KEY, JSON.stringify(next));
      } catch {
        /* storage full / unavailable */
      }
      return next;
    });
  return { map, cycle };
}

/* ───────────────────────── View ───────────────────────── */

export function MbbsView() {
  const askAssistant = useUI((s) => s.askAssistant);
  const { map, cycle } = useProgress();
  const [phaseId, setPhaseId] = useState("p1");
  const [topic, setTopic] = useState("");

  const phase = PHASES.find((p) => p.id === phaseId)!;

  const allSubjects = useMemo(
    () => Array.from(new Set(PHASES.flatMap((p) => p.subjects.map((s) => s.name)))),
    [],
  );
  const confident = allSubjects.filter((n) => map[n] === 2).length;
  const learning = allSubjects.filter((n) => map[n] === 1).length;
  const todo = allSubjects.length - confident - learning;
  const pct = allSubjects.length ? Math.round((confident / allSubjects.length) * 100) : 0;

  const ask = (template: (t: string) => string) => {
    const t = topic.trim() || phase.subjects[0]?.name || "an MBBS topic";
    askAssistant(template(t));
  };

  const TUTOR = [
    { label: "Explain", icon: "Sparkles", t: (t: string) => `Explain "${t}" for an MBBS student — clear and structured, with clinical correlation and the high-yield points I must remember for exams.` },
    { label: "5 MCQs", icon: "ListChecks", t: (t: string) => `Write 5 NEET-PG-style MCQs on "${t}" with four options each, the correct answer, and a one-line explanation for every question.` },
    { label: "Mnemonic", icon: "Brain", t: (t: string) => `Give me memorable mnemonics and quick memory aids to recall "${t}" at MBBS level.` },
    { label: "Viva case", icon: "Stethoscope", t: (t: string) => `Give a short clinical case scenario on "${t}" with likely diagnosis, key investigations and management — viva / OSCE style.` },
  ];

  return (
    <div className="space-y-5">
      {/* progress stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile iconName="CheckCircle2" label="Confident" value={confident} delay={0} />
        <StatTile iconName="BookOpen" label="Learning" value={learning} delay={0.05} />
        <StatTile iconName="ListChecks" label="Still to-do" value={todo} delay={0.1} />
        <StatTile iconName="TrendingUp" label="Syllabus confident" value={pct} suffix="%" delay={0.15} variant="charcoal" />
      </div>

      {/* curriculum + study tracker */}
      <GlassCard depth={2} delay={0.1}>
        <CardHeader
          iconName="GraduationCap"
          eyebrow="NMC · Competency-based MBBS"
          title="Curriculum & study tracker"
          right={<span className="hidden text-[11.5px] text-faint sm:block">Tap a subject to mark progress</span>}
        />

        {/* phase tabs */}
        <div className="scroll-area -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {PHASES.map((p) => {
            const on = p.id === phaseId;
            return (
              <button
                key={p.id}
                onClick={() => setPhaseId(p.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition",
                  on ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/40 text-muted hover:bg-white/70",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="mb-3 text-[12px] text-muted">{phase.tag}</div>

        {/* subjects */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {phase.subjects.map((s) => {
            const status = map[s.name] ?? 0;
            const meta = STATUS_META[status];
            return (
              <button
                key={s.name}
                onClick={() => cycle(s.name)}
                title={`${s.name} — ${meta.label} (tap to change)`}
                className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/40 p-3 text-left transition hover:bg-white/70"
              >
                <IconCapsule name={s.icon} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-strong">{s.name}</div>
                  <div className="truncate text-[11.5px] text-muted">{s.sub}</div>
                </div>
                <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10.5px] font-medium transition", meta.cls)}>
                  <Icon name={meta.icon} size={11} />
                  <span className="hidden sm:inline">{meta.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* AI tutor */}
        <GlassCard variant="charcoal" depth={2} delay={0.15}>
          <CardHeader iconName="Sparkles" eyebrow="Powered by Nucleus AI" title="MBBS tutor" tone="dark" />
          <p className="-mt-1 mb-3 text-[12.5px] text-white/60">
            Type a topic, then pick an action — it opens in the Assistant.
          </p>
          <GlassInput
            tone="dark"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(TUTOR[0].t)}
            placeholder="e.g. Brachial plexus, DKA, Tetralogy of Fallot…"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {TUTOR.map((a) => (
              <button
                key={a.label}
                onClick={() => ask(a.t)}
                className="focus-ring flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] font-medium text-white/85 transition hover:bg-white/15"
              >
                <Icon name={a.icon} size={15} /> {a.label}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* high-yield for selected phase */}
        <GlassCard depth={2} delay={0.2}>
          <CardHeader
            iconName="Target"
            eyebrow="Must-revise"
            title={`High-yield · ${phase.label}`}
            right={<span className="text-[12px] text-muted">{phase.highYield.length}</span>}
          />
          <ul className="space-y-2">
            {phase.highYield.map((h, i) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-start gap-2.5 text-[13.5px] text-body"
              >
                <Icon name="ChevronRight" size={15} className="mt-0.5 shrink-0 text-faint" />
                <span>{h}</span>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* normal lab values */}
        <GlassCard depth={2} delay={0.15}>
          <CardHeader iconName="FlaskConical" eyebrow="Quick reference" title="Normal lab values" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {LAB_VALUES.map((l) => (
              <div key={l.test} className="flex items-baseline justify-between gap-3 border-b border-ink/5 py-1.5">
                <span className="text-[12.5px] text-muted">{l.test}</span>
                <span className="tabular shrink-0 text-[12.5px] font-medium text-strong">{l.range}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-faint">Reference ranges vary by lab — always check your report&apos;s own values.</p>
        </GlassCard>

        {/* vitals + formulas */}
        <div className="space-y-5">
          <GlassCard depth={2} delay={0.2}>
            <CardHeader iconName="Activity" eyebrow="Adult normal" title="Vitals" />
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {VITALS.map((v) => (
                <div key={v.k} className="flex items-baseline justify-between gap-3 border-b border-ink/5 py-1.5">
                  <span className="text-[12.5px] text-muted">{v.k}</span>
                  <span className="tabular shrink-0 text-[12.5px] font-medium text-strong">{v.v}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard depth={2} delay={0.25}>
            <CardHeader iconName="ClipboardList" eyebrow="Clinical" title="Formulas" />
            <div className="grid grid-cols-1 gap-x-6">
              {FORMULAS.map((f) => (
                <div key={f.k} className="flex items-baseline justify-between gap-3 border-b border-ink/5 py-1.5">
                  <span className="shrink-0 text-[12.5px] font-medium text-strong">{f.k}</span>
                  <span className="tabular text-right text-[12px] text-muted">{f.v}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* mnemonics */}
        <GlassCard depth={2} delay={0.15}>
          <CardHeader iconName="Brain" eyebrow="Memory aids" title="Classic mnemonics" />
          <div className="space-y-3">
            {MNEMONICS.map((m) => (
              <div key={m.topic} className="rounded-2xl border border-ink/10 bg-white/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-faint">{m.topic}</div>
                <div className="mt-0.5 text-[13.5px] font-medium text-strong">{m.m}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* resources */}
        <GlassCard depth={2} delay={0.2}>
          <CardHeader iconName="BookOpen" eyebrow="Bookmarks" title="Resources" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {RESOURCES.map((r) => (
              <a
                key={r.label}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/40 px-3 py-2.5 text-[12.5px] font-medium text-strong transition hover:bg-white/70"
              >
                <Icon name={r.icon} size={15} className="shrink-0 text-muted" />
                <span className="truncate">{r.label}</span>
                <Icon name="ExternalLink" size={12} className="ml-auto shrink-0 text-faint opacity-0 transition group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
