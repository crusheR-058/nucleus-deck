// ── Core data model for Nucleus Deck ──────────────────────────

export type Priority = "low" | "med" | "high";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
  estimateMin?: number; // used by "Plan my day"
}

export interface Habit {
  id: string;
  name: string;
  icon: string; // lucide icon name
  createdAt: number;
  history: string[]; // sorted list of YYYY-MM-DD on which it was completed
}

export type MoodKey =
  | "radiant"
  | "calm"
  | "focused"
  | "neutral"
  | "tired"
  | "stressed"
  | "low";

export interface MoodEntry {
  id: string;
  key: MoodKey;
  intensity: number; // 0..100 — confidence / strength of the feeling
  note?: string;
  at: number;
}

export interface WaterState {
  goalMl: number;
  cupMl: number;
  log: Record<string, number>; // YYYY-MM-DD -> ml consumed
}

export interface QuickLink {
  id: string;
  label: string;
  url: string;
  icon: string; // lucide icon name
}

export interface FocusState {
  completedToday: number; // pomodoros finished today
  lastDate: string; // YYYY-MM-DD for daily reset
  totalFocusMin: number; // lifetime focus minutes
  minutesByDay: Record<string, number>; // YYYY-MM-DD -> focus minutes
}

export type ThemePref = "auto" | "light" | "dark";

export interface Settings {
  name: string;
  city: string;
  theme: ThemePref;
  reduceMotion: "auto" | "on" | "off";
  webglBackground: boolean;
  /** When on, the deck strips down to just the DevHub + Assistant. */
  focusMode: boolean;
  /** When on, the assistant speaks its replies aloud (Web Speech API). */
  voice: boolean;
}

export type DownloadStatus =
  | "queued"
  | "downloading"
  | "processing"
  | "completed"
  | "error";

export interface DownloadItem {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  format: "video" | "audio";
  container: string; // mp4 / mp3 / m4a
  quality: string; // "1080p" | "best" | "audio"
  status: DownloadStatus;
  progress: number; // 0..100
  filename?: string;
  sizeBytes?: number;
  error?: string;
  createdAt: number;
  speed?: string;
  eta?: string;
}

// ── API shapes ────────────────────────────────────────────────

export interface YTSearchResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  publishedAt: string;
  duration?: string; // ISO8601 from contentDetails
  views?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO
  snippet?: string;
  image?: string; // article thumbnail (NewsAPI urlToImage)
}

export interface WeatherNow {
  tempC: number;
  feelsC: number;
  code: number; // WMO weather code
  label: string;
  isDay: boolean;
  windKph: number;
  humidity: number;
  high: number;
  low: number;
  city: string;
}

export type View = "home" | "studio" | "news" | "assistant" | "insights" | "play" | "games" | "settings";

// ── Play / entertainment hub ─────────────────────────────────
export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  spark: number[];
  image: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  spark: number[];
}

export interface CricketMatch {
  id: string;
  name: string;
  status: string;
  matchType: string;
  t1: string;
  t2: string;
  t1s: string;
  t2s: string;
  series?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: "movie" | "tv";
  year: string;
  poster: string;
  rating: number;
  overview: string;
}

export interface WatchlistItem {
  id: string;
  title: string;
  type: "movie" | "tv";
  poster: string;
  addedAt: number;
  watched: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}
