"use client";

import { useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { BetInput } from "./BetInput";

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const colorLabel = (n: number) => (n === 0 ? "zero" : RED.has(n) ? "red" : "black");

// Standard European single-zero wheel order (clockwise from 0).
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
  7, 28, 12, 35, 3, 26,
];
const STEP = 360 / WHEEL_ORDER.length;
const CX = 100;
const CY = 100;
const R = 84;

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

const SECTORS = WHEEL_ORDER.map((n, i) => {
  const c = i * STEP;
  const [x0, y0] = polar(R, c - STEP / 2);
  const [x1, y1] = polar(R, c + STEP / 2);
  const [tx, ty] = polar(R * 0.8, c);
  return {
    n,
    deg: c,
    tx,
    ty,
    d: `M ${CX} ${CY} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`,
    col: n === 0 ? "zero" : RED.has(n) ? "red" : "black",
  };
});

const fillFor = (col: string) => (col === "red" ? "#e4e4e7" : col === "zero" ? "#52525b" : "#101013");
const textFor = (col: string) => (col === "red" ? "#09090b" : "#fafafa");

interface OutsideBet {
  key: string;
  label: string;
  pay: number;
  test: (n: number) => boolean;
}
const OUTSIDE: OutsideBet[] = [
  { key: "red", label: "Red", pay: 1, test: (n) => RED.has(n) },
  { key: "black", label: "Black", pay: 1, test: (n) => n !== 0 && !RED.has(n) },
  { key: "odd", label: "Odd", pay: 1, test: (n) => n !== 0 && n % 2 === 1 },
  { key: "even", label: "Even", pay: 1, test: (n) => n !== 0 && n % 2 === 0 },
  { key: "low", label: "1–18", pay: 1, test: (n) => n >= 1 && n <= 18 },
  { key: "high", label: "19–36", pay: 1, test: (n) => n >= 19 && n <= 36 },
  { key: "d1", label: "1st 12", pay: 2, test: (n) => n >= 1 && n <= 12 },
  { key: "d2", label: "2nd 12", pay: 2, test: (n) => n >= 13 && n <= 24 },
  { key: "d3", label: "3rd 12", pay: 2, test: (n) => n >= 25 && n <= 36 },
];

const CHIPS = [10, 25, 100];

export function Roulette() {
  const chips = useDeck((s) => s.casinoChips);
  const adjustChips = useDeck((s) => s.adjustChips);

  const [chip, setChip] = useState(25);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [straight, setStraight] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [msg, setMsg] = useState("Place your bets.");

  const rWheel = useMotionValue(0);
  const rBall = useMotionValue(0);
  const wheelT = useTransform(rWheel, (v) => `rotate(${v} ${CX} ${CY})`);
  const ballT = useTransform(rBall, (v) => `rotate(${v} ${CX} ${CY})`);

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
  const straightBets = Object.keys(bets).filter((k) => k.startsWith("n"));

  const place = (key: string) => {
    if (spinning) return;
    if (totalStake + chip > chips) {
      setMsg("Not enough chips.");
      return;
    }
    setBets((b) => ({ ...b, [key]: (b[key] || 0) + chip }));
    setMsg("");
  };
  const placeStraight = () => {
    const n = parseInt(straight);
    if (isNaN(n) || n < 0 || n > 36) {
      setMsg("Enter a number 0–36.");
      return;
    }
    place(`n${n}`);
  };
  const clear = () => {
    if (!spinning) {
      setBets({});
      setMsg("Bets cleared.");
    }
  };

  const finish = (n: number) => {
    setResult(n);
    let win = 0;
    for (const o of OUTSIDE) {
      const st = bets[o.key] || 0;
      if (st && o.test(n)) win += st * (o.pay + 1);
    }
    for (const k of Object.keys(bets)) {
      if (k.startsWith("n") && parseInt(k.slice(1)) === n) win += bets[k] * 36;
    }
    if (win > 0) {
      adjustChips(win);
      setMsg(`${n} ${colorLabel(n)} — you win +${win}`);
    } else {
      setMsg(`${n} ${colorLabel(n)} — no win this time`);
    }
    setBets({});
    setSpinning(false);
  };

  const spin = () => {
    if (spinning || totalStake === 0) return;
    adjustChips(-totalStake);
    setSpinning(true);
    setResult(null);
    setMsg("No more bets — spinning…");

    const final = Math.floor(Math.random() * 37);
    const idx = WHEEL_ORDER.indexOf(final);
    const theta = idx * STEP;
    const cur = rWheel.get();
    const curMod = ((cur % 360) + 360) % 360;
    const desiredMod = (((-theta) % 360) + 360) % 360;
    const delta = (desiredMod - curMod + 360) % 360;
    const wheelTarget = cur + 360 * 5 + delta; // 5 turns, land winning pocket at top
    const ballTarget = rBall.get() - 360 * 9; // 9 turns the other way, ends at top

    animate(rBall, ballTarget, { duration: 4, ease: [0.16, 1, 0.3, 1] });
    animate(rWheel, wheelTarget, { duration: 4, ease: [0.16, 1, 0.3, 1], onComplete: () => finish(final) });
  };

  return (
    <GlassCard depth={2} delay={0.05}>
      {/* 3D tilted wheel */}
      <div className="mb-5 flex flex-col items-center">
        <div className="[perspective:1000px]">
          <div className="[transform:rotateX(58deg)] drop-shadow-[0_26px_20px_rgba(8,8,12,0.55)]">
            <svg viewBox="0 0 200 200" className="h-52 w-52 select-none sm:h-60 sm:w-60" aria-hidden>
              <defs>
                <radialGradient id="r-bowl" cx="50%" cy="32%" r="72%">
                  <stop offset="0%" stopColor="#3f3f46" />
                  <stop offset="55%" stopColor="#1c1c20" />
                  <stop offset="100%" stopColor="#09090b" />
                </radialGradient>
                <radialGradient id="r-hub" cx="50%" cy="30%" r="72%">
                  <stop offset="0%" stopColor="#71717a" />
                  <stop offset="60%" stopColor="#27272a" />
                  <stop offset="100%" stopColor="#09090b" />
                </radialGradient>
              </defs>
              {/* outer bowl + rim */}
              <circle cx={CX} cy={CY} r={98} fill="url(#r-bowl)" />
              <circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="#52525b" strokeOpacity={0.7} strokeWidth={2} />
              {/* spinning numbered ring */}
              <motion.g transform={wheelT}>
                {SECTORS.map((s) => (
                  <g key={s.n}>
                    <path d={s.d} fill={fillFor(s.col)} stroke="#ffffff" strokeOpacity={0.45} strokeWidth={0.4} />
                    <text
                      x={s.tx}
                      y={s.ty}
                      fontSize={7}
                      fontWeight={600}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={textFor(s.col)}
                      transform={`rotate(${s.deg} ${s.tx} ${s.ty})`}
                    >
                      {s.n}
                    </text>
                  </g>
                ))}
              </motion.g>
              {/* metallic hub */}
              <circle cx={CX} cy={CY} r={30} fill="url(#r-hub)" stroke="rgba(255,255,255,0.15)" />
              <ellipse cx={CX} cy={CY - 7} rx={19} ry={7} fill="rgba(255,255,255,0.10)" />
              <text x={CX} y={CY} fontSize={22} fontWeight={700} textAnchor="middle" dominantBaseline="central" fill="#fafafa">
                {result === null ? "" : result}
              </text>
              {/* ball */}
              <motion.g transform={ballT}>
                <circle cx={CX} cy={16} r={5} fill="#fafafa" stroke="#09090b" strokeWidth={0.6} />
                <circle cx={CX - 1.6} cy={14.4} r={1.5} fill="#ffffff" />
              </motion.g>
              {/* pointer */}
              <polygon points={`${CX},4 ${CX - 5},14 ${CX + 5},14`} fill="#fafafa" stroke="#09090b" strokeWidth={0.5} />
            </svg>
          </div>
        </div>
        <p className="mt-4 text-center text-[13.5px] text-body">{msg}</p>
      </div>

      {/* Chip denomination */}
      <div className="mb-3">
        <BetInput value={chip} onChange={setChip} chips={chips} presets={CHIPS} label="Chip" disabled={spinning} />
      </div>

      {/* Outside bets */}
      <div className="grid grid-cols-3 gap-2">
        {OUTSIDE.map((o) => (
          <button
            key={o.key}
            onClick={() => place(o.key)}
            disabled={spinning}
            className={cn(
              "rounded-2xl border p-3 text-left text-[13px] font-medium transition disabled:opacity-50",
              o.key === "red" && "border-ink/15 bg-white/75 text-strong hover:bg-white",
              o.key === "black" && "border-transparent bg-ink text-white hover:opacity-90",
              o.key !== "red" && o.key !== "black" && "border-ink/15 bg-white/40 text-strong hover:bg-white/70",
            )}
          >
            <div className="flex items-center justify-between">
              <span>{o.label}</span>
              <span className="text-[10px] opacity-60">{o.pay}:1</span>
            </div>
            {bets[o.key] > 0 && (
              <span className="tabular mt-1 inline-flex items-center gap-1 text-[11px] opacity-80">
                <Icon name="Coins" size={10} /> {bets[o.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Straight up */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={straight}
          onChange={(e) => setStraight(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && placeStraight()}
          placeholder="Number 0–36"
          inputMode="numeric"
          className="w-32 rounded-2xl border border-ink/15 bg-white/50 px-3 py-2 text-[13px] text-strong outline-none placeholder:text-faint focus:bg-white/80"
        />
        <button
          onClick={placeStraight}
          disabled={spinning}
          className="rounded-2xl border border-ink/15 bg-white/50 px-3 py-2 text-[13px] font-medium text-strong transition hover:bg-white/75 disabled:opacity-50"
        >
          Place 35:1
        </button>
        {straightBets.length > 0 && (
          <span className="text-[11px] text-muted">on {straightBets.map((k) => k.slice(1)).join(", ")}</span>
        )}
      </div>

      {/* Action row */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={spin}
          disabled={spinning || totalStake === 0}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          <Icon name="RefreshCw" size={14} className={spinning ? "animate-spin" : ""} /> Spin
        </button>
        <button
          onClick={clear}
          disabled={spinning || totalStake === 0}
          className="rounded-full border border-ink/15 px-4 py-2.5 text-[13px] font-medium text-muted transition hover:bg-white/40 disabled:opacity-40"
        >
          Clear
        </button>
        <span className="tabular ml-auto text-[12px] text-faint">Staked {totalStake}</span>
      </div>
    </GlassCard>
  );
}
