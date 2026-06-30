import { spawn } from "node:child_process";
import {
  binaryStatus,
  buildArgs,
  findOutputFile,
  getBinaries,
  isValidVideoId,
  patchHistory,
  upsertHistory,
} from "@/lib/server/ytdlp";
import type { DownloadItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  videoId: string;
  title?: string;
  channel?: string;
  thumbnail?: string;
  format: "video" | "audio";
  container: string;
  quality: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const encoder = new TextEncoder();
  const send = (c: ReadableStreamDefaultController<Uint8Array>, obj: unknown) =>
    c.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

  if (!body || !isValidVideoId(body.videoId || "")) {
    return new Response(JSON.stringify({ error: "Invalid video id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const status = binaryStatus();
  const id = (globalThis.crypto?.randomUUID?.() as string) || `dl_${Date.now()}`;

  const item: DownloadItem = {
    id,
    videoId: body.videoId,
    title: body.title || body.videoId,
    channel: body.channel || "",
    thumbnail: body.thumbnail || "",
    format: body.format === "audio" ? "audio" : "video",
    container: body.container || (body.format === "audio" ? "m4a" : "mp4"),
    quality: body.quality || "best",
    status: "downloading",
    progress: 0,
    createdAt: Date.now(),
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      if (!status.ytdlp) {
        send(controller, {
          type: "error",
          id,
          error: "yt-dlp is not installed. See the setup instructions in the app or README.",
        });
        controller.close();
        return;
      }

      await upsertHistory(item);
      send(controller, { type: "start", item });

      const { ytdlp } = getBinaries();
      const args = buildArgs(
        { videoId: body.videoId, format: item.format, container: item.container, quality: item.quality },
        status.ffmpeg,
      );

      const child = spawn(ytdlp, args, { windowsHide: true });
      let stderr = "";
      let lastProgress = 0;
      let buf = "";

      const handleLine = (line: string) => {
        const p = parseLine(line);
        if (!p) return;
        if (p.status === "processing") {
          send(controller, { type: "progress", id, progress: lastProgress, status: "processing" });
          return;
        }
        if (typeof p.progress === "number") {
          lastProgress = p.progress;
          send(controller, { type: "progress", id, progress: p.progress, speed: p.speed, eta: p.eta, status: "downloading" });
        }
      };

      const onData = (chunk: Buffer) => {
        buf += chunk.toString();
        const lines = buf.split(/\r?\n/);
        buf = lines.pop() || "";
        for (const l of lines) handleLine(l);
      };

      child.stdout.on("data", onData);
      child.stderr.on("data", (c: Buffer) => {
        stderr += c.toString();
        onData(c);
      });

      const abort = () => child.kill("SIGKILL");
      req.signal.addEventListener("abort", abort);

      child.on("error", async (err) => {
        await patchHistory(id, { status: "error", error: err.message });
        send(controller, { type: "error", id, error: err.message });
        controller.close();
      });

      child.on("close", async (code) => {
        req.signal.removeEventListener("abort", abort);
        if (code === 0) {
          const file = await findOutputFile(body.videoId);
          const patch = {
            status: "completed" as const,
            progress: 100,
            filename: file?.filename,
            sizeBytes: file?.size,
          };
          await patchHistory(id, patch);
          send(controller, { type: "done", id, ...patch });
        } else {
          const error = cleanError(stderr) || `yt-dlp exited with code ${code}`;
          await patchHistory(id, { status: "error", error });
          send(controller, { type: "error", id, error });
        }
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}

function parseLine(line: string) {
  if (/\[(ExtractAudio|Merger|Fixup|VideoConvertor|Metadata)/i.test(line)) return { status: "processing" as const };
  const m = line.match(/\[download\]\s+([\d.]+)%/);
  if (!m) return null;
  return {
    status: "downloading" as const,
    progress: Math.min(100, parseFloat(m[1])),
    speed: line.match(/at\s+([^\s]+\/s)/)?.[1],
    eta: line.match(/ETA\s+([\d:]+)/)?.[1],
  };
}

function cleanError(stderr: string): string {
  const errLine = stderr
    .split(/\r?\n/)
    .reverse()
    .find((l) => /ERROR/i.test(l));
  return (errLine || "").replace(/^ERROR:\s*/i, "").trim().slice(0, 240);
}
