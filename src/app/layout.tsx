import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIGNALBRIEF — Evidence-First Meeting Intelligence Agent",
  description:
    "Know what matters before you enter the room. Autonomous 30-day business intelligence powered by Tavily and Maxim AI Bifrost.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="no-print border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              © 2026 SignalBrief • Global AI Hackathon Problem Statement 05 • Tavily + Bifrost
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <a href="/api/health" target="_blank" className="hover:text-blue-400 transition-colors">
                System Diagnostics
              </a>
              <span className="text-slate-700">•</span>
              <a href="/demo" className="hover:text-blue-400 transition-colors">
                Demo Showcase
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
