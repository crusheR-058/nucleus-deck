"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-2xl border border-white/40 bg-white/45 px-4 py-2.5 text-[15px] text-strong placeholder:text-faint " +
  "shadow-[inset_0_1px_2px_rgba(8,8,12,0.06)] backdrop-blur-md outline-none transition " +
  "focus:border-white/80 focus:bg-white/65 focus:shadow-[inset_0_1px_2px_rgba(8,8,12,0.06),0_0_0_3px_rgba(255,255,255,0.5)]";

const inputDark =
  "w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-2.5 text-[15px] text-white placeholder:text-white/35 " +
  "outline-none transition focus:border-white/30 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)]";

export const GlassInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { tone?: "light" | "dark" }>(
  function GlassInput({ className, tone = "light", ...rest }, ref) {
    return <input ref={ref} className={cn(tone === "dark" ? inputDark : inputBase, className)} {...rest} />;
  },
);

export const GlassTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { tone?: "light" | "dark" }>(
  function GlassTextarea({ className, tone = "light", ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(tone === "dark" ? inputDark : inputBase, "resize-none leading-relaxed", className)}
        {...rest}
      />
    );
  },
);
