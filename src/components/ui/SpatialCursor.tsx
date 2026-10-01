"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function SpatialCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Only run on non-touch devices with fine pointers
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let animId: number;
    let isHovered = false;
    let lastTarget: EventTarget | null = null;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.opacity = "1";
      dot.style.opacity = "1";

      // Throttle target checking to when target actually changes
      if (e.target !== lastTarget) {
        lastTarget = e.target;
        const target = e.target as HTMLElement | null;
        const hoveredNow = !!target?.closest?.("button, a, [role='button'], input, textarea, select, .liquid-btn, .glass-pill, [data-interactive]");
        if (hoveredNow !== isHovered) {
          isHovered = hoveredNow;
          if (isHovered) {
            cursor.classList.add("cursor-hover-active");
            dot.classList.add("dot-hover-active");
          } else {
            cursor.classList.remove("cursor-hover-active");
            dot.classList.remove("dot-hover-active");
          }
        }
      }
    };

    const onMouseLeave = () => {
      cursor.style.opacity = "0";
      dot.style.opacity = "0";
    };

    const onMouseEnter = () => {
      cursor.style.opacity = "1";
      dot.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    let lastRenderedX = -1;
    let lastRenderedY = -1;

    const tick = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const ease = reduced ? 1 : 0.22;
      currentX += (mouseX - currentX) * ease;
      currentY += (mouseY - currentY) * ease;

      const diff = Math.abs(currentX - lastRenderedX) + Math.abs(currentY - lastRenderedY);
      if (diff > 0.1) {
        lastRenderedX = currentX;
        lastRenderedY = currentY;
        cursor.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0) translate(-50%, -50%)`;
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [reduced]);

  return (
    <>
      <style jsx global>{`
        .spatial-cursor {
          width: 20px;
          height: 20px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: transparent;
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      height 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.25s ease,
                      background-color 0.25s ease;
          will-change: transform;
        }
        .spatial-cursor.cursor-hover-active {
          width: 44px;
          height: 44px;
          border-color: rgba(255, 255, 255, 0.65);
          background-color: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        }
        .spatial-dot {
          width: 4px;
          height: 4px;
          will-change: transform;
        }
        .spatial-dot.dot-hover-active {
          box-shadow: 0 0 6px #ffffff;
        }
      `}</style>

      {/* Outer lagging halo ring */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="spatial-cursor pointer-events-none fixed left-0 top-0 z-[9999] rounded-full opacity-0"
      />

      {/* Center pinpoint */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="spatial-dot pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-white opacity-0"
      />
    </>
  );
}
