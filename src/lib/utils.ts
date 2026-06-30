import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact unique id (no external dep). */
export function uid(prefix = "") {
  return (
    prefix +
    Date.now().toString(36).slice(-5) +
    Math.random().toString(36).slice(2, 7)
  );
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ── Dates ──────────────────────────────────────────────
export function dateKey(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey() {
  return dateKey(new Date());
}

/** Returns YYYY-MM-DD for N days before today. */
export function daysAgoKey(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

/** Last `n` day-keys, oldest first (includes today). */
export function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => daysAgoKey(n - 1 - i));
}

export function shortDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "narrow" });
}

export function greetingFor(hour: number, name: string) {
  const part =
    hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";
  return `${part}, ${name}`;
}

// ── Formatters ─────────────────────────────────────────
export function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** ISO-8601 duration (PT#H#M#S) -> "h:mm:ss" / "m:ss". */
export function formatDuration(iso?: string) {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  const ss = `${s}`.padStart(2, "0");
  if (h > 0) return `${h}:${`${min}`.padStart(2, "0")}:${ss}`;
  return `${min}:${ss}`;
}

export function formatViews(v?: string | number) {
  const n = typeof v === "string" ? Number(v) : v;
  if (!n || Number.isNaN(n)) return "";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B views`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M views`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K views`;
  return `${n} views`;
}

export function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

export function mmss(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${`${m}`.padStart(2, "0")}:${`${s}`.padStart(2, "0")}`;
}
