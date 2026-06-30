import { NextResponse } from "next/server";
import { readHistory, removeHistory } from "@/lib/server/ytdlp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const downloads = await readHistory();
  return NextResponse.json({ downloads });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const alsoFile = searchParams.get("file") === "1";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await removeHistory(id, alsoFile);
  return NextResponse.json({ ok: true });
}
