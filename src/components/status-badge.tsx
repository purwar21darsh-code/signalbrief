import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, Shield, Sparkles } from "lucide-react";

export function VerificationBadge({
  status,
  confidence,
  className = "",
}: {
  status: "verified" | "disputed" | "uncertain";
  confidence?: "high" | "medium" | "low";
  className?: string;
}) {
  if (status === "verified") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <CheckCircle2 className="h-3 w-3" />
        Verified {confidence && `(${confidence})`}
      </span>
    );
  }

  if (status === "disputed") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}
      >
        <AlertTriangle className="h-3 w-3" />
        Disputed
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 ${className}`}
    >
      <HelpCircle className="h-3 w-3" />
      Uncertain
    </span>
  );
}

export function DemoModeBadge({ isDemo }: { isDemo: boolean }) {
  if (isDemo) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs">
        <Sparkles className="h-3 w-3 text-amber-400" />
        ARCHIVED DEMO DATA · NOT LIVE RESEARCH
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs">
      <Shield className="h-3 w-3 text-emerald-400" />
      LIVE TAVILY &amp; BIFROST RESEARCH
    </span>
  );
}
