import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nucleus Deck",
  description:
    "A personal liquid-glass life dashboard — tasks, habits, focus, mood, weather, YouTube, tech news and a built-in AI assistant.",
  applicationName: "Nucleus Deck",
  authors: [{ name: "Om Devi Shankar" }],
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><radialGradient id='g' cx='40%' cy='35%'><stop offset='0%' stop-color='white'/><stop offset='100%' stop-color='%23a1a1aa'/></radialGradient></defs><circle cx='16' cy='16' r='13' fill='url(%23g)'/><circle cx='16' cy='16' r='5' fill='%2318181b'/></svg>`,
          ),
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b0b0e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t='dark';var raw=localStorage.getItem('nucleus-deck-v1');if(raw){var p=JSON.parse(raw);var s=p&&p.state&&p.state.settings;if(s&&s.theme)t=s.theme;}var dark=t==='dark'||(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&f[]=general-sans@300,400,500,600,700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
