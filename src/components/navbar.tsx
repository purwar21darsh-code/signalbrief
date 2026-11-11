"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Plus, Sparkles, Activity, FileText, Layers } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<{
    tavily: boolean;
    bifrost: boolean;
  }>({ tavily: false, bifrost: false });

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHealth({
          tavily: Boolean(data?.integrations?.tavily?.configured),
          bifrost: Boolean(data?.integrations?.bifrost?.configured),
        });
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Layers },
    { href: "/briefings/new", label: "New Briefing", icon: Plus },
    { href: "/demo", label: "Demo Scenarios", icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                SIGNALBRIEF
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v1.0
                </span>
              </span>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Evidence-First Meeting Intelligence
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status Indicators & CTA */}
        <div className="flex items-center gap-3">
          {/* Engine status pills */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  health.tavily ? "bg-blue-400" : "bg-amber-400"
                }`}
              />
              Tavily: {health.tavily ? "Key set" : "Not configured"}
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  health.bifrost ? "bg-blue-400" : "bg-amber-400"
                }`}
              />
              Bifrost: {health.bifrost ? "Endpoint set" : "Not configured"}
            </span>
          </div>

          <Link
            href="/briefings/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Prepare Meeting</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
