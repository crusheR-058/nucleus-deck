import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { downloadDir, safeName } from "@/lib/server/ytdlp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mkv": "video/x-matroska",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".opus": "audio/opus",
  ".ogg": "audio/ogg",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = safeName(searchParams.get("name") || "");
  if (!name) return new Response("Missing file", { status: 400 });

  const filePath = path.join(downloadDir(), name);
  if (!filePath.startsWith(downloadDir()) || !fs.existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(name).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const total = stat.size;

  // ?dl=1 forces a download; otherwise serve inline so it can play in-page.
  const isDownload = searchParams.get("dl") === "1";
  const disposition = `${isDownload ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(name)}`;

  const toWeb = (s: fs.ReadStream) => Readable.toWeb(s) as unknown as ReadableStream;

  // Honor HTTP Range requests so <video>/<audio> can stream and seek.
  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? parseInt(m[1], 10) : 0;
    let end = m && m[2] ? parseInt(m[2], 10) : total - 1;
    if (Number.isNaN(start)) start = 0;
    if (Number.isNaN(end) || end >= total) end = total - 1;
    if (start > end || start >= total) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
    }
    return new Response(toWeb(fs.createReadStream(filePath, { start, end })), {
      status: 206,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": "bytes",
        "Content-Disposition": disposition,
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response(toWeb(fs.createReadStream(filePath)), {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(total),
      "Accept-Ranges": "bytes",
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    },
  });
}
