import { getAI, NO_KEY_MESSAGE, chatStream } from "@/lib/server/ai";
import { PROFILE } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatBody {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: {
    timeISO?: string;
    tasks?: { title: string; done: boolean; priority: string; estimateMin?: number }[];
    habitsPending?: string[];
    notesPreview?: string;
  };
}

function buildSystem(ctx: ChatBody["context"]): string {
  const now = ctx?.timeISO ? new Date(ctx.timeISO) : new Date();
  const timeStr = now.toLocaleString("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    month: "long",
    day: "numeric",
  });

  const open = (ctx?.tasks || []).filter((t) => !t.done);
  const taskLines = open.length
    ? open.map((t) => `- [${t.priority}] ${t.title}${t.estimateMin ? ` (~${t.estimateMin}m)` : ""}`).join("\n")
    : "(no open tasks)";
  const habits = ctx?.habitsPending?.length ? ctx.habitsPending.join(", ") : "(all done or none)";

  return [
    `You are Nucleus, the calm, sharp personal assistant living inside ${PROFILE.name}'s liquid-glass life dashboard ("Nucleus Deck").`,
    `${PROFILE.name} is based in ${PROFILE.city}. What matters most in their day: work tasks, gym, and medical studies.`,
    ``,
    `Current local time: ${timeStr}.`,
    ``,
    `Open tasks right now:`,
    taskLines,
    ``,
    `Habits not yet done today: ${habits}.`,
    ctx?.notesPreview ? `\nRecent scratchpad notes:\n"""${ctx.notesPreview}"""` : ``,
    ``,
    `Guidelines:`,
    `- Be concise, warm, and genuinely useful. Lead with the answer.`,
    `- When asked to "plan my day", produce a realistic time-blocked schedule starting from the current time, slotting the open tasks by priority, with short breaks and a gym/study block where it fits. Use clear time ranges (e.g. "3:00–3:45").`,
    `- Use light Markdown (bullet points, short headers). No long preambles.`,
    `- You can see the user's tasks, habits, and notes above — use them; don't ask for what you already have.`,
  ].join("\n");
}

export async function POST(req: Request) {
  const client = getAI();
  if (!client) {
    return new Response(JSON.stringify({ error: NO_KEY_MESSAGE }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { "content-type": "application/json" } });
  }

  const messages = (body.messages || [])
    .filter((m) => m.content?.trim())
    .slice(-14)
    .map((m) => ({ role: m.role, content: m.content }));

  if (!messages.length) {
    return new Response(JSON.stringify({ error: "No message provided" }), { status: 400, headers: { "content-type": "application/json" } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const text of chatStream({
          system: buildSystem(body.context),
          messages,
          maxTokens: 2048,
        })) {
          controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI request failed";
        controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
