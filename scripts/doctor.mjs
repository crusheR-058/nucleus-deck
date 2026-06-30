#!/usr/bin/env node
/**
 * Nucleus Deck preflight doctor.
 * Run with:  npm run doctor
 * Checks Node version, .env.local keys, and the yt-dlp / ffmpeg binaries.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const G = "\x1b[32m", Y = "\x1b[33m", R = "\x1b[31m", D = "\x1b[2m", X = "\x1b[0m", B = "\x1b[1m";
const ok = (m) => console.log(`${G}  ✓${X} ${m}`);
const warn = (m) => console.log(`${Y}  !${X} ${m}`);
const bad = (m) => console.log(`${R}  ✗${X} ${m}`);

console.log(`\n${B}◎ Nucleus Deck — preflight${X}\n`);

// Node
const major = Number(process.versions.node.split(".")[0]);
if (major >= 18) ok(`Node ${process.versions.node}`);
else bad(`Node ${process.versions.node} — need >= 18.17`);

// .env.local
const envPath = resolve(process.cwd(), ".env.local");
let env = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  ok(".env.local found");
} else {
  warn(".env.local not found — copy .env.example to .env.local and add your keys");
}

const key = (name, hint) => {
  if (env[name]) ok(`${name} is set`);
  else warn(`${name} is empty — ${hint}`);
};
key("AI_API_KEY", "AI assistant features will be disabled (get a free Groq key at console.groq.com)");
key("YOUTUBE_API_KEY", "YouTube search will be disabled");
key("NEWS_API_KEY", "News page falls back to Google News headlines without photos (free key at newsapi.org)");

// Binaries
const which = (bin, override, versionArg = "--version") => {
  const cmd = override || bin;
  const r = spawnSync(cmd, [versionArg], { encoding: "utf8", shell: process.platform === "win32" });
  return r.status === 0 ? (r.stdout || r.stderr).split("\n")[0].trim() : null;
};

const ytdlp = which("yt-dlp", env.YTDLP_PATH);
if (ytdlp) ok(`yt-dlp ${ytdlp}`);
else warn("yt-dlp not found — YouTube downloads disabled. Install: see README.");

const ffmpeg = which("ffmpeg", env.FFMPEG_PATH, "-version"); // ffmpeg uses -version (single dash)
if (ffmpeg) ok(`${ffmpeg}`);
else warn("ffmpeg not found — audio (MP3) extraction + hi-res merge disabled. Install: see README.");

console.log(`\n${D}  Search + AI need keys in .env.local. Downloads need yt-dlp (+ ffmpeg for MP3).${X}`);
console.log(`${D}  Everything else (tasks, habits, notes, timer, mood, weather, news) works out of the box.${X}\n`);
