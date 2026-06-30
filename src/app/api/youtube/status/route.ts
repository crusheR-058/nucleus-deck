import { NextResponse } from "next/server";
import { binaryStatus } from "@/lib/server/ytdlp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ...binaryStatus(),
    searchEnabled: !!process.env.YOUTUBE_API_KEY,
  });
}
