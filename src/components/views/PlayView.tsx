"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { GlassInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Sparkline } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";
import type { CricketMatch, CryptoCoin, MediaItem, StockQuote } from "@/lib/types";

/* ── shared bits ─────────────────────────────────────────────── */

function RefreshButton({ onClick, spinning }: { onClick: () => void; spinning: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label="Refresh"
      className="grid h-8 w-8 place-items-center rounded-full bg-white/50 text-strong transition hover:bg-white/75"
    >
      <Icon name="RefreshCw" size={14} className={spinning ? "animate-spin" : ""} />
    </button>
  );
}

function Change({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className="tabular inline-flex items-center gap-0.5 text-[12px] text-muted">
      <Icon name={up ? "TrendingUp" : "TrendingDown"} size={12} />
      {up ? "+" : ""}
      {pct.toFixed(2)}%
    </span>
  );
}

function AddRow({ value, onChange, onAdd, placeholder }: { value: string; onChange: (s: string) => void; onAdd: () => void; placeholder: string }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <GlassInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
        placeholder={placeholder}
        className="py-1.5 text-[12px]"
      />
      <button
        onClick={onAdd}
        aria-label="Add"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-ink text-white transition hover:scale-105 active:scale-95"
      >
        <Icon name="Plus" size={16} />
      </button>
    </div>
  );
}

const fmtPrice = (n: number) =>
  n >= 1000 ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : n >= 1 ? n.toFixed(2) : n.toPrecision(3);

/* ── Crypto ──────────────────────────────────────────────────── */

function CryptoCard() {
  const coins = useDeck((s) => s.cryptoCoins);
  const addCoin = useDeck((s) => s.addCoin);
  const removeCoin = useDeck((s) => s.removeCoin);
  const [rows, setRows] = useState<CryptoCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [input, setInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`/api/crypto?ids=${encodeURIComponent(coins.join(","))}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Failed to load");
      setRows(d.coins || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [coins]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <GlassCard depth={2} delay={0.05}>
      <CardHeader iconName="Bitcoin" eyebrow="Markets" title="Crypto" right={<RefreshButton onClick={load} spinning={loading} />} />
      {err && <p className="text-[13px] text-muted">⚠️ {err}</p>}
      <div className="space-y-1">
        {rows.map((c) => (
          <div key={c.id} className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-white/40">
            {c.image ? <img src={c.image} alt="" className="h-7 w-7 shrink-0 rounded-full" /> : <span className="h-7 w-7 shrink-0 rounded-full bg-white/40" />}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-strong">{c.name}</div>
              <div className="text-[11px] uppercase text-faint">{c.symbol}</div>
            </div>
            <Sparkline values={c.spark} />
            <div className="w-24 shrink-0 text-right">
              <div className="tabular text-[13px] font-medium text-strong">${fmtPrice(c.price)}</div>
              <Change pct={c.change24h} />
            </div>
            <button
              onClick={() => removeCoin(c.id)}
              aria-label={`Remove ${c.name}`}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-faint opacity-0 transition hover:bg-white/60 hover:text-strong group-hover:opacity-100"
            >
              <Icon name="X" size={12} />
            </button>
          </div>
        ))}
        {loading && rows.length === 0 && <div className="skeleton h-10 w-full rounded-2xl" />}
      </div>
      <AddRow value={input} onChange={setInput} onAdd={() => { addCoin(input); setInput(""); }} placeholder="Add coin id (e.g. cardano)" />
    </GlassCard>
  );
}

/* ── Stocks ──────────────────────────────────────────────────── */

function StocksCard() {
  const symbols = useDeck((s) => s.stockSymbols);
  const addSymbol = useDeck((s) => s.addSymbol);
  const removeSymbol = useDeck((s) => s.removeSymbol);
  const [rows, setRows] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [input, setInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`/api/stocks?symbols=${encodeURIComponent(symbols.join(","))}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Failed to load");
      setRows(d.quotes || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [symbols]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <GlassCard depth={2} delay={0.1}>
      <CardHeader iconName="LineChart" eyebrow="Markets" title="Stocks & indices" right={<RefreshButton onClick={load} spinning={loading} />} />
      {err && <p className="text-[13px] text-muted">⚠️ {err}</p>}
      <div className="space-y-1">
        {rows.map((q) => (
          <div key={q.symbol} className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-white/40">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-strong">{q.name}</div>
              <div className="text-[11px] uppercase text-faint">{q.symbol}</div>
            </div>
            <Sparkline values={q.spark} />
            <div className="w-24 shrink-0 text-right">
              <div className="tabular text-[13px] font-medium text-strong">{q.price ? fmtPrice(q.price) : "—"}</div>
              <Change pct={q.changePct} />
            </div>
            <button
              onClick={() => removeSymbol(q.symbol)}
              aria-label={`Remove ${q.name}`}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-faint opacity-0 transition hover:bg-white/60 hover:text-strong group-hover:opacity-100"
            >
              <Icon name="X" size={12} />
            </button>
          </div>
        ))}
        {loading && rows.length === 0 && <div className="skeleton h-10 w-full rounded-2xl" />}
      </div>
      <AddRow value={input} onChange={setInput} onAdd={() => { addSymbol(input); setInput(""); }} placeholder="Add symbol (e.g. RELIANCE.NS)" />
    </GlassCard>
  );
}

/* ── Cricket ─────────────────────────────────────────────────── */

function CricketCard() {
  const [data, setData] = useState<{ configured?: boolean; matches?: CricketMatch[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/cricket");
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Failed to load");
      setData(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const matches = data?.matches || [];

  return (
    <GlassCard depth={2} delay={0}>
      <CardHeader iconName="Trophy" eyebrow="Live" title="Cricket" right={<RefreshButton onClick={load} spinning={loading} />} />

      {err && <p className="text-[13px] text-muted">⚠️ {err}</p>}

      {data && data.configured === false ? (
        <div className="rounded-2xl border border-ink/10 bg-white/40 p-4 text-[13px] text-body">
          <p className="font-medium text-strong">Add your free cricket key</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted">
            <li>Sign up at <span className="font-medium text-strong">cricketdata.org</span> (free)</li>
            <li>Copy your API key and enable the <span className="font-medium text-strong">Cricket Score / Current Matches</span> API</li>
            <li>Put <code className="rounded bg-ink/10 px-1">CRICKET_API_KEY=…</code> in <code className="rounded bg-ink/10 px-1">.env.local</code> and restart</li>
          </ol>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {matches.map((m) => (
            <div key={m.id} className="rounded-2xl border border-ink/10 bg-white/40 p-3">
              <div className="mb-1.5 truncate text-[11px] text-faint">{m.series || m.matchType}</div>
              <ScoreLine team={m.t1} score={m.t1s} />
              <ScoreLine team={m.t2} score={m.t2s} />
              <div className="mt-1.5 line-clamp-2 text-[11.5px] text-muted">{m.status}</div>
            </div>
          ))}
          {matches.length === 0 && !loading && (
            <p className="py-4 text-[13px] text-faint">No matches right now — check back around match time.</p>
          )}
          {loading && matches.length === 0 && <div className="skeleton h-24 w-full rounded-2xl" />}
        </div>
      )}
    </GlassCard>
  );
}

function ScoreLine({ team, score }: { team: string; score: string }) {
  if (!team) return null;
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="truncate text-[13.5px] font-medium text-strong">{team}</span>
      <span className="tabular shrink-0 text-[13px] text-body">{score || "—"}</span>
    </div>
  );
}

/* ── Movies & TV ─────────────────────────────────────────────── */

function Poster({ item, inList, onToggle }: { item: MediaItem; inList: boolean; onToggle: () => void }) {
  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-2xl border border-ink/10 bg-white/30">
      {item.poster ? (
        <img src={item.poster} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-faint">
          <Icon name={item.type === "movie" ? "Clapperboard" : "Tv"} size={26} />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="line-clamp-2 text-[11px] font-medium text-white">{item.title}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/70">
          <span className="uppercase">{item.type}</span>
          {item.year && <span>· {item.year}</span>}
          {item.rating > 0 && <span>· ★ {item.rating.toFixed(1)}</span>}
        </div>
      </div>
      <button
        onClick={onToggle}
        aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
        title={inList ? "In your watchlist" : "Add to watchlist"}
        className={cn(
          "absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full backdrop-blur transition",
          inList ? "bg-white text-[#09090b]" : "bg-black/45 text-white opacity-0 hover:bg-black/70 group-hover:opacity-100",
        )}
      >
        <Icon name={inList ? "Check" : "Plus"} size={14} />
      </button>
    </div>
  );
}

function MoviesCard() {
  const watchlist = useDeck((s) => s.watchlist);
  const addToWatchlist = useDeck((s) => s.addToWatchlist);
  const removeFromWatchlist = useDeck((s) => s.removeFromWatchlist);
  const toggleWatched = useDeck((s) => s.toggleWatched);

  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [tv, setTv] = useState<MediaItem[]>([]);
  const [moviesConfigured, setMoviesConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const params = submitted.trim() ? `?q=${encodeURIComponent(submitted.trim())}` : "";
      const r = await fetch(`/api/movies${params}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Failed to load");
      setMovies(d.movies || []);
      setTv(d.tv || []);
      setMoviesConfigured(d.moviesConfigured !== false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [submitted]);
  useEffect(() => {
    load();
  }, [load]);

  const inList = (id: string) => watchlist.some((w) => w.id === id);
  const toggle = (item: MediaItem) => {
    if (inList(item.id)) removeFromWatchlist(item.id);
    else addToWatchlist({ id: item.id, title: item.title, type: item.type, poster: item.poster });
  };

  const results = [...movies, ...tv];

  return (
    <GlassCard depth={2} delay={0.15}>
      <CardHeader
        iconName="Clapperboard"
        eyebrow="Watch"
        title="Movies & TV"
        right={<RefreshButton onClick={load} spinning={loading} />}
      />

      <div className="relative mb-4">
        <Icon name="Search" size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
        <GlassInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setSubmitted(q)}
          placeholder="Search movies & shows… (press Enter)"
          className="pl-11"
        />
      </div>

      {err && <p className="mb-2 text-[13px] text-muted">⚠️ {err}</p>}

      {/* watchlist */}
      {watchlist.length > 0 && (
        <div className="mb-4">
          <div className="label-eyebrow mb-2">My watchlist</div>
          <div className="scroll-area -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {watchlist.map((w) => (
              <div key={w.id} className="relative w-[84px] shrink-0">
                <div className="aspect-[2/3] overflow-hidden rounded-xl border border-ink/10 bg-white/30">
                  {w.poster ? (
                    <img src={w.poster} alt={w.title} loading="lazy" className={cn("h-full w-full object-cover", w.watched && "opacity-40")} />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-faint"><Icon name={w.type === "movie" ? "Clapperboard" : "Tv"} size={20} /></div>
                  )}
                </div>
                <div className="absolute right-1 top-1 flex gap-1">
                  <button onClick={() => toggleWatched(w.id)} aria-label="Mark watched" title={w.watched ? "Watched" : "Mark watched"} className={cn("grid h-6 w-6 place-items-center rounded-full backdrop-blur transition", w.watched ? "bg-white text-[#09090b]" : "bg-black/45 text-white hover:bg-black/70")}>
                    <Icon name="Check" size={12} />
                  </button>
                  <button onClick={() => removeFromWatchlist(w.id)} aria-label="Remove" className="grid h-6 w-6 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70">
                    <Icon name="X" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="label-eyebrow mb-2">{submitted ? `Results for “${submitted}”` : "Popular shows"}</div>
      {submitted && !moviesConfigured && (
        <p className="mb-2 text-[11.5px] text-faint">
          Showing TV results. To search movies too, add a free <span className="text-strong">OMDB_API_KEY</span> (omdbapi.com) to <code className="rounded bg-ink/10 px-1">.env.local</code>.
        </p>
      )}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {results.map((m) => (
          <Poster key={m.id} item={m} inList={inList(m.id)} onToggle={() => toggle(m)} />
        ))}
        {loading && results.length === 0 && Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-[2/3] rounded-2xl" />)}
      </div>
      {!loading && results.length === 0 && !err && (
        <p className="py-4 text-center text-[13px] text-faint">Nothing found — try another search.</p>
      )}
    </GlassCard>
  );
}

/* ── View ────────────────────────────────────────────────────── */

export function PlayView() {
  return (
    <div className="space-y-5">
      <CricketCard />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CryptoCard />
        <StocksCard />
      </div>
      <MoviesCard />
    </div>
  );
}
