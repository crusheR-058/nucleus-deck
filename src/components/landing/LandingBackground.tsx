"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function LandingBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const PARTICLE_COUNT = 90;
    const particles: {
      x: number;
      y: number;
      z: number;
      size: number;
      alpha: number;
      baseAlpha: number;
      speed: number;
      pulseSpeed: number;
      pulsePhase: number;
    }[] = [];

    function resize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.45 + 0.1,
        baseAlpha: Math.random() * 0.45 + 0.1,
        speed: Math.random() * 0.25 + 0.08,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    function render() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      t += 0.016;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed * p.z;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const currentAlpha = p.baseAlpha * (0.7 + 0.3 * Math.sin(t * p.pulseSpeed * 60 + p.pulsePhase));

        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.z, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050506]">
      {/* Dynamic ambient cursor spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(900px 700px at var(--cursor-x, 50%) var(--cursor-y, 35%), rgba(255, 255, 255, 0.04), transparent 60%)",
        }}
      />

      {/* Deep spatial volumetric glows */}
      <div
        className="absolute -top-[20%] left-1/2 h-[75vw] w-[75vw] -translate-x-1/2 rounded-full opacity-30 blur-[140px]"
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(120, 125, 145, 0.03) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-[60%] -left-[10%] h-[50vw] w-[50vw] rounded-full opacity-25 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 65%)",
        }}
      />

      {/* Faint concentric cosmic orbit rings inspired by reference video */}
      <div className="absolute left-1/2 top-1/2 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 opacity-[0.035]">
        <div className="absolute inset-0 rounded-full border border-white" />
        <div className="absolute inset-[140px] rounded-full border border-white" />
        <div className="absolute inset-[300px] rounded-full border border-dashed border-white" />
        <div className="absolute inset-[460px] rounded-full border border-white" />
      </div>

      {/* Floating stars/particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

      {/* Vignette edge shading */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 6, 0.8) 100%)",
        }}
      />

      {/* Film grain */}
      <div className="grain-overlay opacity-[0.025]" />
    </div>
  );
}
