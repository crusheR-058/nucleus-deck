"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

type Variant = "frosted" | "dark" | "ghost";
type Size = "sm" | "md" | "lg";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconName?: string;
  iconRight?: string;
  loading?: boolean;
  full?: boolean;
}

const sizes: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-[15px] px-5 py-3 gap-2.5",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(function GlassButton(
  { variant = "frosted", size = "md", iconName, iconRight, loading, full, className, children, disabled, ...rest },
  ref,
) {
  const base =
    variant === "ghost"
      ? "rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-strong transition-colors"
      : variant === "dark"
        ? "liquid-btn liquid-btn-dark"
        : "liquid-btn";

  const ic = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "focus-ring inline-flex select-none items-center justify-center whitespace-nowrap font-medium",
        sizes[size],
        base,
        full && "w-full",
        (disabled || loading) && "cursor-not-allowed opacity-50",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Icon name="Loader2" size={ic} className="animate-spin" />
      ) : (
        iconName && <Icon name={iconName} size={ic} />
      )}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={ic} />}
    </button>
  );
});
