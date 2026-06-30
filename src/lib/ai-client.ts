"use client";

import type { ChatMessage, Task } from "./types";

export interface DayContext {
  timeISO: string;
  tasks: { title: string; done: boolean; priority: string; estimateMin?: number }[];
  habitsPending: string[];
  notesPreview?: string;
}

/** Non-streaming AI helper (tidy-notes, summarize, briefing). */
export async function aiText(endpoint: "tidy-notes" | "summarize" | "briefing", body: unknown): Promise<string> {
  const r = await fetch(`/api/ai/${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "AI request failed");
  return (data.text as string) ?? "";
}

export function buildDayContext(tasks: Task[], notes: string, habitsPending: string[]): DayContext {
  return {
    timeISO: new Date().toISOString(),
    tasks: tasks.map((t) => ({ title: t.title, done: t.done, priority: t.priority, estimateMin: t.estimateMin })),
    habitsPending,
    notesPreview: notes.slice(0, 600),
  };
}

/**
 * Stream a chat completion. Calls onDelta with each text chunk.
 * Returns the full text. Throws on error.
 */
export async function streamChat(
  messages: Pick<ChatMessage, "role" | "content">[],
  context: DayContext,
  onDelta: (full: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const r = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, context }),
    signal,
  });

  if (!r.ok || !r.body) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data?.error || `Chat failed (${r.status})`);
  }

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onDelta(full);
  }
  return full;
}
