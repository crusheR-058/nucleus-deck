import { NextResponse } from "next/server";
import { getAI, NO_KEY_MESSAGE, chatComplete } from "@/lib/server/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Composes a short, spoken daily briefing from the day's gathered context.
export async function POST(req: Request) {
  const client = getAI();
  if (!client) return NextResponse.json({ error: NO_KEY_MESSAGE }, { status: 503 });

  const { context, name } = (await req.json().catch(() => ({}))) as { context?: string; name?: string };

  try {
    const text = await chatComplete({
      maxTokens: 320,
      system:
        `You are Nucleus, a warm, upbeat personal assistant giving ${name || "your user"} a short SPOKEN daily briefing. ` +
        "It is read aloud, so write plain conversational prose — NO markdown, NO bullet points, NO emojis, NO headings. " +
        "Open with a friendly greeting that fits the time of day and uses their first name. In 4–6 flowing sentences, cover: " +
        "the weather, their top priorities today (tasks and any pending habits), a gentle nudge on focus or hydration if relevant, " +
        "and one interesting headline. Finish with a brief motivating line. Keep it natural and concise.",
      messages: [{ role: "user", content: `Here is today's data:\n${context || "(no data available)"}` }],
    });
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Briefing failed" }, { status: 502 });
  }
}
