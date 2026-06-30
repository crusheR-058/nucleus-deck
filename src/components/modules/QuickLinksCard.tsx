"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader, IconCapsule } from "@/components/ui/CardHeader";
import { GlassInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

function normalizeUrl(u: string) {
  const t = u.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function QuickLinksCard({ delay = 0 }: { delay?: number }) {
  const links = useDeck((s) => s.quickLinks);
  const addLink = useDeck((s) => s.addLink);
  const removeLink = useDeck((s) => s.removeLink);

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const submit = () => {
    const u = normalizeUrl(url);
    if (!label.trim() || !u) return;
    addLink(label.trim(), u);
    setLabel("");
    setUrl("");
    setAdding(false);
  };

  return (
    <GlassCard delay={delay} depth={1.5} className="flex flex-col">
      <CardHeader
        iconName="Link"
        eyebrow="Shortcuts"
        title="Quick links"
        right={
          <button
            onClick={() => setAdding((v) => !v)}
            aria-label="Add link"
            className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-white/50 text-strong transition hover:bg-white/80"
          >
            <Icon name={adding ? "X" : "Plus"} size={16} />
          </button>
        }
      />

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <GlassInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Name" className="py-2" />
              <GlassInput
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="example.com"
                className="py-2"
              />
              <button
                onClick={submit}
                aria-label="Save link"
                className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink text-white transition hover:scale-105 active:scale-95"
              >
                <Icon name="Check" size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid flex-1 grid-cols-3 gap-2.5">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/45 bg-white/35 px-2 py-4 transition hover:-translate-y-1 hover:bg-white/60 hover:shadow-[0_16px_30px_-18px_rgba(8,8,12,0.5)]"
          >
            <IconCapsule name={l.icon} size={38} />
            <span className="max-w-full truncate text-[12px] font-medium text-body">{l.label}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                removeLink(l.id);
              }}
              aria-label={`Remove ${l.label}`}
              className="absolute right-1.5 top-1.5 text-faint opacity-0 transition hover:text-ink group-hover:opacity-100"
            >
              <Icon name="X" size={13} />
            </button>
            <Icon
              name="ArrowUpRight"
              size={13}
              className="absolute bottom-1.5 right-1.5 text-faint opacity-0 transition group-hover:opacity-100"
            />
          </a>
        ))}
      </div>
    </GlassCard>
  );
}
