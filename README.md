# ◎ Nucleus Deck

A personal **liquid‑glass life dashboard** — built for Om Devi Shankar. It doesn't look
like a website; it feels like a living 3D glass object floating in space. Calm, fast,
premium, and genuinely functional: tasks, habits, focus, mood, weather, a real
YouTube search + downloader, a live tech‑news feed, and a built‑in AI assistant that
knows your day.

Strictly monochrome (black → charcoal → silver → white), Apple/visionOS‑inspired,
spring‑physics motion, mouse‑driven parallax and lighting, a WebGL crystal background —
all running **locally** on your machine.

---

## ✨ What's inside

**Your day**
- **Tasks** — add / complete / delete, priorities, "how many left", one‑tap **Plan my day** (AI)
- **Habits** — daily rituals with 7‑day strips and streak counts (seeded with Gym / Study / Deep work / Hydrate)
- **Notes** — a quick scratchpad with an AI **Tidy** button
- **Focus** — a Pomodoro timer (25 / 5) with a glass progress ring
- **Mood** — the living emotion card: 3D emoji, animated aura, waveform, intensity score, and a trend over time
- **Water** — hydration tracker with a radial goal ring
- **Quick links** — one‑click glass bookmarks (Gmail, YouTube, WhatsApp, …)
- **Agenda** — a mini month calendar + what's up next
- **Insights** — monochrome glass charts: mood trend, focus this week, habit consistency, hydration

**Media Studio (YouTube)**
- Search inside the dashboard (YouTube Data API v3, key stays server‑side)
- Pick a format — **video (MP4** up to your chosen resolution) or **audio (MP3 / M4A)**
- Powered by **yt‑dlp** on the backend (ffmpeg for audio + hi‑res merge)
- **Live download progress**, finished‑file delivery, and a download history
- For content you're allowed to download — your own uploads, Creative Commons, personal use

**Tech News**
- Live feed from Hacker News, The Verge, Ars Technica, TechCrunch, dev.to (proxied to avoid CORS)
- Filter by source or keyword, manual + auto refresh, and a **Summarize** button on any article (AI)

**AI Assistant**
- A context‑aware chat that can see your tasks, habits and notes
- Plan my day · Tidy my notes · Summarize articles · free chat

---

## 🧱 Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · React Three Fiber + Drei (Three.js) ·
Zustand (localStorage persistence) · Lucide icons · Anthropic SDK · rss‑parser · yt‑dlp + ffmpeg.

---

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your keys
Copy the example env file and fill it in:
```bash
cp .env.example .env.local          # macOS / Linux
# Copy-Item .env.example .env.local # Windows PowerShell
```
Open `.env.local` and add:

| Key | Where to get it | Needed for |
|---|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys | Chat, Plan my day, Tidy notes, Summarize |
| `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) → enable **YouTube Data API v3** → Credentials | YouTube search |

> Weather needs **no key** — it uses Open‑Meteo for Tambaram, Chennai out of the box.
> Everything except search / AI / downloads works with no keys at all.

`ANTHROPIC_MODEL` defaults to `claude-sonnet-4-6` (fast + smart). Set it to
`claude-opus-4-8` for maximum quality.

### 3. Install yt‑dlp + ffmpeg (only for the downloader)
These are system binaries, not npm packages.

**Windows (winget):**
```powershell
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
```
**macOS (Homebrew):**
```bash
brew install yt-dlp ffmpeg
```
**Linux (Debian/Ubuntu):**
```bash
sudo apt install ffmpeg
python3 -m pip install -U yt-dlp     # or: sudo apt install yt-dlp
```
If they aren't on your `PATH`, set absolute paths in `.env.local`:
```
YTDLP_PATH=C:\tools\yt-dlp.exe
FFMPEG_PATH=C:\tools\ffmpeg.exe
```

### 4. Check everything
```bash
npm run doctor
```
Tells you which keys / binaries are detected.

### 5. Run it
```bash
npm run dev
```
Open **http://localhost:3000**.

For a production build:
```bash
npm run build && npm run start
```

---

## 🗄️ Where your data lives

- **Tasks, habits, notes, mood, water, settings, chat** → your browser's `localStorage`
  (key `nucleus-deck-v1`). Nothing leaves your machine. Reset anytime in **Settings → Reset all data**.
- **Downloaded files** → the `downloads/` folder in the project (configurable via `DOWNLOAD_DIR`).
- **Download history** → `data/downloads.json`.
- **API keys** → `.env.local`, read **server‑side only** and never shipped to the browser.

`downloads/`, `data/`, and `.env.local` are git‑ignored.

---

## 🎛️ Make it yours

- **Personal details** live in `src/lib/constants.ts` (`PROFILE`, default habits, quick links,
  news sources). Name, city and water goal are also editable in **Settings**.
- **Add / remove a home module**: edit the bento list in `src/components/views/HomeView.tsx`.
  Each module is a self‑contained `<…Card />` — drop one in or take one out.
- **Motion / graphics**: Settings lets you force reduced motion or turn the WebGL crystal off
  (it also auto‑degrades on weaker GPUs and honors your OS "reduce motion" setting).
- **Add a sidebar view**: add an entry to `VIEWS` in `constants.ts` and a branch in
  `src/components/Workspace.tsx`.

---

## 🩺 Troubleshooting

- **"YouTube search isn't configured"** → add `YOUTUBE_API_KEY` to `.env.local` and restart.
- **Search says quota reached** → the free tier is ~100 searches/day; results are cached 3h to help.
- **Downloads disabled / fail** → `npm run doctor`; install yt‑dlp (+ ffmpeg for MP3 and 1080p+),
  or set `YTDLP_PATH` / `FFMPEG_PATH`.
- **Assistant errors** → check `ANTHROPIC_API_KEY`; restart after editing `.env.local`.
- **Weather blank** → needs internet (Open‑Meteo); it retries every 15 min.

---

Built as a calm, premium home base. Enjoy your mornings. ◎
