"use client";

import React from "react";
import { DEMO_PRESETS } from "@/lib/demo/sample-data";
import { BriefingView } from "@/components/briefing-view";
import { BriefingFull } from "@/types";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  const selectedKey = "microsoft";
  const preset = DEMO_PRESETS.microsoft;

  // Convert preset to full briefing format for rendering
  const activeBriefing: BriefingFull = {
    id: `demo-${selectedKey}`,
    meetingId: `demo-mtg-${selectedKey}`,
    meeting: {
      id: `demo-mtg-${selectedKey}`,
      entityName: preset.entityName,
      entityType: preset.entityType,
      meetingDateTime: "2025-04-15T14:00:00.000Z",
      timezone: "UTC",
      meetingPurpose: preset.meetingPurpose,
      objective: preset.objective,
      additionalContext: preset.additionalContext,
    },
    status: "completed",
    isDemo: true,
    executiveSummary: preset.briefing.executiveSummary,
    developments: preset.briefing.developments,
    implications: preset.briefing.implications,
    questions: preset.briefing.questions,
    watchlist: preset.briefing.watchlist,
    sources: preset.briefing.sources,
    claims: preset.briefing.claims,
    researchWindowStart: preset.briefing.researchWindowStart,
    researchWindowEnd: preset.briefing.researchWindowEnd,
    generatedAt: preset.briefing.generatedAt,
    wordCount: preset.briefing.wordCount,
    qualityScore: undefined,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Banner */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                ARCHIVED DEMO SNAPSHOT · APR 10, 2025
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Instant Hackathon Demonstration Showcase
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              This prepared, source-attributed historical example is for product evaluation only. It
              is not live Tavily research and does not describe Microsoft today. Inspect the dated
              citations, evidence labels and PDF export without API keys.
            </p>
          </div>

          <Link
            href="/briefings/new"
            className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <span>Run Custom Research</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-slate-300">
        Microsoft · Partnership · Historical research window: Mar 11–Apr 10, 2025
      </div>

      {/* Briefing View */}
      <BriefingView briefing={activeBriefing} />
    </div>
  );
}
