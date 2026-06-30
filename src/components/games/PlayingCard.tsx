"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/cards";

export function PlayingCard({
  card,
  hidden,
  selected,
  onClick,
  index = 0,
}: {
  card?: Card;
  hidden?: boolean;
  selected?: boolean;
  onClick?: () => void;
  index?: number;
}) {
  return (
    <motion.div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      initial={{ y: -8, opacity: 0 }}
      animate={{ opacity: 1, y: selected ? -8 : 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "relative grid h-24 w-16 shrink-0 place-items-center rounded-xl border text-[#09090b] transition",
        hidden
          ? "border-white/15 bg-ink text-2xl text-white/25"
          : "border-ink/15 bg-white shadow-[0_6px_16px_-8px_rgba(8,8,12,0.5)]",
        selected && "ring-2 ring-ink",
        onClick && "cursor-pointer",
      )}
    >
      {hidden || !card ? (
        "✦"
      ) : (
        <>
          <span className="absolute left-1.5 top-1 text-[12px] font-semibold leading-none">{card.rank}</span>
          <span className="text-2xl leading-none">{card.suit}</span>
          <span className="absolute bottom-1 right-1.5 rotate-180 text-[12px] font-semibold leading-none">{card.rank}</span>
          {selected && (
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-wide text-strong">
              Hold
            </span>
          )}
        </>
      )}
    </motion.div>
  );
}
