"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, greetingFor, lerp } from "./utils";

/**
 * Module-level pointer state, smoothed every frame.
 * Read directly (e.g. inside R3F useFrame) without triggering React re-renders.
 *  x,y      : raw normalized -1..1
 *  sx,sy    : smoothed normalized -1..1
 *  px,py    : smoothed viewport fraction 0..1 (for spotlight position)
 */
export const pointer = { x: 0, y: 0, sx: 0, sy: 0, px: 0.5, py: 0.38, active: false };

let loopStarted = false;
let listeners = 0;

function startLoop(reduced: () => boolean) {
  if (loopStarted) return;
  loopStarted = true;

  const root = document.documentElement;
  let lastPx = -1;
  let lastPy = -1;
  let lastSx = -1;
  let lastSy = -1;

  const tick = () => {
    if (document.hidden) {
      requestAnimationFrame(tick);
      return;
    }

    const delta = Math.max(
      Math.abs(pointer.x - pointer.sx),
      Math.abs(pointer.y - pointer.sy)
    );

    const targetPx = (pointer.x + 1) / 2;
    const targetPy = (pointer.y + 1) / 2;

    if (delta < 0.004) {
      pointer.sx = pointer.x;
      pointer.sy = pointer.y;
      pointer.px = targetPx;
      pointer.py = targetPy;
    } else {
      const ease = reduced() ? 1 : 0.085;
      pointer.sx = lerp(pointer.sx, pointer.x, ease);
      pointer.sy = lerp(pointer.sy, pointer.y, ease);
      pointer.px = lerp(pointer.px, targetPx, ease);
      pointer.py = lerp(pointer.py, targetPy, ease);
    }

    // Only touch DOM / CSS custom properties if values meaningfully changed
    if (
      Math.abs(pointer.px - lastPx) > 0.003 ||
      Math.abs(pointer.py - lastPy) > 0.003 ||
      Math.abs(pointer.sx - lastSx) > 0.003 ||
      Math.abs(pointer.sy - lastSy) > 0.003
    ) {
      lastPx = pointer.px;
      lastPy = pointer.py;
      lastSx = pointer.sx;
      lastSy = pointer.sy;

      root.style.setProperty("--mx", pointer.sx.toFixed(3));
      root.style.setProperty("--my", pointer.sy.toFixed(3));
      root.style.setProperty("--cursor-x", `${(pointer.px * 100).toFixed(1)}%`);
      root.style.setProperty("--cursor-y", `${(pointer.py * 100).toFixed(1)}%`);

      if (!reduced()) {
        root.style.setProperty("--tilt-x", `${(-pointer.sy * 1.5).toFixed(2)}deg`);
        root.style.setProperty("--tilt-y", `${(pointer.sx * 1.5).toFixed(2)}deg`);
      }
    }

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Mount once near the app root. Tracks the pointer and powers parallax + lighting. */
export function usePointerLight() {
  const reducedRef = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => (reducedRef.current = mq.matches);
    sync();
    mq.addEventListener?.("change", sync);

    const onMove = (e: PointerEvent) => {
      pointer.x = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
      pointer.y = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
      pointer.active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    listeners++;
    startLoop(() => reducedRef.current);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      mq.removeEventListener?.("change", sync);
      listeners--;
    };
  }, []);
}

/** True only after first client mount — guards localStorage hydration. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** Respects the OS reduced-motion setting. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

export interface ClockState {
  now: Date;
  hour: number;
  time: string;
  seconds: string;
  meridiem: string;
  date: string;
  weekday: string;
}

/** Live clock + greeting, ticking every second. */
export function useClock(name: string): ClockState & { greeting: string } {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const h12 = hour % 12 || 12;
  const min = `${now.getMinutes()}`.padStart(2, "0");
  return {
    now,
    hour,
    time: `${h12}:${min}`,
    seconds: `${now.getSeconds()}`.padStart(2, "0"),
    meridiem: hour < 12 ? "AM" : "PM",
    date: now.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    weekday: now.toLocaleDateString("en-US", { weekday: "long" }),
    greeting: greetingFor(hour, name),
  };
}
