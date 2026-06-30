"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useDeck } from "@/lib/store";
import { aiText } from "@/lib/ai-client";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { GlassTextarea } from "@/components/ui/Field";
import { GlassButton } from "@/components/ui/GlassButton";
import { Icon } from "@/components/ui/Icon";

export function NotesCard({ delay = 0 }: { delay?: number }) {
  const notes = useDeck((s) => s.notes);
  const setNotes = useDeck((s) => s.setNotes);
  const tidyNotes = useDeck((s) => s.tidyNotes);
  const setTidyNotes = useDeck((s) => s.setTidyNotes);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tidy = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setError("");
    try {
      const text = await aiText("tidy-notes", { notes });
      setTidyNotes(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not tidy notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard delay={delay} depth={1.5} className="flex flex-col">
      <CardHeader
        iconName="StickyNote"
        eyebrow="Scratchpad"
        title="Notes"
        right={
          <GlassButton size="sm" iconName="Wand2" onClick={tidy} loading={loading} disabled={!notes.trim()}>
            Tidy
          </GlassButton>
        }
      />

      <GlassTextarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Brain-dump anything… ideas, reminders, half-thoughts."
        className="min-h-[150px] flex-1"
      />

      {error && <p className="mt-2 text-[12px] text-ink/70">{error}</p>}

      <AnimatePresence>
        {tidyNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="rounded-2xl border border-white/50 bg-white/45 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="label-eyebrow inline-flex items-center gap-1.5">
                  <Icon name="Sparkles" size={12} /> Tidied
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard?.writeText(tidyNotes)}
                    className="text-[11px] text-muted transition hover:text-ink"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      setNotes(tidyNotes);
                      setTidyNotes("");
                    }}
                    className="text-[11px] font-medium text-ink"
                  >
                    Replace notes
                  </button>
                  <button onClick={() => setTidyNotes("")} aria-label="Dismiss" className="text-faint hover:text-ink">
                    <Icon name="X" size={13} />
                  </button>
                </div>
              </div>
              <pre className="scroll-area max-h-40 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-body">
                {tidyNotes}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
