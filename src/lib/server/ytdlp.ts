import { spawnSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import type { DownloadItem } from "@/lib/types";

// ── Binary resolution (Windows/macOS/Linux) ───────────────────
const binCache: Record<string, string> = {};

function resolveBin(name: string, override?: string): string {
  if (override && override.trim()) return override.trim();
  if (binCache[name]) return binCache[name];
  const finder = process.platform === "win32" ? "where" : "which";
  try {
    const r = spawnSync(finder, [name], { encoding: "utf8" });
    if (r.status === 0) {
      const first = (r.stdout || "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)[0];
      if (first) {
        binCache[name] = first;
        return first;
      }
    }
  } catch {
    /* fall through */
  }
  binCache[name] = name;
  return name;
}

export function getBinaries() {
  return {
    ytdlp: resolveBin("yt-dlp", process.env.YTDLP_PATH),
    ffmpeg: resolveBin("ffmpeg", process.env.FFMPEG_PATH),
  };
}

export function probe(bin: string, versionArg = "--version"): string | null {
  try {
    const r = spawnSync(bin, [versionArg], { encoding: "utf8" });
    if (r.status === 0) return (r.stdout || r.stderr || "").split(/\r?\n/)[0].trim();
  } catch {
    /* ignore */
  }
  return null;
}

export function binaryStatus() {
  const { ytdlp, ffmpeg } = getBinaries();
  const ytV = probe(ytdlp);
  const ffV = probe(ffmpeg, "-version"); // ffmpeg uses -version (single dash); --version errors
  return {
    ytdlp: !!ytV,
    ffmpeg: !!ffV,
    ytdlpVersion: ytV,
    ffmpegVersion: ffV ? ffV.replace(/^ffmpeg version\s*/i, "").split(" ")[0] : null,
  };
}

// ── Filesystem ────────────────────────────────────────────────
export function downloadDir() {
  const d = path.resolve(process.cwd(), process.env.DOWNLOAD_DIR || "downloads");
  fs.mkdirSync(d, { recursive: true });
  return d;
}
function dataDir() {
  const d = path.resolve(process.cwd(), "data");
  fs.mkdirSync(d, { recursive: true });
  return d;
}
const historyPath = () => path.join(dataDir(), "downloads.json");

export async function readHistory(): Promise<DownloadItem[]> {
  try {
    const raw = await fsp.readFile(historyPath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
async function writeHistory(items: DownloadItem[]) {
  await fsp.writeFile(historyPath(), JSON.stringify(items.slice(0, 100), null, 2));
}
export async function upsertHistory(item: DownloadItem) {
  const items = await readHistory();
  const i = items.findIndex((x) => x.id === item.id);
  if (i >= 0) items[i] = item;
  else items.unshift(item);
  await writeHistory(items);
}
export async function patchHistory(id: string, patch: Partial<DownloadItem>) {
  const items = await readHistory();
  const i = items.findIndex((x) => x.id === id);
  if (i >= 0) {
    items[i] = { ...items[i], ...patch };
    await writeHistory(items);
    return items[i];
  }
  return null;
}
export async function removeHistory(id: string, alsoFile = false) {
  const items = await readHistory();
  const item = items.find((x) => x.id === id);
  if (alsoFile && item?.filename) {
    try {
      await fsp.unlink(path.join(downloadDir(), item.filename));
    } catch {
      /* ignore */
    }
  }
  await writeHistory(items.filter((x) => x.id !== id));
}

// ── Validation ────────────────────────────────────────────────
export function isValidVideoId(id: string) {
  return /^[A-Za-z0-9_-]{6,20}$/.test(id);
}

export function safeName(name: string) {
  return path.basename(name).replace(/[\\/]/g, "");
}

// ── yt-dlp argument builder ───────────────────────────────────
export interface DownloadOpts {
  videoId: string;
  format: "video" | "audio";
  container: string; // mp4 | mp3 | m4a
  quality: string; // "1080" | "720" | "480" | "best" | "audio"
}

export function buildArgs(opts: DownloadOpts, hasFfmpeg: boolean): string[] {
  const dir = downloadDir();
  const out = path.join(dir, "%(title).180B [%(id)s].%(ext)s");
  const url = `https://www.youtube.com/watch?v=${opts.videoId}`;

  const args = ["--newline", "--no-color", "--no-playlist", "--no-warnings", "-o", out];
  if (process.env.FFMPEG_PATH) args.push("--ffmpeg-location", process.env.FFMPEG_PATH);

  if (opts.format === "audio") {
    if (hasFfmpeg) {
      const fmt = opts.container === "mp3" ? "mp3" : "m4a";
      args.push("-x", "--audio-format", fmt, "--audio-quality", "0");
    } else {
      args.push("-f", "bestaudio");
    }
  } else {
    const h = opts.quality === "best" ? 4320 : Number(opts.quality) || 1080;
    if (hasFfmpeg) {
      args.push("-f", `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]`, "--merge-output-format", "mp4");
    } else {
      args.push("-f", `best[height<=${h}][ext=mp4]/best[height<=${h}]/best`);
    }
  }
  args.push(url);
  return args;
}

// ── Progress line parsing ─────────────────────────────────────
export function parseProgress(line: string): { progress?: number; speed?: string; eta?: string; status?: string } | null {
  if (/\[(ExtractAudio|Merger|Fixup|VideoConvertor|Metadata)/i.test(line)) {
    return { status: "processing" };
  }
  const m = line.match(/\[download\]\s+([\d.]+)%/);
  if (!m) return null;
  const progress = Math.min(100, parseFloat(m[1]));
  const speed = line.match(/at\s+([^\s]+\/s)/)?.[1];
  const eta = line.match(/ETA\s+([\d:]+)/)?.[1];
  return { progress, speed, eta, status: "downloading" };
}

// ── Locate the finished file by video id ──────────────────────
export async function findOutputFile(videoId: string): Promise<{ filename: string; size: number } | null> {
  const dir = downloadDir();
  const entries = await fsp.readdir(dir);
  const matches = entries.filter((f) => f.includes(`[${videoId}]`) && !f.endsWith(".part") && !f.endsWith(".ytdl"));
  if (!matches.length) return null;
  const stated = await Promise.all(
    matches.map(async (f) => ({ f, stat: await fsp.stat(path.join(dir, f)).catch(() => null) })),
  );
  const valid = stated.filter((x) => x.stat) as { f: string; stat: fs.Stats }[];
  if (!valid.length) return null;
  valid.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
  return { filename: valid[0].f, size: valid[0].stat.size };
}
