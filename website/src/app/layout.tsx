import type { Metadata } from "next";
import { Geist_Mono, JetBrains_Mono, DM_Sans } from "next/font/google";
import "@/styles/globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AgentFail — AI Agent Incident Database",
  description:
    "A public database of AI agent failures, incidents, and near-misses. Learn from what went wrong.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} bg-[var(--bg-deep)] text-[var(--text-primary)] antialiased`}
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-[var(--bg-surface)] focus:text-[var(--text-primary)] focus:rounded"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="min-h-screen">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
