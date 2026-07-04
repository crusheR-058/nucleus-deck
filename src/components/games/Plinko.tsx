"use client";

import { useEffect, useRef, useState } from "react";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { BetInput } from "./BetInput";

const ROWS = 8;
const MULT = [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6]; // ROWS + 1 buckets
const CHIPS = [50, 100, 500];
const MAX_BALLS = 40;

interface Ball {
  id: number;
  row: number;
  pos: number;
}

interface CanvasBall {
  id: number;
  stake: number;
  path: number[]; // pre-calculated choices: 0 (left), 1 (right)
  step: number;    // current step (0 to ROWS-1)
  t: number;       // progress in current step (0.0 to 1.0)
  pos: number;     // current horizontal position index
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;      // 1.0 to 0.0
  decay: number;     // life decay rate per second
  type: "spark" | "confetti";
  rotation?: number;
  rotSpeed?: number;
}

export function Plinko() {
  const chips = useDeck((s) => s.casinoChips);
  const adjust = useDeck((s) => s.adjustChips);
  const [bet, setBet] = useState(100);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [queuedCount, setQueuedCount] = useState(0);
  const [lastBucket, setLastBucket] = useState<number | null>(null);
  const [activeBuckets, setActiveBuckets] = useState<Record<number, boolean>>({});
  const [msg, setMsg] = useState("Drop one or tap repeatedly — they fall at once.");
  const idRef = useRef(0);

  // Canvas and animation state references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBallsRef = useRef<CanvasBall[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const pegPulsesRef = useRef<Record<string, number>>({});
  const lastTimeRef = useRef<number>(0);
  const loopRef = useRef<number>();

  // Use refs for React state/actions to avoid stale closure bugs in the canvas loop
  const adjustRef = useRef(adjust);
  const setLastBucketRef = useRef(setLastBucket);
  const setMsgRef = useRef(setMsg);
  const setBallsRef = useRef(setBalls);

  useEffect(() => {
    adjustRef.current = adjust;
    setLastBucketRef.current = setLastBucket;
    setMsgRef.current = setMsg;
    setBallsRef.current = setBalls;
  });

  // Coordinates helper functions
  const getPegX = (r: number, c: number, width: number) => {
    return ((c - (r + 1) / 2) / ROWS + 0.5) * width;
  };

  const getPegY = (r: number, height: number) => {
    return (r / ROWS) * 0.88 * height + 0.04 * height;
  };

  const getBallX = (r: number, pos: number, width: number) => {
    if (r === 0) return width / 2;
    return ((pos - r / 2) / ROWS + 0.5) * width;
  };

  const getBallY = (r: number, height: number) => {
    if (r === 0) return 0;
    return (r / ROWS) * 0.88 * height;
  };

  const getBucketX = (bucket: number, width: number) => {
    return ((bucket + 0.5) / (ROWS + 1)) * width;
  };

  // Particle generators
  const spawnSparks = (x: number, y: number) => {
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 6 - Math.random() * (2 * Math.PI / 3); // upward arc
      const speed = 30 + Math.random() * 70;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() < 0.4 ? "#111827" : Math.random() < 0.7 ? "#6b7280" : "#d1d5db",
        size: 1.2 + Math.random() * 1.5,
        life: 1.0,
        decay: 1.8 + Math.random() * 2.0,
        type: "spark",
      });
    }
  };

  const spawnConfetti = (x: number, y: number) => {
    const count = 25 + Math.floor(Math.random() * 10);
    const colors = ["#111827", "#4b5563", "#9ca3af", "#d1d5db", "#ffffff"];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2.5); // upward fan
      const speed = 200 + Math.random() * 150;
      particlesRef.current.push({
        x,
        y: y - 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 3,
        life: 1.0,
        decay: 0.5 + Math.random() * 0.4,
        type: "confetti",
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 12,
      });
    }
  };

  // Main canvas animation and physics loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    // Handle high-DPI scaling on resizing
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    // Physics update step
    const updatePhysics = (deltaTime: number) => {
      const STEP_DURATION = 0.20; // 200ms per step
      const T_COLLISION = 0.45;    // collision occurs at 45% of the step duration

      // Decay peg pulses
      const pulses = pegPulsesRef.current;
      for (const key in pulses) {
        if (pulses[key] > 0) {
          pulses[key] = Math.max(0, pulses[key] - deltaTime * 6);
          if (pulses[key] === 0) delete pulses[key];
        }
      }

      // Update particles
      const particles = particlesRef.current;
      particles.forEach((p) => {
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= p.decay * deltaTime;

        if (p.type === "confetti") {
          p.vy += 850 * deltaTime; // gravity pull
          if (p.rotation !== undefined && p.rotSpeed !== undefined) {
            p.rotation += p.rotSpeed * deltaTime;
          }
        } else {
          // Spark friction / drag
          p.vx *= 0.94;
          p.vy *= 0.94;
        }
      });
      particlesRef.current = particles.filter((p) => p.life > 0);

      // Update active balls
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const ballsList = canvasBallsRef.current;
      const nextBallsList: CanvasBall[] = [];

      ballsList.forEach((b) => {
        const prevT = b.t;
        b.t += deltaTime / STEP_DURATION;

        // Collision logic (for non-final steps)
        if (b.step < ROWS - 1) {
          if (prevT < T_COLLISION && b.t >= T_COLLISION) {
            const pegRow = b.step + 1;
            const pegCol = b.pos + 1;

            pegPulsesRef.current[`${pegRow}-${pegCol}`] = 1.0;

            const px = getPegX(pegRow, pegCol, W);
            const py = getPegY(pegRow, H);
            spawnSparks(px, py);
          }
        }

        if (b.t >= 1.0) {
          const nextPos = b.pos + b.path[b.step];
          const nextStep = b.step + 1;

          if (nextStep >= ROWS) {
            // Ball reached bottom
            const finalBucket = nextPos;
            const win = Math.round(b.stake * MULT[finalBucket]);

            adjustRef.current(win);
            setLastBucketRef.current(finalBucket);
            setMsgRef.current(`${MULT[finalBucket]}× → +${win.toLocaleString()}`);

            // Pulse the bucket style in React state
            setActiveBuckets((prev) => ({ ...prev, [finalBucket]: true }));
            setTimeout(() => {
              setActiveBuckets((prev) => ({ ...prev, [finalBucket]: false }));
            }, 300);

            // Confetti for premium high-multipliers
            if (MULT[finalBucket] >= 2.0) {
              const bx = getBucketX(finalBucket, W);
              spawnConfetti(bx, H);
            }

            // Remove from React active balls count
            setBallsRef.current((prevBalls) => prevBalls.filter((x) => x.id !== b.id));
          } else {
            // Keep traveling
            b.step = nextStep;
            b.pos = nextPos;
            b.t = 0;
            nextBallsList.push(b);
          }
        } else {
          nextBallsList.push(b);
        }
      });

      canvasBallsRef.current = nextBallsList;
    };

    // Render step
    const render = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      // 1. Render Pegs
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < r + 2; c++) {
          const px = getPegX(r, c, W);
          const py = getPegY(r, H);
          const pulse = pegPulsesRef.current[`${r}-${c}`] || 0;

          const baseRad = 2.5;
          const rad = baseRad + pulse * 3.5;

          // Shockwave outline glow
          if (pulse > 0) {
            ctx.beginPath();
            ctx.arc(px, py, rad + pulse * 5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(18, 18, 18, ${pulse * 0.15})`;
            ctx.fill();
          }

          // Peg body
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fillStyle = pulse > 0 
            ? `rgba(18, 18, 18, ${0.45 + pulse * 0.55})` 
            : "rgba(18, 18, 18, 0.25)";
          ctx.fill();

          // Peg core highlighting
          ctx.beginPath();
          ctx.arc(px, py, 0.75, 0, Math.PI * 2);
          ctx.fillStyle = pulse > 0 ? "#ffffff" : "rgba(18, 18, 18, 0.35)";
          ctx.fill();
        }
      }

      // 2. Render Particles
      particlesRef.current.forEach((p) => {
        if (p.type === "confetti") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
          ctx.restore();
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life * 0.8;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      });
      ctx.globalAlpha = 1.0;

      // 3. Render Balls
      canvasBallsRef.current.forEach((b) => {
        let bx = W / 2;
        let by = 0;

        const startX = getBallX(b.step, b.pos, W);
        const startY = getBallY(b.step, H);

        if (b.step < ROWS - 1) {
          // Calculate peg target
          const targetPegX = startX;
          const targetPegY = getPegY(b.step + 1, H);

          const nextPos = b.pos + b.path[b.step];
          const endX = getBallX(b.step + 1, nextPos, W);
          const endY = getBallY(b.step + 1, H);

          const T_COLLISION = 0.45;
          const hBounce = 15;

          if (b.t < T_COLLISION) {
            // Downward acceleration phase
            const u = b.t / T_COLLISION;
            bx = startX;
            by = startY + u * u * (targetPegY - startY);
          } else {
            // Parabolic bounce arc phase
            const v = (b.t - T_COLLISION) / (1 - T_COLLISION);
            bx = targetPegX + v * (endX - targetPegX);
            
            const linearY = targetPegY + v * (endY - targetPegY);
            const bounceArc = -4 * hBounce * v * (1 - v);
            by = linearY + bounceArc;
          }
        } else {
          // Final landing slide into bucket
          const nextPos = b.pos + b.path[b.step];
          const endX = getBucketX(nextPos, W);
          const endY = H;

          bx = startX + b.t * (endX - startX);
          by = startY + b.t * b.t * (endY - startY);
        }

        const ballRad = 5.5;

        // Shadow circle
        ctx.beginPath();
        ctx.arc(bx, by + 1.5, ballRad - 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fill();

        // 3D sphere gradient fill
        const grad = ctx.createRadialGradient(
          bx - 1.5, by - 1.5, 0.5,
          bx, by, ballRad
        );
        grad.addColorStop(0, "#555555");
        grad.addColorStop(0.35, "#1a1a1a");
        grad.addColorStop(1, "#0a0a0a");

        ctx.beginPath();
        ctx.arc(bx, by, ballRad, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      ctx.restore();
    };

    // Frame runner tick loop
    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Restrict delta jump for inactive tab recovery
      const deltaTime = Math.min(elapsed / 1000, 0.1);

      updatePhysics(deltaTime);
      render();

      loopRef.current = requestAnimationFrame(tick);
    };

    loopRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, []);

  const drop = (count: number = 1) => {
    const activeAndQueued = balls.length + queuedCount;
    const safeCount = Math.min(count, MAX_BALLS - activeAndQueued);
    if (safeCount <= 0) return;

    const totalCost = bet * safeCount;
    if (totalCost > chips) {
      setMsg("Not enough chips.");
      return;
    }

    // Deduct cost immediately for all drops
    adjust(-totalCost);
    setQueuedCount((q) => q + safeCount);

    // Stagger drop triggers using setTimeout
    for (let i = 0; i < safeCount; i++) {
      setTimeout(() => {
        const id = ++idRef.current;
        const stake = bet;
        const path = Array.from({ length: ROWS }, () => (Math.random() < 0.5 ? 1 : 0));

        setBallsRef.current((prev) => [...prev, { id, row: 0, pos: 0 }]);
        canvasBallsRef.current.push({
          id,
          stake,
          path,
          step: 0,
          t: 0,
          pos: 0,
        });

        setQueuedCount((q) => Math.max(0, q - 1));
      }, i * 100); // 100ms staggered cascade stream
    }
  };

  const totalInFlight = balls.length + queuedCount;

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader
        iconName="Triangle"
        eyebrow="Drop & bounce"
        title="Plinko"
        right={totalInFlight > 0 ? <span className="tabular text-[12px] text-muted">{totalInFlight} in play</span> : undefined}
      />

      {/* Canvas container replaces standard HTML pegs grid */}
      <div className="relative mx-auto mb-3 h-64 w-full max-w-sm overflow-hidden rounded-2xl border border-ink/10 bg-white/10">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      {/* Buckets with dynamic bounce/flash styling */}
      <div className="mb-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${MULT.length}, minmax(0, 1fr))` }}>
        {MULT.map((m, i) => (
          <div
            key={i}
            className={cn(
              "tabular rounded-lg border py-1.5 text-center text-[11px] font-medium transition-all duration-200",
              activeBuckets[i]
                ? "border-transparent bg-ink text-white scale-105 shadow-lg"
                : lastBucket === i
                ? "border-ink/30 bg-ink/10 text-strong font-semibold"
                : "border-ink/12 bg-white/40 text-strong hover:bg-white/60",
            )}
          >
            {m}×
          </div>
        ))}
      </div>

      <p className="mb-4 text-center text-[13.5px] text-body">{msg}</p>

      <div className="flex flex-wrap items-center gap-3">
        <BetInput value={bet} onChange={setBet} chips={chips} presets={CHIPS} />
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => drop(1)}
            disabled={bet > chips || bet < 1 || totalInFlight >= MAX_BALLS}
            className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
          >
            <Icon name="Triangle" size={13} /> Drop 1
          </button>
          
          <button
            onClick={() => drop(5)}
            disabled={bet * 5 > chips || bet < 1 || totalInFlight + 5 > MAX_BALLS}
            className="inline-flex items-center gap-1 rounded-full bg-ink/10 border border-ink/20 px-3.5 py-2.5 text-[13px] font-medium text-strong transition hover:bg-ink/15 active:scale-95 disabled:opacity-40"
          >
            5×
          </button>
          
          <button
            onClick={() => drop(10)}
            disabled={bet * 10 > chips || bet < 1 || totalInFlight + 10 > MAX_BALLS}
            className="inline-flex items-center gap-1 rounded-full bg-ink/10 border border-ink/20 px-3.5 py-2.5 text-[13px] font-medium text-strong transition hover:bg-ink/15 active:scale-95 disabled:opacity-40"
          >
            10×
          </button>
        </div>
        
        <span className="text-[11px] text-faint">Drop multi-balls in a staggered stream</span>
      </div>
    </GlassCard>
  );
}
