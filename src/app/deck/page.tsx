import { AppShell } from "@/components/layout/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nucleus Deck — Command Center",
  description: "Personal liquid-glass command center: tasks, habits, focus, notes, mood, media, markets, and AI assistant.",
};

export default function DeckPage() {
  return <AppShell />;
}
