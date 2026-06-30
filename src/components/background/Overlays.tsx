"use client";

/** Fixed, non-interactive ambient overlays that sit above everything. */
export function Overlays() {
  return (
    <>
      <div className="cursor-spotlight" aria-hidden />
      <div className="vignette-overlay" aria-hidden />
      <div className="grain-overlay" aria-hidden />
    </>
  );
}
