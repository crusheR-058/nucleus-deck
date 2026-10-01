import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Nucleus Deck — Your Personal Command Center",
  description:
    "Nucleus Deck is a personal command center for your tasks, focus, knowledge, media, markets and AI. Liquid glass, spatial 3D architecture, and local-first memory.",
  keywords: [
    "Nucleus Deck",
    "personal command center",
    "liquid glass UI",
    "dashboard",
    "tasks",
    "focus timer",
    "MBBS curriculum",
    "AI assistant",
    "markets",
    "crypto",
  ],
  authors: [{ name: "Om Devi Shankar" }],
  openGraph: {
    title: "Nucleus Deck — Your Personal Command Center",
    description:
      "Everything important. One intelligent surface. Tasks, focus, knowledge, media, markets and local-first AI.",
    siteName: "Nucleus Deck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nucleus Deck — Your Personal Command Center",
    description:
      "Everything important. One intelligent surface. Tasks, focus, knowledge, media, markets and local-first AI.",
  },
};

export default function Page() {
  return <LandingPage />;
}
