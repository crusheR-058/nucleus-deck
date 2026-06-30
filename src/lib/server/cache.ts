// Tiny in-memory TTL cache (per server process). Good enough for a local app
// and keeps us well under the YouTube quota / news source rate limits.

type Entry = { exp: number; val: unknown };
const store = new Map<string, Entry>();

export function getCache<T>(key: string): T | undefined {
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() > e.exp) {
    store.delete(key);
    return undefined;
  }
  return e.val as T;
}

export function setCache(key: string, val: unknown, ttlMs: number) {
  store.set(key, { exp: Date.now() + ttlMs, val });
}
