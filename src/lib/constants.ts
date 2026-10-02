import type { MoodKey, QuickLink, View } from "./types";

// ── Personalization (defaults; editable in Settings) ──────────
export const PROFILE = {
  name: "Om Devi Shankar",
  city: "Tambaram, Chennai",
  // Tambaram, Chennai — used for Open-Meteo (no API key needed).
  lat: 12.9249,
  lon: 80.1275,
  timezone: "Asia/Kolkata",
};

// ── Moods (emoji may carry their own color; everything else mono) ──
export interface MoodMeta {
  key: MoodKey;
  label: string;
  emoji: string;
  score: number; // 0..100 baseline for trend
  blurb: string;
  waveAmp: number; // waveform amplitude factor
  waveSpeed: number; // waveform speed factor
}

export const MOODS: Record<MoodKey, MoodMeta> = {
  radiant: { key: "radiant", label: "Radiant", emoji: "🤩", score: 100, blurb: "On top of the world", waveAmp: 1.0, waveSpeed: 1.6 },
  focused: { key: "focused", label: "Focused", emoji: "🎯", score: 86, blurb: "Locked in & clear", waveAmp: 0.7, waveSpeed: 1.25 },
  calm: { key: "calm", label: "Calm", emoji: "😌", score: 78, blurb: "Steady and easy", waveAmp: 0.45, waveSpeed: 0.8 },
  neutral: { key: "neutral", label: "Neutral", emoji: "😐", score: 55, blurb: "Just here", waveAmp: 0.35, waveSpeed: 1.0 },
  tired: { key: "tired", label: "Tired", emoji: "🥱", score: 40, blurb: "Running low", waveAmp: 0.3, waveSpeed: 0.6 },
  stressed: { key: "stressed", label: "Stressed", emoji: "😰", score: 28, blurb: "A lot on the plate", waveAmp: 1.2, waveSpeed: 2.1 },
  low: { key: "low", label: "Low", emoji: "🙁", score: 18, blurb: "Heavy day", waveAmp: 0.55, waveSpeed: 0.7 },
};

export const MOOD_ORDER: MoodKey[] = ["radiant", "focused", "calm", "neutral", "tired", "stressed", "low"];

// ── Quick links — seeded with the tools you live in ───────────
export const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { id: "ql-gmail", label: "Gmail", url: "https://mail.google.com", icon: "Mail" },
  { id: "ql-youtube", label: "YouTube", url: "https://youtube.com", icon: "Youtube" },
  { id: "ql-whatsapp", label: "WhatsApp", url: "https://web.whatsapp.com", icon: "MessageCircle" },
  { id: "ql-calendar", label: "Calendar", url: "https://calendar.google.com", icon: "CalendarDays" },
  { id: "ql-drive", label: "Drive", url: "https://drive.google.com", icon: "HardDrive" },
  { id: "ql-github", label: "GitHub", url: "https://github.com", icon: "GitBranch" },
];

// ── Habits — seeded around what matters most in your day ──────
export const DEFAULT_HABITS = [
  { name: "Gym / Train", icon: "Dumbbell" },
  { name: "Code & Systems (Daily)", icon: "Terminal" },
  { name: "Deep work block", icon: "BrainCircuit" },
  { name: "Hydrate", icon: "Droplets" },
];

// ── Sidebar / dock views ──────────────────────────────────────
export interface ViewMeta {
  key: View;
  label: string;
  icon: string; // lucide name
  hint: string;
}

export const VIEWS: ViewMeta[] = [
  { key: "home", label: "Home", icon: "LayoutGrid", hint: "Your daily deck" },
  { key: "studio", label: "Studio", icon: "Youtube", hint: "YouTube search & recommendations" },
  { key: "news", label: "News", icon: "Newspaper", hint: "Tech news feed" },
  { key: "assistant", label: "Assistant", icon: "Sparkles", hint: "AI assistant" },
  { key: "insights", label: "DevHub", icon: "Terminal", hint: "Software engineering & CS knowledge hub" },
  { key: "play", label: "Play", icon: "Clapperboard", hint: "Cricket, movies & markets" },
  { key: "games", label: "Games", icon: "Dices", hint: "Blackjack & roulette" },
  { key: "settings", label: "Settings", icon: "Settings2", hint: "Personalize the deck" },
];

// views shown in the bottom dock (segmented pill)
export const DOCK_VIEWS: View[] = ["home", "studio", "news", "assistant", "insights"];

// the only views reachable while Focus mode is on (DevHub + Assistant)
export const FOCUS_VIEWS: View[] = ["insights", "assistant"];

// ── News sections (NewsAPI category + Google News topic fallback) ─────
export interface NewsSection {
  id: string;
  label: string;
  category: string; // NewsAPI top-headlines category ("general" = Top)
  topic: string; // Google News RSS topic ("" = top stories) — used when no key
  query?: string; // when set, NewsAPI uses the /everything endpoint with this query
}

// NewsAPI's free tier has no India top-headlines, so India + topical-India use
// the /everything search; the rest use US top-headlines by category.
export const NEWS_SECTIONS: NewsSection[] = [
  { id: "top", label: "Top", category: "general", topic: "" },
  { id: "india", label: "India", category: "general", topic: "", query: "India" },
  { id: "business", label: "Business", category: "business", topic: "BUSINESS" },
  { id: "technology", label: "Technology", category: "technology", topic: "TECHNOLOGY" },
  { id: "science", label: "Science", category: "science", topic: "SCIENCE" },
  { id: "health", label: "Health", category: "health", topic: "HEALTH" },
  { id: "sports", label: "Sports", category: "sports", topic: "SPORTS" },
  { id: "entertainment", label: "Entertainment", category: "entertainment", topic: "ENTERTAINMENT" },
];

// ── WMO weather codes -> label + lucide icon ──────────────────
export const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear", icon: "Sun" },
  1: { label: "Mostly clear", icon: "Sun" },
  2: { label: "Partly cloudy", icon: "CloudSun" },
  3: { label: "Overcast", icon: "Cloud" },
  45: { label: "Fog", icon: "CloudFog" },
  48: { label: "Rime fog", icon: "CloudFog" },
  51: { label: "Light drizzle", icon: "CloudDrizzle" },
  53: { label: "Drizzle", icon: "CloudDrizzle" },
  55: { label: "Heavy drizzle", icon: "CloudDrizzle" },
  61: { label: "Light rain", icon: "CloudRain" },
  63: { label: "Rain", icon: "CloudRain" },
  65: { label: "Heavy rain", icon: "CloudRainWind" },
  71: { label: "Light snow", icon: "CloudSnow" },
  73: { label: "Snow", icon: "CloudSnow" },
  75: { label: "Heavy snow", icon: "CloudSnow" },
  80: { label: "Showers", icon: "CloudRain" },
  81: { label: "Showers", icon: "CloudRain" },
  82: { label: "Violent showers", icon: "CloudRainWind" },
  95: { label: "Thunderstorm", icon: "CloudLightning" },
  96: { label: "Storm + hail", icon: "CloudLightning" },
  99: { label: "Storm + hail", icon: "CloudLightning" },
};

export function wmoInfo(code: number) {
  return WMO[code] ?? { label: "—", icon: "Cloud" };
}
