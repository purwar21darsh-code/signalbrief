"use client";

import React, { useEffect, useState } from "react";
import { StageEvent, BriefingFull } from "@/types";
import {
  CheckCircle2,
  Clock,
  Search,
  FileText,
  ShieldCheck,
  BrainCircuit,
  Database,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ResearchLiveViewProps {
  briefingId: string;
  initialBriefing?: BriefingFull;
  onCompleted?: (briefing: BriefingFull) => void;
}

const STAGES = [
  { key: "NORMALIZATION", label: "Input Normalization", demoLabel: "Meeting Details", icon: Database },
  { key: "ENTITY_IDENTIFICATION", label: "Entity Resolution", demoLabel: "Archived Entity", icon: BrainCircuit },
  { key: "RESEARCH_PLANNING", label: "Research Planning", demoLabel: "Saved Research Plan", icon: FileText },
  { key: "WEB_RESEARCH", label: "Tavily Web Search", demoLabel: "Archived Sources", icon: Search },
  { key: "CONTENT_EXTRACTION", label: "Tavily Content Extraction", demoLabel: "Saved Source Text", icon: ExternalLink },
  { key: "EVIDENCE_PROCESSING", label: "Evidence Analysis", demoLabel: "Evidence Review", icon: BrainCircuit },
  { key: "CLAIM_VERIFICATION", label: "Claim Checks", demoLabel: "Saved Claim Links", icon: ShieldCheck },
  { key: "MEETING_INTELLIGENCE", label: "Meeting Questions", demoLabel: "Meeting Questions", icon: FileText },
  { key: "BRIEFING_GENERATION", label: "Briefing Generation", demoLabel: "Archived Briefing", icon: CheckCircle2 },
];

export function ResearchLiveView({
  briefingId,
  initialBriefing,
  onCompleted,
}: ResearchLiveViewProps) {
  const [events, setEvents] = useState<StageEvent[]>([]);
  const [currentStage, setCurrentStage] = useState<string>("NORMALIZATION");
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retrySequence, setRetrySequence] = useState(0);
  const [completedBriefing, setCompletedBriefing] = useState<BriefingFull | null>(
    initialBriefing?.status === "completed" ? initialBriefing : null
  );
  const isDemo = Boolean(initialBriefing?.isDemo);

  useEffect(() => {
    if (initialBriefing && (initialBriefing.status === "completed" || (initialBriefing.status === "failed" && retrySequence === 0))) {
      fetch(`/api/briefings/${briefingId}/status`)
        .then((response) => response.ok ? response.json() : null)
        .then((data) => {
          if (data?.stages) setEvents(data.stages.flatMap((stage: { events?: StageEvent[] }) => stage.events || []));
        })
        .catch(() => {});
      if (initialBriefing.status === "completed") {
        setIsDone(true);
        setProgressPercent(100);
      } else {
        setErrorMessage(initialBriefing.lastError || "Research failed. Check the service configuration and retry.");
      }
      return;
    }

    // Connect to Server-Sent Events stream
    setErrorMessage(null);
    const eventSource = new EventSource(`/api/briefings/${briefingId}/research`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          setErrorMessage(data.message || "An error occurred during research execution.");
          eventSource.close();
          return;
        }

        if (data.done) {
          setIsDone(true);
          setProgressPercent(100);
          if (data.briefing) {
            setCompletedBriefing(data.briefing);
            if (onCompleted) onCompleted(data.briefing);
          } else {
            fetch(`/api/briefings/${briefingId}`)
              .then((response) => response.ok ? response.json() : null)
              .then((briefing: BriefingFull | null) => {
                if (!briefing) return;
                setCompletedBriefing(briefing);
                if (onCompleted) onCompleted(briefing);
              })
              .catch(() => {});
          }
          eventSource.close();
          return;
        }

        const stageEvent: StageEvent = data;
        setEvents((prev) => [...prev, stageEvent]);
        setCurrentStage(stageEvent.stage);

        if (stageEvent.progressPercent) {
          setProgressPercent(stageEvent.progressPercent);
        }
      } catch (e) {
        console.warn("Error parsing SSE event:", e);
      }
    };

    eventSource.onerror = (err) => {
      // Keep EventSource open so its native reconnect can attach to persisted stage events.
      console.warn("Research event stream disconnected; reconnecting:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [briefingId, initialBriefing?.status, initialBriefing?.lastError, onCompleted, retrySequence]);

  const retryResearch = () => {
    setEvents([]);
    setProgressPercent(10);
    setCurrentStage("NORMALIZATION");
    setErrorMessage(null);
    setRetrySequence((value) => value + 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner & Progress Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isDemo ? (isDone ? "Archived Demo Loaded" : "Loading Archived Demo") : (isDone ? "Research Pipeline Complete" : "Autonomous Research in Progress")}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isDemo ? "Showing a prepared April 2025 dataset. No Tavily or Bifrost requests are made in demo mode." : "Live Tavily research and Bifrost analysis are running on the server."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-blue-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-2 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stage Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
          {STAGES.map((s, index) => {
            const isPassed =
              progressPercent >= (index + 1) * (100 / STAGES.length) || isDone;
            const isCurrent = currentStage.includes(s.key) && !isDone;
            const Icon = s.icon;

            return (
              <div
                key={s.key}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30"
                    : isPassed
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                    : "border-slate-800/80 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-medium block truncate leading-tight">
                  {isDemo ? s.demoLabel : s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-300">Research Pipeline Error</h4>
            <p className="mt-1">{errorMessage}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={retryResearch}
                className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 rounded font-medium text-white transition-colors"
              >
                Retry Research
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Banner with Action Button */}
      {isDone && (
        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Meeting Intelligence Briefing Ready
              </h3>
              <p className="text-xs text-emerald-300/80">
                {isDemo ? "Archived fixture loaded. Review the historical dates and original source links." : "The saved briefing includes evidence links and the pipeline's date and citation checks."}
              </p>
            </div>
          </div>

          <Link
            href={`/briefings/${briefingId}?view=report`}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View Briefing Report</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Live Event Stream Terminal */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              Live Pipeline Telemetry &amp; Provenance Log
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {events.length} event(s) recorded
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
          {events.length === 0 ? (
            <div className="text-slate-400 py-6 text-center italic">
              Connecting to agent pipeline stream...
            </div>
          ) : (
            events.map((ev, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-1 border-b border-slate-900/60 last:border-0"
              >
                <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                  {ev.timestamp.split("T")[1]?.slice(0, 8) || "00:00:00"}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase ${
                    ev.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : ev.status === "failed"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {ev.stage}
                </span>
                <span className="text-slate-300 leading-relaxed text-[11px]">
                  {ev.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
