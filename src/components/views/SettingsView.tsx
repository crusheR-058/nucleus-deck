"use client";

import { useDeck } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader } from "@/components/ui/CardHeader";
import { GlassInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { NucleusLogo3D } from "@/components/ui/NucleusLogo3D";
import { cn } from "@/lib/utils";
import type { Settings } from "@/lib/types";

export function SettingsView() {
  const settings = useDeck((s) => s.settings);
  const updateSettings = useDeck((s) => s.updateSettings);
  const water = useDeck((s) => s.water);
  const setWaterGoal = useDeck((s) => s.setWaterGoal);

  const clearAll = () => {
    if (!confirm("Reset Nucleus Deck? This clears all your tasks, habits, notes, mood history and settings on this device.")) return;
    useDeck.persist.clearStorage();
    location.reload();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <GlassCard depth={1.5} delay={0}>
        <CardHeader iconName="Settings2" eyebrow="Personalize" title="Your deck" />
        <div className="space-y-4">
          <Row label="Name" hint="Used in greetings and by the assistant">
            <GlassInput value={settings.name} onChange={(e) => updateSettings({ name: e.target.value })} className="max-w-xs" />
          </Row>
          <Row label="City" hint="Shown in your header">
            <GlassInput value={settings.city} onChange={(e) => updateSettings({ city: e.target.value })} className="max-w-xs" />
          </Row>
          <Row label="Daily water goal" hint={`Cup size ${water.cupMl}ml`}>
            <div className="flex items-center gap-2">
              <button onClick={() => setWaterGoal(Math.max(500, water.goalMl - 250))} className="grid h-9 w-9 place-items-center rounded-xl border border-ink/15 bg-white/50 text-strong hover:bg-white/75">
                <Icon name="Minus" size={16} />
              </button>
              <span className="tabular w-20 text-center font-medium text-strong">{(water.goalMl / 1000).toFixed(2)} L</span>
              <button onClick={() => setWaterGoal(water.goalMl + 250)} className="grid h-9 w-9 place-items-center rounded-xl border border-ink/15 bg-white/50 text-strong hover:bg-white/75">
                <Icon name="Plus" size={16} />
              </button>
            </div>
          </Row>
        </div>
      </GlassCard>

      <GlassCard depth={1.5} delay={0.08}>
        <CardHeader iconName="Sparkles" eyebrow="Look & feel" title="Theme & graphics" />
        <div className="space-y-4">
          <Row label="Theme" hint="Dark, light, or follow your system">
            <Segmented<Settings["theme"]>
              value={settings.theme ?? "dark"}
              onChange={(v) => updateSettings({ theme: v })}
              options={[
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
                { value: "auto", label: "Auto" },
              ]}
            />
          </Row>
          <Row label="Motion" hint="Honor system reduced-motion, or force on/off">
            <Segmented<Settings["reduceMotion"]>
              value={settings.reduceMotion}
              onChange={(v) => updateSettings({ reduceMotion: v })}
              options={[
                { value: "auto", label: "Auto" },
                { value: "on", label: "Reduce" },
                { value: "off", label: "Full" },
              ]}
            />
          </Row>
          <Row label="3D crystal background" hint="WebGL refractions & particles (turn off for max performance)">
            <Toggle on={settings.webglBackground} onClick={() => updateSettings({ webglBackground: !settings.webglBackground })} />
          </Row>
          <Row label="Focus mode" hint="Hide everything except the MBBS hub & Assistant">
            <Toggle on={settings.focusMode} onClick={() => updateSettings({ focusMode: !settings.focusMode })} />
          </Row>
          <Row label="Assistant voice" hint="Speak replies aloud + enable the mic in chat">
            <Toggle on={settings.voice} onClick={() => updateSettings({ voice: !settings.voice })} />
          </Row>
        </div>
      </GlassCard>

      <GlassCard variant="charcoal" depth={1.5} delay={0.16}>
        <div className="flex items-center gap-4">
          <NucleusLogo3D size={56} />
          <div className="flex-1">
            <div className="font-display text-[16px] font-medium text-white">Nucleus Deck</div>
            <div className="text-[12px] text-white/50">Your personal liquid-glass home base. Data lives in this browser.</div>
          </div>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-[12px] font-medium text-white/80 transition hover:bg-white/10"
          >
            <Icon name="Trash2" size={13} /> Reset all data
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-[14px] font-medium text-strong">{label}</div>
        {hint && <div className="text-[12px] text-faint">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={cn("relative h-7 w-12 rounded-full border transition", on ? "border-ink bg-ink" : "border-ink/20 bg-white/50")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-[26px]" : "left-0.5")} />
    </button>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-ink/15 bg-white/40 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium transition", value === o.value ? "bg-ink text-white" : "text-muted hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
