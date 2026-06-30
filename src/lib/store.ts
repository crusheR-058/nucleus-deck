"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_HABITS, DEFAULT_QUICK_LINKS, PROFILE } from "./constants";
import { dateKey, todayKey, uid } from "./utils";
import type {
  ChatMessage,
  DownloadItem,
  FocusState,
  Habit,
  MoodEntry,
  MoodKey,
  Priority,
  QuickLink,
  Settings,
  Task,
  WatchlistItem,
  WaterState,
} from "./types";

interface DeckState {
  tasks: Task[];
  habits: Habit[];
  notes: string;
  tidyNotes: string;
  moods: MoodEntry[];
  water: WaterState;
  quickLinks: QuickLink[];
  focus: FocusState;
  settings: Settings;
  downloads: DownloadItem[];
  chat: ChatMessage[];
  watchlist: WatchlistItem[];
  cryptoCoins: string[];
  stockSymbols: string[];
  casinoChips: number;

  // tasks
  addTask: (title: string, priority?: Priority, estimateMin?: number) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;

  // habits
  addHabit: (name: string, icon?: string) => void;
  removeHabit: (id: string) => void;
  toggleHabitToday: (id: string) => void;

  // notes
  setNotes: (s: string) => void;
  setTidyNotes: (s: string) => void;

  // mood
  addMood: (key: MoodKey, intensity: number, note?: string) => void;

  // water
  addWater: (ml?: number) => void;
  resetWaterToday: () => void;
  setWaterGoal: (ml: number) => void;

  // quick links
  addLink: (label: string, url: string, icon?: string) => void;
  removeLink: (id: string) => void;

  // focus
  completePomodoro: (minutes: number) => void;

  // settings
  updateSettings: (patch: Partial<Settings>) => void;

  // downloads (client mirror of server state)
  setDownloads: (items: DownloadItem[]) => void;
  upsertDownload: (item: DownloadItem) => void;
  patchDownload: (id: string, patch: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;

  // chat
  pushChat: (m: ChatMessage) => void;
  patchChat: (id: string, patch: Partial<ChatMessage>) => void;
  clearChat: () => void;

  // play / entertainment
  addToWatchlist: (item: Omit<WatchlistItem, "addedAt" | "watched">) => void;
  removeFromWatchlist: (id: string) => void;
  toggleWatched: (id: string) => void;
  addCoin: (id: string) => void;
  removeCoin: (id: string) => void;
  addSymbol: (sym: string) => void;
  removeSymbol: (sym: string) => void;

  // casino / games
  adjustChips: (delta: number) => void;
  resetChips: () => void;
}

const seededHabits: Habit[] = DEFAULT_HABITS.map((h, i) => ({
  id: `seed-habit-${i}`,
  name: h.name,
  icon: h.icon,
  createdAt: Date.now(),
  history: [],
}));

const initialFocus: FocusState = {
  completedToday: 0,
  lastDate: todayKey(),
  totalFocusMin: 0,
  minutesByDay: {},
};

const initialSettings: Settings = {
  name: PROFILE.name,
  city: PROFILE.city,
  theme: "dark",
  reduceMotion: "auto",
  webglBackground: true,
  focusMode: false,
  voice: true,
};

export const useDeck = create<DeckState>()(
  persist(
    (set, get) => ({
      tasks: [
        { id: "seed-t1", title: "Review medical study notes", done: false, priority: "high", createdAt: Date.now(), estimateMin: 60 },
        { id: "seed-t2", title: "Gym — push day", done: false, priority: "med", createdAt: Date.now(), estimateMin: 75 },
        { id: "seed-t3", title: "Clear work inbox", done: false, priority: "med", createdAt: Date.now(), estimateMin: 30 },
      ],
      habits: seededHabits,
      notes: "Welcome to Nucleus Deck.\n\nJot anything here — ideas, reminders, a brain-dump. Hit “Tidy” to let the assistant turn it into clean bullets.",
      tidyNotes: "",
      moods: [],
      water: { goalMl: 3000, cupMl: 250, log: {} },
      quickLinks: DEFAULT_QUICK_LINKS,
      focus: initialFocus,
      settings: initialSettings,
      downloads: [],
      chat: [],
      watchlist: [],
      cryptoCoins: ["bitcoin", "ethereum", "solana"],
      stockSymbols: ["^NSEI", "^BSESN"],
      casinoChips: 1_000_000,

      addTask: (title, priority = "med", estimateMin) =>
        set((s) => ({
          tasks: [
            { id: uid("t_"), title: title.trim(), done: false, priority, createdAt: Date.now(), estimateMin },
            ...s.tasks,
          ],
        })),
      toggleTask: (id) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      clearCompleted: () => set((s) => ({ tasks: s.tasks.filter((t) => !t.done) })),

      addHabit: (name, icon = "Circle") =>
        set((s) => ({
          habits: [...s.habits, { id: uid("h_"), name: name.trim(), icon, createdAt: Date.now(), history: [] }],
        })),
      removeHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      toggleHabitToday: (id) =>
        set((s) => {
          const tk = todayKey();
          return {
            habits: s.habits.map((h) => {
              if (h.id !== id) return h;
              const has = h.history.includes(tk);
              return {
                ...h,
                history: has ? h.history.filter((d) => d !== tk) : [...h.history, tk].sort(),
              };
            }),
          };
        }),

      setNotes: (notes) => set({ notes }),
      setTidyNotes: (tidyNotes) => set({ tidyNotes }),

      addMood: (key, intensity, note) =>
        set((s) => ({
          moods: [...s.moods, { id: uid("m_"), key, intensity, note, at: Date.now() }].slice(-400),
        })),

      addWater: (ml) =>
        set((s) => {
          const tk = todayKey();
          const inc = ml ?? s.water.cupMl;
          return { water: { ...s.water, log: { ...s.water.log, [tk]: (s.water.log[tk] ?? 0) + inc } } };
        }),
      resetWaterToday: () =>
        set((s) => ({ water: { ...s.water, log: { ...s.water.log, [todayKey()]: 0 } } })),
      setWaterGoal: (goalMl) => set((s) => ({ water: { ...s.water, goalMl } })),

      addLink: (label, url, icon = "Link") =>
        set((s) => ({ quickLinks: [...s.quickLinks, { id: uid("ql_"), label, url, icon }] })),
      removeLink: (id) => set((s) => ({ quickLinks: s.quickLinks.filter((q) => q.id !== id) })),

      completePomodoro: (minutes) =>
        set((s) => {
          const tk = todayKey();
          const sameDay = s.focus.lastDate === tk;
          const minutesByDay = { ...s.focus.minutesByDay, [tk]: (s.focus.minutesByDay[tk] ?? 0) + minutes };
          return {
            focus: {
              completedToday: (sameDay ? s.focus.completedToday : 0) + 1,
              lastDate: tk,
              totalFocusMin: s.focus.totalFocusMin + minutes,
              minutesByDay,
            },
          };
        }),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      setDownloads: (downloads) => set({ downloads }),
      upsertDownload: (item) =>
        set((s) => {
          const exists = s.downloads.some((d) => d.id === item.id);
          return { downloads: exists ? s.downloads.map((d) => (d.id === item.id ? item : d)) : [item, ...s.downloads] };
        }),
      patchDownload: (id, patch) =>
        set((s) => ({ downloads: s.downloads.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      removeDownload: (id) => set((s) => ({ downloads: s.downloads.filter((d) => d.id !== id) })),

      pushChat: (m) => set((s) => ({ chat: [...s.chat, m].slice(-60) })),
      patchChat: (id, patch) =>
        set((s) => ({ chat: s.chat.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      clearChat: () => set({ chat: [] }),

      addToWatchlist: (item) =>
        set((s) =>
          s.watchlist.some((w) => w.id === item.id)
            ? {}
            : { watchlist: [{ ...item, addedAt: Date.now(), watched: false }, ...s.watchlist] },
        ),
      removeFromWatchlist: (id) => set((s) => ({ watchlist: s.watchlist.filter((w) => w.id !== id) })),
      toggleWatched: (id) =>
        set((s) => ({ watchlist: s.watchlist.map((w) => (w.id === id ? { ...w, watched: !w.watched } : w)) })),
      addCoin: (id) =>
        set((s) => {
          const v = id.trim().toLowerCase();
          return !v || s.cryptoCoins.includes(v) ? {} : { cryptoCoins: [...s.cryptoCoins, v] };
        }),
      removeCoin: (id) => set((s) => ({ cryptoCoins: s.cryptoCoins.filter((c) => c !== id) })),
      addSymbol: (sym) =>
        set((s) => {
          const v = sym.trim().toUpperCase();
          return !v || s.stockSymbols.includes(v) ? {} : { stockSymbols: [...s.stockSymbols, v] };
        }),
      removeSymbol: (sym) => set((s) => ({ stockSymbols: s.stockSymbols.filter((x) => x !== sym) })),

      adjustChips: (delta) => set((s) => ({ casinoChips: Math.max(0, s.casinoChips + delta) })),
      resetChips: () => set({ casinoChips: 1_000_000 }),
    }),
    {
      name: "nucleus-deck-v1",
      version: 3,
      // v2 grants 1,000,000 chips; v3 enables the assistant's voice — on existing devices.
      migrate: (persisted, fromVersion) => {
        const s = (persisted ?? {}) as Partial<DeckState>;
        if (fromVersion < 2) s.casinoChips = 1_000_000;
        if (fromVersion < 3 && s.settings) s.settings = { ...s.settings, voice: true };
        return s as DeckState;
      },
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage),
      ),
      // Don't persist transient download progress or chat "pending" flags as-is.
      partialize: (s) => ({
        tasks: s.tasks,
        habits: s.habits,
        notes: s.notes,
        tidyNotes: s.tidyNotes,
        moods: s.moods,
        water: s.water,
        quickLinks: s.quickLinks,
        focus: s.focus,
        settings: s.settings,
        chat: s.chat.filter((m) => !m.pending),
        watchlist: s.watchlist,
        cryptoCoins: s.cryptoCoins,
        stockSymbols: s.stockSymbols,
        casinoChips: s.casinoChips,
      }),
    },
  ),
);

// ── Derived selectors / helpers ───────────────────────────────

/** Current consecutive-day streak for a habit (counts today or yesterday as anchor). */
export function habitStreak(history: string[]): number {
  if (!history.length) return 0;
  const set = new Set(history);
  let streak = 0;
  const d = new Date();
  // allow the streak to stand if today isn't done yet but yesterday was
  if (!set.has(dateKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(dateKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function todayWater(w: WaterState): number {
  return w.log[todayKey()] ?? 0;
}
