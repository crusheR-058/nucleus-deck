"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { getTrending, getYtStatus, searchYouTube, type YtStatus } from "@/lib/youtube-client";
import type { YTSearchResult } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { GlassInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatDuration, formatRelative, formatViews } from "@/lib/utils";

// Chennai → India. The Data API only offers region-popular videos as
// "recommendations" (personal home-feed data isn't exposed by the API).
const REGION = "IN";

export function StudioView() {
  const [status, setStatus] = useState<YtStatus | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YTSearchResult[]>([]);
  const [recommended, setRecommended] = useState<YTSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(true);
  const [error, setError] = useState("");
  const [recError, setRecError] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    getYtStatus().then(setStatus).catch(() => {});
    getTrending(REGION)
      .then(setRecommended)
      .catch((e) => setRecError(e instanceof Error ? e.message : "Couldn't load recommendations"))
      .finally(() => setRecLoading(false));
  }, []);

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setPlayingId(null);
    try {
      setResults(await searchYouTube(query));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError("");
    setPlayingId(null);
  };

  const showingSearch = results.length > 0;
  const list = showingSearch ? results : recommended;

  return (
    <div className="space-y-5">
      {/* search */}
      <GlassCard delay={0} depth={1.5} variant="charcoal">
        <CardHeader iconName="Youtube" eyebrow="Media studio" title="Watch & discover" tone="dark" />
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon name="Search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <GlassInput
              tone="dark"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search YouTube…"
              className="pl-11"
            />
          </div>
          <button
            onClick={runSearch}
            disabled={loading || !query.trim()}
            className="liquid-btn inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
            Search
          </button>
        </div>
      </GlassCard>

      {error && <p className="px-1 text-[13px] text-muted">⚠️ {error}</p>}

      {/* section heading */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-display text-[15px] font-medium text-strong">
          {showingSearch ? "Search results" : "Recommended for you"}
          {!showingSearch && <span className="ml-2 text-[12px] font-normal text-faint">· popular in your region</span>}
        </h3>
        {showingSearch && (
          <button onClick={clearSearch} className="inline-flex items-center gap-1 text-[12px] text-muted transition hover:text-strong">
            <Icon name="X" size={13} /> Clear search
          </button>
        )}
      </div>

      {/* results / recommendations */}
      {recLoading && !showingSearch ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : list.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r, i) => (
            <VideoCard
              key={r.videoId}
              r={r}
              index={i}
              playing={playingId === r.videoId}
              onPlay={() => setPlayingId(playingId === r.videoId ? null : r.videoId)}
            />
          ))}
        </div>
      ) : (
        <GlassCard depth={1.5}>
          <p className="py-6 text-center text-sm text-muted">
            {showingSearch
              ? "No results."
              : recError || (!status?.searchEnabled ? "Add YOUTUBE_API_KEY to .env.local to load videos." : "No recommendations right now.")}
          </p>
        </GlassCard>
      )}
    </div>
  );
}

function VideoCard({
  r,
  index,
  playing,
  onPlay,
}: {
  r: YTSearchResult;
  index: number;
  playing: boolean;
  onPlay: () => void;
}) {
  return (
    <GlassCard delay={Math.min(index * 0.04, 0.3)} depth={1.5} padded={false} hoverLift={!playing}>
      {/* Playback area — the thumbnail flips into an embedded player on click */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-[31px] bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${r.videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={r.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button onClick={onPlay} className="group block h-full w-full" aria-label={`Play ${r.title}`}>
            <img src={r.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
            {r.duration && (
              <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-white tabular">
                {formatDuration(r.duration)}
              </span>
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/30">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-[#09090b] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] transition group-hover:scale-105">
                <Icon name="Play" size={26} strokeWidth={2} />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <h4 className="line-clamp-2 text-[14px] font-medium leading-snug text-strong">{r.title}</h4>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted">
          <span className="truncate">{r.channel}</span>
          {r.views && <span>· {formatViews(r.views)}</span>}
          <span>· {formatRelative(r.publishedAt)}</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onPlay}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/50 px-3 py-1.5 text-[12px] font-medium text-strong transition hover:bg-white/70"
          >
            <Icon name={playing ? "X" : "Play"} size={13} /> {playing ? "Stop" : "Play"}
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${r.videoId}`}
            target="_blank"
            rel="noreferrer"
            title="Open on YouTube"
            className="ml-auto inline-flex items-center gap-1 text-[12px] text-faint transition hover:text-strong"
          >
            <Icon name="ExternalLink" size={13} />
          </a>
        </div>
      </div>
    </GlassCard>
  );
}

function SkeletonCard() {
  return (
    <GlassCard depth={1.5} padded={false} hoverLift={false}>
      <div className="skeleton aspect-video w-full rounded-t-[31px]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded-md" />
        <div className="skeleton h-3 w-1/2 rounded-md" />
      </div>
    </GlassCard>
  );
}
