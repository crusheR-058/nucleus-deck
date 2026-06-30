"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface Props {
  iconName: string;
  label: string;
  active?: boolean;
  tone?: "light" | "dark";
  size?: number;
  onClick?: () => void;
  className?: string;
}

/** Circular glass icon button used in the sidebar + dock. Glows on hover; brighter when active. */
export const GlassIconButton = forwardRef<HTMLButtonElement, Props>(function GlassIconButton(
  { iconName, label, active, tone = "dark", size = 44, onClick, className },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      style={{ width: size, height: size }}
      className={cn(
        "focus-ring group relative grid place-items-center rounded-full transition-colors duration-300",
        tone === "dark"
          ? active
            ? "bg-white/90 text-[#09090b] shadow-[0_0_22px_-2px_rgba(255,255,255,0.7)]"
            : "bg-white/8 text-white/70 hover:bg-white/18 hover:text-white"
          : active
            ? "bg-ink text-white shadow-[0_0_22px_-4px_rgba(255,255,255,0.6)]"
            : "bg-white/40 text-strong hover:bg-white/70",
        className,
      )}
    >
      <Icon name={iconName} size={size * 0.42} strokeWidth={active ? 2 : 1.7} />
      {/* soft outer glow on hover */}
      <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_26px_-6px_rgba(255,255,255,0.85)]" />
    </motion.button>
  );
});
