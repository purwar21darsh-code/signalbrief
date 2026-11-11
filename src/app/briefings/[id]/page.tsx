"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BriefingFull } from "@/types";
import { ResearchLiveView } from "@/components/research-live-view";
import { BriefingView } from "@/components/briefing-view";
import {
  FileText,
  Activity,
  Layers,
  ArrowLeft,
  Share2,
  ExternalLink,
  Shield,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function BriefingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [briefing, setBriefing] = useState<BriefingFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"report" | "live" | "sources">("report");

  useEffect(() => {
    fetch(`/api/briefings/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load briefing");
        return res.json();
      })
      .then((data: BriefingFull) => {
        setBriefing(data);
        if (data.status === "researching" || data.status === "pending" || data.status === "failed") {
          setActiveTab("live");
        } else if (searchParams.get("view") === "report") {
          setActiveTab("report");
        }
      })
      .catch((err) => console.error("Error loading briefing:", err))
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading meeting briefing intelligence...</p>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Briefing Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested briefing does not exist or was deleted.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const handleCompleted = (updated: BriefingFull) => {
    setBriefing(updated);
    setActiveTab("report");
  };

  const handleRegenerate = async () => {
    setActiveTab("live");
    try {
      const response = await fetch(`/api/briefings/${id}/regenerate`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Research could not be regenerated.");
      }
      const fresh = await fetch(`/api/briefings/${id}`).then((r) => r.json());
      setBriefing(fresh);
      setActiveTab("report");
    } catch (e) {
      alert("Regeneration failed: " + (e as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {briefing.meeting.entityName}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {briefing.meeting.meetingPurpose}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Briefing ID: <span className="font-mono">{briefing.id.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "report"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Executive Briefing</span>
          </button>

          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "live"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Research Live Stream</span>
          </button>

          <button
            onClick={() => setActiveTab("sources")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "sources"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Sources ({briefing.sources.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "report" && (
        <BriefingView briefing={briefing} onRegenerate={handleRegenerate} />
      )}

      {activeTab === "live" && (
        <ResearchLiveView
          briefingId={briefing.id}
          initialBriefing={briefing}
          onCompleted={handleCompleted}
        />
      )}

      {activeTab === "sources" && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
            <h2 className="text-base font-bold text-white">
              Source Explorer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Included findings map to cited source evidence. Open a source to review the original reporting and extracted context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefing.sources.map((src, idx) => (
              <div
                key={src.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    Source #{idx + 1} • {src.sourceType}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {Math.round(src.credibilityScore * 100)}% Credibility
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{src.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Domain: <span className="text-slate-300 font-mono">{src.domain}</span> • Published:{" "}
                    {src.publicationDate}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-400 max-h-36 overflow-y-auto">
                  {src.extractedContent || "Content extracted during research crawl."}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Angle: {src.searchAngle || "Company intelligence"}
                  </span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <span>Open URL</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
