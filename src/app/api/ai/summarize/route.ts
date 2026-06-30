import { NextResponse } from "next/server";
import { getAI, NO_KEY_MESSAGE, chatComplete } from "@/lib/server/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Best-effort fetch of readable article text. Falls back to the snippet. */
async function fetchArticleText(url: string): Promise<string> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (NucleusDeck)" },
    });
    clearTimeout(t);
    if (!r.ok) return "";
    const html = await r.text();
    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    return body.slice(0, 4500);
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const client = getAI();
  if (!client) return NextResponse.json({ error: NO_KEY_MESSAGE }, { status: 503 });

  const { title, url, snippet } = (await req.json().catch(() => ({}))) as {
    title?: string;
    url?: string;
    snippet?: string;
  };
  if (!title && !url) return NextResponse.json({ error: "Nothing to summarize" }, { status: 400 });

  const article = url ? await fetchArticleText(url) : "";
  const source = article || snippet || "";

  try {
    const text = await chatComplete({
      maxTokens: 320,
      system:
        "You summarize a tech-news article in 2–3 crisp, information-dense sentences for a busy reader. " +
        "State what happened and why it matters. No preamble, no 'This article…', no bullet points.",
      messages: [
        {
          role: "user",
          content: `Title: ${title || "(untitled)"}\n${url ? `URL: ${url}\n` : ""}\nContent:\n${source || "(only the title is available)"}`,
        },
      ],
    });
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Summarize failed" }, { status: 502 });
  }
}
