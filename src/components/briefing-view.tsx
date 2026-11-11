"use client";

import React, { useState } from "react";
import { BriefingFull, SourceItem } from "@/types";
import { formatDateSafe } from "@/lib/utils";
import { VerificationBadge, DemoModeBadge } from "@/components/status-badge";
import { SourceModal } from "@/components/source-modal";
import {
  Download,
  Printer,
  RotateCw,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  Share2,
} from "lucide-react";

interface BriefingViewProps {
  briefing: BriefingFull;
  onRegenerate?: () => void;
}

export function BriefingView({ briefing, onRegenerate }: BriefingViewProps) {
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/briefings/${briefing.id}/pdf`);
      if (!response.ok) throw new Error("PDF generation failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SignalBrief_${briefing.meeting.entityName}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download PDF: " + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar (No-Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <DemoModeBadge isDemo={briefing.isDemo} />
          {!briefing.isDemo && briefing.qualityScore != null && (
            <span className="text-xs text-slate-400 hidden sm:inline">
              Evidence checklist: <strong className="text-emerald-400 font-mono">{briefing.qualityScore}%</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Regenerate</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copied ? "Copied Link!" : "Share"}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? "Generating PDF..." : "Export Executive PDF"}</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Briefing Document Sheet (White/Clean Light Surface) */}
      <div className="print-page bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header Block */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 border-b-4 border-blue-600">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  SIGNALBRIEF EXECUTIVE MEMO
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  CONFIDENTIAL / FOR INTERNAL USE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                {briefing.meeting.entityName}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Meeting Focus:{" "}
                <span className="text-white font-medium capitalize">
                  {briefing.meeting.meetingPurpose.replace("_", " ")}
                </span>
                {briefing.meeting.objective && ` • ${briefing.meeting.objective}`}
              </p>
            </div>

            {/* Time & Window Box */}
            <div className="sm:text-right text-xs text-slate-300 space-y-1 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 text-[11px] block">Scheduled Meeting</span>
                <span className="font-semibold text-white">
                  {formatDateSafe(briefing.meeting.meetingDateTime, "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">30-Day Research Window</span>
                <span className="font-mono text-blue-400 text-[11px]">
                  {formatDateSafe(briefing.researchWindowStart, "MMM d")} -{" "}
                  {formatDateSafe(briefing.researchWindowEnd, "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* SECTION 1: EXECUTIVE SNAPSHOT */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                1. Executive Snapshot
              </h2>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-700 font-serif">
              {briefing.executiveSummary ||
                "Information summary gathered from verifiable sources within the 30-day window."}
            </div>
          </section>

          {/* SECTION 2: WHAT CHANGED IN THE LAST 30 DAYS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. What Changed in the Last 30 Days
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                {briefing.developments.length} evidence-linked item(s)
              </span>
            </div>

            <div className="grid gap-3">
              {briefing.developments.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-lg">
                No recent development was confirmed from dated evidence in this research window.
                </p>
              ) : (
                briefing.developments.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {dev.eventDate}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {dev.category}
                        </span>
                        <VerificationBadge
                          status={dev.verificationStatus}
                          confidence={dev.confidence}
                        />
                      </div>

                      {/* Clickable Source Citations */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {dev.sourceIds.map((srcId, idx) => {
                          const src = briefing.sources.find((s) => s.id === srcId);
                          return (
                            <button
                              key={srcId}
                              onClick={() => src && setSelectedSource(src)}
                              className="text-[10px] font-mono text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1 transition-colors"
                              title={src?.title || "View citation provenance"}
                            >
                              <span>[{idx + 1}]</span>
                              <span className="max-w-[120px] truncate">
                                {src?.domain || "source"}
                              </span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {dev.headline}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {dev.whatHappened}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-start gap-2 text-xs">
                      <span className="text-blue-700 font-bold shrink-0 text-[11px] uppercase tracking-wide">
                        Why it matters:
                      </span>
                      <span className="text-slate-700 font-medium leading-relaxed">
                        {dev.whyItMatters}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SECTION 3 & 4: 2-COLUMN STRATEGIC IMPLICATIONS & QUESTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION 3: STRATEGIC IMPLICATIONS */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. Strategic Implications (Analysis)
                </h2>
              </div>

              <div className="space-y-3">
                {briefing.implications.map((imp) => (
                  <div
                    key={imp.id}
                    className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 text-[11px] uppercase tracking-wider">
                        {imp.area}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        ANALYST INTERPRETATION
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {imp.implication}
                    </p>
                    {imp.strategicContext && (
                      <p className="text-[11px] text-slate-500 italic">
                        Context: {imp.strategicContext}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 4: QUESTIONS TO ASK */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  4. High-Impact Questions to Ask
                </h2>
              </div>

              <div className="space-y-2.5">
                {briefing.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors text-xs space-y-1 shadow-xs"
                  >
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-[11px]">
                      <span className="h-4 w-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{q.targetObjective || "Strategic Discussion"}</span>
                    </div>
                    <p className="text-slate-900 font-semibold leading-relaxed">
                      "{q.question}"
                    </p>
                    {q.context && (
                      <p className="text-[10px] text-slate-500 italic">
                        Why ask: {q.context}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SECTION 5: WATCHLIST & UNCERTAINTIES */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                5. Intelligence Watchlist (Uncertainties &amp; Missing Information)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {briefing.watchlist.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-[11px]">
                      {item.topic}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      {item.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">{item.concern}</p>
                  {item.suggestedAction && (
                    <p className="text-[11px] text-amber-800 font-medium">
                      Action: {item.suggestedAction}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: SOURCES PROVENANCE & CITED REPOSITORY */}
          <section className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                6. Source Provenance ({briefing.sources.length})
              </h2>
              <span className="text-[11px] text-slate-500">
                Real-time crawl powered by Tavily Search &amp; Extract
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {briefing.sources.map((src, i) => (
                <div
                  key={src.id}
                  onClick={() => setSelectedSource(src)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-white cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold text-blue-700">[{i + 1}] {src.domain}</span>
                      <span>{src.publicationDate !== "unknown" ? src.publicationDate : "Past 30d"}</span>
                    </div>
                    <p className="text-slate-800 font-medium text-[11px] line-clamp-2">
                      {src.title}
                    </p>
                  </div>
                  <span className="text-[10px] text-blue-600 mt-2 font-medium flex items-center gap-1">
                    <span>Inspect Raw Evidence</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Verification Bar */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Generated via SignalBrief Autonomous Pipeline • {briefing.wordCount || 520} words
          </span>
          <span className="font-mono text-slate-600">
            Inference: Bifrost Gateway • Research: Tavily Engine
          </span>
        </div>
      </div>

      {/* Source Modal */}
      <SourceModal
        source={selectedSource}
        relatedClaims={
          selectedSource
            ? briefing.claims.filter((c) => c.sourceIds.includes(selectedSource.id))
            : []
        }
        onClose={() => setSelectedSource(null)}
      />
    </div>
  );
}
