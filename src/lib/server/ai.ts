import OpenAI from "openai";

/**
 * Free, OpenAI-compatible AI client for Nucleus Deck.
 *
 * Defaults to Groq (free + very fast). Switch providers any time by setting
 * AI_BASE_URL and AI_MODEL in .env.local:
 *   Groq (default):  https://api.groq.com/openai/v1                           | llama-3.3-70b-versatile
 *   Google Gemini:   https://generativelanguage.googleapis.com/v1beta/openai/ | gemini-2.0-flash
 *   Ollama (local):  http://localhost:11434/v1                                | llama3.1   (no key needed)
 *   OpenRouter:      https://openrouter.ai/api/v1                             | <model>:free
 */
const BASE_URL = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
const IS_LOCAL = BASE_URL.includes("localhost") || BASE_URL.includes("127.0.0.1");

// Model used for chat / plan-my-day / tidy-notes / summarize.
export const MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";

export const NO_KEY_MESSAGE =
  "The AI assistant isn't configured yet. Add a free AI_API_KEY to .env.local " +
  "(grab one in seconds at https://console.groq.com/) and restart the dev server.";

/** Returns a configured OpenAI-compatible client, or null if no key is set. */
export function getAI(): OpenAI | null {
  const apiKey = process.env.AI_API_KEY;
  // Local providers like Ollama don't require a real key.
  if (!apiKey && !IS_LOCAL) return null;
  return new OpenAI({ apiKey: apiKey || "local", baseURL: BASE_URL });
}

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOpts {
  system: string;
  messages: ChatMsg[];
  maxTokens: number;
}

function toParams(opts: ChatOpts) {
  return [
    { role: "system" as const, content: opts.system },
    ...opts.messages,
  ] as OpenAI.Chat.ChatCompletionMessageParam[];
}

/** One-shot completion -> trimmed plain text. */
export async function chatComplete(opts: ChatOpts): Promise<string> {
  const client = getAI();
  if (!client) throw new Error(NO_KEY_MESSAGE);
  const res = await client.chat.completions.create({
    model: MODEL,
    max_tokens: opts.maxTokens,
    messages: toParams(opts),
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

/** Streaming completion -> yields text chunks as they arrive. */
export async function* chatStream(opts: ChatOpts): AsyncGenerator<string> {
  const client = getAI();
  if (!client) throw new Error(NO_KEY_MESSAGE);
  const stream = await client.chat.completions.create({
    model: MODEL,
    max_tokens: opts.maxTokens,
    stream: true,
    messages: toParams(opts),
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
