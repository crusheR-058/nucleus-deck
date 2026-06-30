"use client";

import type { DownloadItem, YTSearchResult } from "./types";

export interface YtStatus {
  ytdlp: boolean;
  ffmpeg: boolean;
  ytdlpVersion: string | null;
  ffmpegVersion: string | null;
  searchEnabled: boolean;
}

export async function searchYouTube(q: string): Promise<YTSearchResult[]> {
  const r = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "Search failed");
  return data.results as YTSearchResult[];
}

export async function getYtStatus(): Promise<YtStatus> {
  const r = await fetch("/api/youtube/status");
  return r.json();
}

/** Popular / trending videos for a region (the API's closest "recommendations"). */
export async function getTrending(region = "IN"): Promise<YTSearchResult[]> {
  const r = await fetch(`/api/youtube/trending?region=${encodeURIComponent(region)}`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "Failed to load recommendations");
  return (data.results as YTSearchResult[]) || [];
}

export async function getHistory(): Promise<DownloadItem[]> {
  const r = await fetch("/api/youtube/downloads");
  const data = await r.json().catch(() => ({ downloads: [] }));
  return (data.downloads as DownloadItem[]) || [];
}

export async function deleteDownload(id: string, alsoFile = false) {
  await fetch(`/api/youtube/downloads?id=${id}${alsoFile ? "&file=1" : ""}`, { method: "DELETE" });
}

export interface DownloadEvent {
  type: "start" | "progress" | "done" | "error";
  id: string;
  item?: DownloadItem;
  progress?: number;
  speed?: string;
  eta?: string;
  status?: string;
  filename?: string;
  sizeBytes?: number;
  error?: string;
}

export interface DownloadPayload {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  format: "video" | "audio";
  container: string;
  quality: string;
}

/** Stream a yt-dlp download, calling onEvent for each NDJSON line. */
export async function streamDownload(
  payload: DownloadPayload,
  onEvent: (ev: DownloadEvent) => void,
  signal?: AbortSignal,
) {
  const r = await fetch("/api/youtube/download", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!r.ok || !r.body) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data?.error || "Download failed to start");
  }
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        onEvent(JSON.parse(line) as DownloadEvent);
      } catch {
        /* ignore malformed line */
      }
    }
  }
}

export function fileUrl(filename: string, download = false) {
  return `/api/youtube/file?name=${encodeURIComponent(filename)}${download ? "&dl=1" : ""}`;
}
