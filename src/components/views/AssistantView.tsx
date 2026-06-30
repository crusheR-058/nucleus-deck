"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDeck } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { aiText, buildDayContext, streamChat } from "@/lib/ai-client";
import { todayKey, uid, cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { NucleusMark } from "@/components/ui/NucleusMark";
import { NucleusLogo3D } from "@/components/ui/NucleusLogo3D";
import { useVoice } from "@/lib/voice";

const QUICK = [
  { label: "Plan my day", icon: "CalendarClock", prompt: "Plan my day into a realistic, time-blocked schedule from now until the evening, using my current tasks and their priorities." },
  { label: "Tidy my notes", icon: "Wand2", prompt: "Tidy my scratchpad notes into clean, organized bullet points." },
  { label: "What should I focus on?", icon: "Target", prompt: "Given my tasks and the time, what single thing should I focus on right now, and why?" },
];

export function AssistantView() {
  const chat = useDeck((s) => s.chat);
  const pushChat = useDeck((s) => s.pushChat);
  const patchChat = useDeck((s) => s.patchChat);
  const clearChat = useDeck((s) => s.clearChat);
  const name = useDeck((s) => s.settings.name);
  const voice = useDeck((s) => s.settings.voice);
  const updateSettings = useDeck((s) => s.updateSettings);
  const seed = useUI((s) => s.assistantSeed);
  const clearSeed = useUI((s) => s.clearAssistantSeed);

  const { speak, stopSpeaking, speaking, listen, stopListening, listening, supported } = useVoice();

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    setInput("");
    stopSpeaking();
    pushChat({ id: uid("u_"), role: "user", content });
    const aId = uid("a_");
    pushChat({ id: aId, role: "assistant", content: "", pending: true });

    const state = useDeck.getState();
    const history = state.chat
      .filter((m) => m.content.trim() && !(m.role === "assistant" && m.pending))
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content });

    const pendingHabits = state.habits.filter((h) => !h.history.includes(todayKey())).map((h) => h.name);
    const ctx = buildDayContext(state.tasks, state.notes, pendingHabits);

    try {
      let finalText = "";
      await streamChat(history, ctx, (full) => {
        finalText = full;
        patchChat(aId, { content: full });
      });
      if (voice && finalText) speak(finalText);
    } catch (e) {
      patchChat(aId, { content: `⚠️ ${e instanceof Error ? e.message : "Something went wrong."}` });
    } finally {
      patchChat(aId, { pending: false });
      setBusy(false);
    }
  };

  const toggleMic = () => {
    if (listening) {
      stopListening();
      return;
    }
    stopSpeaking();
    listen(
      (finalT) => send(finalT),
      (interim) => setInput(interim),
    );
  };

  const buildBriefingContext = async () => {
    const st = useDeck.getState();
    const tk = todayKey();
    const open = st.tasks.filter((t) => !t.done);
    const rank: Record<string, number> = { high: 0, med: 1, low: 2 };
    open.sort((a, b) => (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1));
    const topTasks = open.slice(0, 5).map((t) => `${t.title} (${t.priority}${t.estimateMin ? `, ~${t.estimateMin}m` : ""})`);
    const pendingHabits = st.habits.filter((h) => !h.history.includes(tk)).map((h) => h.name);
    const focusMin = Math.round(st.focus.minutesByDay[tk] || 0);
    const waterMl = st.water.log[tk] || 0;

    let weather = "unavailable";
    try {
      const w = (await fetch("/api/weather").then((r) => r.json())) as {
        error?: string;
        label?: string;
        tempC?: number;
        high?: number;
        low?: number;
        city?: string;
      };
      if (w && !w.error)
        weather = `${w.label}, ${Math.round(w.tempC ?? 0)}°C (high ${Math.round(w.high ?? 0)}, low ${Math.round(w.low ?? 0)}) in ${w.city}`;
    } catch {
      /* ignore */
    }

    let headlines: string[] = [];
    try {
      const n = (await fetch("/api/news?section=top").then((r) => r.json())) as {
        items?: { title: string; source: string }[];
      };
      headlines = (n.items || []).slice(0, 2).map((i) => `${i.title} (${i.source})`);
    } catch {
      /* ignore */
    }

    return [
      `Local time: ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
      `Weather: ${weather}`,
      `Open tasks (priority order): ${topTasks.length ? topTasks.join("; ") : "none"}`,
      `Habits still pending today: ${pendingHabits.length ? pendingHabits.join(", ") : "all done"}`,
      `Focus done today: ${focusMin} min`,
      `Water today: ${waterMl} of ${st.water.goalMl} ml`,
      `Top headlines: ${headlines.length ? headlines.join(" | ") : "none"}`,
    ].join("\n");
  };

  const runBriefing = async () => {
    if (busy) return;
    setBusy(true);
    stopSpeaking();
    pushChat({ id: uid("u_"), role: "user", content: "☀️ Daily briefing" });
    const aId = uid("a_");
    pushChat({ id: aId, role: "assistant", content: "", pending: true });
    try {
      const context = await buildBriefingContext();
      const text = await aiText("briefing", { context, name: name.split(" ")[0] || name });
      patchChat(aId, { content: text });
      speak(text); // a briefing is always spoken
    } catch (e) {
      patchChat(aId, { content: `⚠️ ${e instanceof Error ? e.message : "Couldn't build your briefing."}` });
    } finally {
      patchChat(aId, { pending: false });
      setBusy(false);
    }
  };

  // Consume a seed prompt (e.g. "Plan my day" from another module).
  useEffect(() => {
    if (seed && !seededRef.current) {
      seededRef.current = true;
      send(seed);
      clearSeed();
      setTimeout(() => (seededRef.current = false), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat]);

  return (
    <div className="mx-auto flex h-[calc(100dvh-220px)] max-w-3xl flex-col">
      <GlassCard depth={2} padded={false} hoverLift={false} className="flex h-full flex-col">
        {/* header */}
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <NucleusMark size={30} />
            <div>
              <div className="font-display text-[16px] font-medium text-strong">Nucleus Assistant</div>
              <div className="text-[11px] text-muted">Knows your tasks, habits & notes</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runBriefing}
              disabled={busy}
              title="Daily briefing"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-[12px] text-muted transition hover:bg-white/40 hover:text-strong disabled:opacity-40"
            >
              <Icon name="Sunrise" size={13} /> Briefing
            </button>
            {speaking && (
              <button
                onClick={stopSpeaking}
                aria-label="Stop speaking"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-[12px] text-muted transition hover:bg-white/40 hover:text-strong"
              >
                <Icon name="VolumeX" size={13} /> Stop
              </button>
            )}
            {supported.tts && (
              <button
                onClick={() => updateSettings({ voice: !voice })}
                aria-pressed={voice}
                title={voice ? "Voice replies on" : "Voice replies off"}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full border transition",
                  voice ? "border-transparent bg-ink text-white" : "border-ink/15 bg-white/40 text-muted hover:bg-white/70",
                )}
              >
                <Icon name={voice ? "Volume2" : "VolumeX"} size={15} />
              </button>
            )}
            {chat.length > 0 && (
              <button
                onClick={clearChat}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-[12px] text-muted transition hover:bg-white/40 hover:text-strong"
              >
                <Icon name="Trash2" size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="scroll-area flex-1 space-y-4 px-5 py-5">
          {chat.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <NucleusLogo3D size={132} />
              <h3 className="mt-5 font-display text-xl font-medium text-strong">Hi {name.split(" ")[0]}, how can I help?</h3>
              <p className="mt-1 max-w-sm text-[13px] text-muted">
                I can see your day. Ask me anything, or start with one of these:
              </p>
              <button
                onClick={runBriefing}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 active:scale-95"
              >
                <Icon name="Sunrise" size={15} /> Daily briefing
              </button>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => send(q.prompt)}
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/50 px-4 py-2.5 text-[13px] font-medium text-strong transition hover:bg-white/70"
                  >
                    <Icon name={q.icon} size={15} /> {q.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chat.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "assistant" && (
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/50">
                    <Icon name="Sparkles" size={15} className="text-strong" />
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-3xl px-4 py-3 text-[14px] leading-relaxed",
                    m.role === "user" ? "rounded-br-lg bg-white text-[#09090b]" : "rounded-bl-lg border border-ink/10 bg-white/40 text-body",
                  )}
                >
                  {m.role === "assistant" && m.pending && !m.content ? (
                    <span className="flex items-center gap-1">
                      <Dot /> <Dot d={0.15} /> <Dot d={0.3} />
                    </span>
                  ) : (
                    <MarkdownLite content={m.content} />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* input */}
        <div className="border-t border-ink/10 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <GlassInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={listening ? "Listening…" : "Ask Nucleus…"}
              disabled={busy}
            />
            {supported.stt && (
              <button
                onClick={toggleMic}
                aria-label={listening ? "Stop listening" : "Speak"}
                title={listening ? "Stop listening" : "Speak"}
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border transition active:scale-95",
                  listening
                    ? "animate-pulse border-transparent bg-ink text-white"
                    : "border-ink/15 bg-white/50 text-strong hover:bg-white/75",
                )}
              >
                <Icon name={listening ? "MicOff" : "Mic"} size={18} />
              </button>
            )}
            <button
              onClick={() => send(input)}
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#09090b] transition hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Icon name={busy ? "Loader2" : "Send"} size={18} className={busy ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function Dot({ d = 0 }: { d?: number }) {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60"
      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
      transition={{ duration: 1, repeat: Infinity, delay: d }}
    />
  );
}

/** Tiny Markdown renderer (bold, bullets, headers) — keeps deps light. */
function MarkdownLite({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        const header = /^#{1,6}\s+/.test(line);
        const bullet = /^\s*[-*•]\s+/.test(line);
        const numbered = /^\s*\d+\.\s+/.test(line);
        const text = line.replace(/^#{1,6}\s+/, "").replace(/^\s*[-*•]\s+/, "").replace(/^\s*\d+\.\s+/, "");
        return (
          <p key={i} className={cn(header && "font-semibold", (bullet || numbered) && "relative pl-4")}>
            {(bullet || numbered) && <span className="absolute left-0 opacity-60">{numbered ? line.match(/^\s*(\d+)\./)?.[1] + "." : "•"}</span>}
            <Inline text={text} />
          </p>
        );
      })}
    </div>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="rounded bg-ink/10 px-1 text-[12px]">{p.slice(1, -1)}</code>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
