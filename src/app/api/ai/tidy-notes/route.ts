import { NextResponse } from "next/server";
import { getAI, NO_KEY_MESSAGE, chatComplete } from "@/lib/server/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const client = getAI();
  if (!client) return NextResponse.json({ error: NO_KEY_MESSAGE }, { status: 503 });

  const { notes } = (await req.json().catch(() => ({}))) as { notes?: string };
  if (!notes?.trim()) return NextResponse.json({ error: "No notes to tidy" }, { status: 400 });

  try {
    const text = await chatComplete({
      maxTokens: 1024,
      system:
        "You turn a messy personal scratchpad into clean, well-organized notes. " +
        "Group related thoughts under short bold headers where useful, convert run-ons into tight bullet points, " +
        "fix obvious grammar, and preserve every piece of the user's meaning and intent. " +
        "Use simple Markdown. Output ONLY the tidied notes — no preamble, no commentary.",
      messages: [{ role: "user", content: notes }],
    });
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Tidy failed" }, { status: 502 });
  }
}
