"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Calendar,
  Clock,
  Globe,
  Briefcase,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function NewBriefingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [entityName, setEntityName] = useState("");
  const [entityType, setEntityType] = useState<"company" | "person">("company");
  const [meetingDate, setMeetingDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0] // default 2 days in future
  );
  const [meetingTime, setMeetingTime] = useState("14:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [meetingPurpose, setMeetingPurpose] = useState<
    "partnership" | "sales" | "investment" | "interview" | "business_development" | "general"
  >("partnership");
  const [objective, setObjective] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  // Presets handler
  const loadPreset = () => {
    setEntityName("Microsoft");
    setEntityType("company");
    setMeetingDate("2025-04-15");
    setMeetingTime("14:00");
    setTimezone("UTC");
    setMeetingPurpose("partnership");
    setObjective("Discuss enterprise adoption and partner opportunities around Microsoft Copilot and AI agents.");
    setAdditionalContext("This is an archived demonstration snapshot dated April 10, 2025.");
    setIsDemo(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const combinedDateTime = fromZonedTime(`${meetingDate}T${meetingTime}:00`, timezone).toISOString();

      const res = await fetch("/api/briefings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityName,
          entityType,
          meetingDateTime: combinedDateTime,
          timezone,
          meetingPurpose,
          objective: objective || undefined,
          additionalContext: additionalContext || undefined,
          isDemo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create briefing");
      }

      const data = await res.json();
      router.push(`/briefings/${data.briefing.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Prepare Meeting Intelligence Briefing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Specify your meeting details. SignalBrief will autonomously crawl the preceding 30 days of
          web evidence via Tavily and synthesize a source-verified briefing via Bifrost.
        </p>
      </div>

      {/* Preset Fill Bar for Instant Testing */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Prepared archive example:
          </span>
          <span className="text-[10px] text-slate-400">Static data · not live web research</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadPreset}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Microsoft · historical partnership briefing
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6"
      >
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Entity Name & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Company or Person's Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="e.g. Stripe, Databricks, Satya Nadella"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Entity Classification
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="company">Company / Org</option>
              <option value="person">Person / Executive</option>
            </select>
          </div>
        </div>

        {/* Date, Time & Timezone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              <span>Meeting Date</span>
            </label>
            <input
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              <span>Meeting Time</span>
            </label>
            <input
              type="time"
              required
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span>Timezone</span>
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Central European (CET)</option>
              <option value="Asia/Singapore">Singapore (SGT)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        {/* Meeting Purpose */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-blue-400" />
            <span>Meeting Purpose</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: "partnership", label: "Strategic Partnership" },
              { id: "sales", label: "Enterprise Sales / Vendor" },
              { id: "investment", label: "Venture / Private Equity" },
              { id: "business_development", label: "Business Development" },
              { id: "interview", label: "Executive Interview" },
              { id: "general", label: "General Intelligence" },
            ].map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setMeetingPurpose(p.id as any)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                  meetingPurpose === p.id
                    ? "border-blue-500 bg-blue-600/15 text-white ring-1 ring-blue-500"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Objective */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Primary Meeting Objective
          </label>
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="e.g. Negotiate commercial terms for checkout API and clarify stablecoin fee schedule"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Additional Context */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Additional Context or Background Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Provide any confidential background, mutual connections, or specific areas of concern you'd like the agent to factor into the questions."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Mode Toggle: Live vs Demo */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">
              Execution Mode
            </span>
            <p className="text-[11px] text-slate-400">
              {isDemo
                ? "Prepared April 2025 archive example; sources are dated and this is not live research."
                : "Live Tavily real-time web search and Maxim AI Bifrost inference"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDemo(!isDemo)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isDemo
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-blue-600/20 text-blue-300 border border-blue-500/30"
            }`}
          >
            {isDemo ? "Demo Dataset" : "Live Web Engine"}
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !entityName}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{submitting ? "Initiating Research Pipeline..." : "Start Autonomous Research"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
