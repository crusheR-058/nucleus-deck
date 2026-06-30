"use client";

import { AnimatePresence, motion } from "framer-motion";

/** Cinematic boot overlay — the nucleus forms, then the curtain lifts. */
export function Boot({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] grid place-items-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
          style={{ background: "var(--boot-bg)" }}
        >
          <div className="flex flex-col items-center gap-7">
            <div className="relative h-28 w-28">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border border-ink/20"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1 + i * 0.18, opacity: [0, 0.8, 0.4] }}
                  transition={{ duration: 1.4, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  style={{ borderTopColor: "rgba(11,11,14,0.55)" }}
                />
              ))}
              <motion.span
                className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white to-silver shadow-[0_0_30px_-2px_rgba(255,255,255,0.95)]"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.25, 1], opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="font-display text-2xl font-medium tracking-tight text-strong">Nucleus Deck</div>
              <div className="mt-1 text-xs tracking-[0.3em] text-faint">CALIBRATING YOUR DAY</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
