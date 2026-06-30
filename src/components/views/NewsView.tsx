"use client";
/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { NEWS_SECTIONS } from "@/lib/constants";
import { aiText } from "@/lib/ai-client";
import type { NewsItem } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { GlassInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn, formatRelative } from "@/lib/utils";

interface SummaryState {
  loading: boolean;
  text?: string;
  error?: string;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function NewsView() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [section, setSection] = useState("top");
  const [q, setQ] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");
  const [auto, setAuto] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, SummaryState>>({});
  const [updatedAt, setUpdatedAt] = useState("");
  const [provider, setProvider] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ section });
      if (submittedQ.trim()) params.set("q", submittedQ.trim());
      const r = await fetch(`/api/news?${params.toString()}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Failed to load news");
      setItems(data.items || []);
      setProvider(data.provider || "");
      setUpdatedAt(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load news");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [section, submittedQ]);

  useEffect(() => {
    load();
  }, [load]);

  const autoRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    if (auto) autoRef.current = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(autoRef.current);
  }, [auto, load]);

  const runSearch = () => setSubmittedQ(q.trim());
  const clearSearch = () => {
    setQ("");
    setSubmittedQ("");
  };

  const summarize = async (item: NewsItem) => {
    setSummaries((s) => ({ ...s, [item.id]: { loading: true } }));
    try {
      const text = await aiText("summarize", { title: item.title, url: item.url, snippet: item.snippet });
      setSummaries((s) => ({ ...s, [item.id]: { loading: false, text } }));
    } catch (e) {
      setSummaries((s) => ({ ...s, [item.id]: { loading: false, error: e instanceof Error ? e.message : "Failed" } }));
    }
  };

  const clearSummary = (id: string) => {
    setSummaries((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <GlassCard delay={0} depth={1.5}>
        <CardHeader
          iconName="Newspaper"
          eyebrow="Today"
          title="News"
          right={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuto((a) => !a)}
                title="Auto-refresh every 5 min"
                className={cn(
                  "hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition sm:inline-flex",
                  auto ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/50 text-strong hover:bg-white/75",
                )}
              >
                <Icon name="RefreshCw" size={13} className={auto ? "animate-spin-slow" : ""} /> Auto
              </button>
              <button
                onClick={load}
                aria-label="Refresh"
                className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white transition hover:scale-105 active:scale-95"
              >
                <Icon name="RefreshCw" size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          }
        />

        {/* section tabs */}
        <div className="scroll-area -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {NEWS_SECTIONS.map((s) => {
            const on = section === s.id && !submittedQ;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSection(s.id);
                  clearSearch();
                }}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition",
                  on ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/40 text-muted hover:bg-white/70",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* search */}
        <div className="relative mt-3">
          <Icon name="Search" size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
          <GlassInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search all news… (press Enter)"
            className="pl-11"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
          {updatedAt && <span>Updated {updatedAt}</span>}
          {submittedQ && (
            <button onClick={clearSearch} className="inline-flex items-center gap-1 transition hover:text-strong">
              <Icon name="X" size={12} /> Clear “{submittedQ}”
            </button>
          )}
          {provider === "googlenews" && <span>· Add NEWS_API_KEY to .env.local for photos</span>}
        </div>
        {error && <p className="mt-2 text-[13px] text-muted">⚠️ {error}</p>}
      </GlassCard>

      {/* grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && items.length === 0 && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {items.map((item, i) => (
          <NewsCard
            key={item.id}
            item={item}
            index={i}
            summary={summaries[item.id]}
            onSummarize={() => summarize(item)}
            onClearSummary={() => clearSummary(item.id)}
          />
        ))}
      </div>

      {!loading && items.length === 0 && !error && (
        <GlassCard depth={1} hoverLift={false}>
          <p className="py-6 text-center text-sm text-faint">No stories right now. Try another section or refresh.</p>
        </GlassCard>
      )}
    </div>
  );
}

function NewsCard({
  item,
  index,
  summary,
  onSummarize,
  onClearSummary,
}: {
  item: NewsItem;
  index: number;
  summary?: SummaryState;
  onSummarize: () => void;
  onClearSummary: () => void;
}) {
  const host = hostOf(item.url);
  return (
    <GlassCard depth={1.5} padded={false} delay={Math.min(index * 0.03, 0.25)} className="flex flex-col">
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
        <Thumb item={item} host={host} />
      </a>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {host && (
            <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`} alt="" className="h-4 w-4 shrink-0 rounded-sm" />
          )}
          <span className="truncate">{item.source}</span>
          <span className="shrink-0">· {formatRelative(item.publishedAt)}</span>
        </div>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="group mt-1.5 block">
          <h3 className="line-clamp-3 text-[15px] font-medium leading-snug text-strong transition group-hover:opacity-80">{item.title}</h3>
        </a>
        {item.snippet && <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{item.snippet}</p>}

        <div className="mt-auto pt-3">
          <button
            onClick={onSummarize}
            disabled={summary?.loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/50 px-3 py-1.5 text-[12px] font-medium text-strong transition hover:bg-white/80 disabled:opacity-50"
          >
            {summary?.loading ? <Icon name="Loader2" size={13} className="animate-spin" /> : <Icon name="Sparkles" size={13} />}
            Summarize
          </button>
          <AnimatePresence>
            {summary && (summary.text || summary.error) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-3 rounded-2xl border border-ink/10 bg-white/40 p-3 text-[13px] leading-relaxed text-body">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-wide text-faint">
                      <Icon name="Sparkles" size={11} /> Summary
                    </span>
                    <button
                      onClick={onClearSummary}
                      aria-label="Dismiss summary"
                      title="Dismiss summary"
                      className="-mr-1 -mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-faint transition hover:bg-white/70 hover:text-strong"
                    >
                      <Icon name="X" size={13} />
                    </button>
                  </div>
                  {summary.error ? <span className="text-muted">⚠️ {summary.error}</span> : summary.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  );
}

function Thumb({ item, host }: { item: NewsItem; host: string }) {
  const [broken, setBroken] = useState(false);
  const showImg = item.image && !broken;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-[31px] bg-white/30">
      {showImg ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
      ) : (
        <div className="grid h-full w-full place-items-center">
          {host ? (
            <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=128`} alt="" className="h-12 w-12 rounded-lg opacity-70" />
          ) : (
            <Icon name="Newspaper" size={28} className="text-faint" />
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <GlassCard depth={1} padded={false} hoverLift={false}>
      <div className="skeleton aspect-[16/9] w-full rounded-t-[31px]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    </GlassCard>
  );
}
