"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  Download,
  ArrowRight,
  TrendingUp,
  Search,
  ExternalLink,
} from "lucide-react";
import { formatDateSafe } from "@/lib/utils";
import { DemoModeBadge } from "@/components/status-badge";

interface BriefingSummary {
  id: string;
  meetingId: string;
  entityName: string;
  entityType: string;
  meetingDateTime: string;
  meetingPurpose: string;
  status: string;
  isDemo: boolean;
  findingsCount: number;
  sourcesCount: number;
  claimsCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [briefings, setBriefings] = useState<BriefingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/briefings")
      .then((res) => res.json())
      .then((data) => {
        if (data.briefings) {
          setBriefings(data.briefings);
        }
      })
      .catch((err) => console.error("Error loading briefings:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalFindings = briefings.reduce((acc, b) => acc + (b.findingsCount || 0), 0);
  const totalSources = briefings.reduce((acc, b) => acc + (b.sourcesCount || 0), 0);
  const completedCount = briefings.filter((briefing) => briefing.status === "completed").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Meeting Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time executive briefing memos generated within the 30-day evidence window.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Demo Scenarios</span>
          </Link>

          <Link
            href="/briefings/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Briefing</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Briefings
          </span>
          <p className="text-2xl font-extrabold text-white font-mono">{briefings.length}</p>
          <span className="text-[10px] text-blue-400 flex items-center gap-1">
            <span>Dynamic 30-day windows</span>
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Verified Developments
          </span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            {totalFindings}
          </p>
          <span className="text-[10px] text-emerald-400/80 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Items retained in reports</span>
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Sources Crawled &amp; Analyzed
          </span>
          <p className="text-2xl font-extrabold text-indigo-400 font-mono">
            {totalSources}
          </p>
          <span className="text-[10px] text-indigo-400/80 flex items-center gap-1">
            <Search className="h-3 w-3" />
            <span>Tavily Search &amp; Extract API</span>
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Completed Briefings
          </span>
          <p className="text-2xl font-extrabold text-white font-mono">{completedCount}</p>
          <span className="text-[10px] text-slate-400">Saved and ready to review</span>
        </div>
      </div>

      {/* Briefings List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" />
            <span>Recent Meeting Intelligence Briefings</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{briefings.length} records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs border border-slate-800 rounded-xl bg-slate-900/40">
            Loading recent briefings...
          </div>
        ) : briefings.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 space-y-4">
            <div className="h-12 w-12 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No briefings created yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Prepare for your upcoming meeting by running an autonomous 30-day intelligence
                crawl on any company or executive.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/briefings/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Your First Briefing</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {briefings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      {b.meetingPurpose.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDateSafe(b.createdAt, "MMM d, yyyy")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                      {b.entityName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Meeting: {formatDateSafe(b.meetingDateTime, "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Developments</span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {b.findingsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Sources</span>
                      <span className="font-semibold text-indigo-400 font-mono">
                        {b.sourcesCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Claims</span>
                      <span className="font-semibold text-white font-mono">{b.claimsCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-amber-400/90 font-medium">
                    {b.isDemo ? "Demo Dataset" : "Live Research"}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/briefings/${b.id}/pdf`}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Download PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <Link
                      href={`/briefings/${b.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      <span>Open Briefing</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
