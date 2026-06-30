"use client";

import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/** A Lucide icon inside a floating glass capsule. */
export function IconCapsule({
  name,
  tone = "light",
  size = 38,
  className,
}: {
  name: string;
  tone?: "light" | "dark";
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl border",
        tone === "dark"
          ? "border-white/12 bg-white/8 text-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]"
          : "border-white/60 bg-white/55 text-strong shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_8px_18px_-12px_rgba(8,8,12,0.4)]",
        className,
      )}
    >
      <Icon name={name} size={size * 0.5} />
    </span>
  );
}

export function CardHeader({
  iconName,
  eyebrow,
  title,
  right,
  tone = "light",
  className,
}: {
  iconName?: string;
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {iconName && <IconCapsule name={iconName} tone={tone} />}
        <div className="min-w-0">
          {eyebrow && <div className="label-eyebrow">{eyebrow}</div>}
          <h3 className={cn("truncate font-display text-lg font-medium tracking-tight", tone === "dark" ? "text-white" : "text-strong")}>
            {title}
          </h3>
        </div>
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}
