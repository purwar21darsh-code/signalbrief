"use client";

import React from "react";
import { SourceItem, ClaimItem } from "@/types";
import { ExternalLink, X, Shield, Calendar, Globe, BookOpen } from "lucide-react";
import { formatDateSafe } from "@/lib/utils";
import { VerificationBadge } from "@/components/status-badge";

interface SourceModalProps {
  source: SourceItem | null;
  relatedClaims?: ClaimItem[];
  onClose: () => void;
}

export function SourceModal({ source, relatedClaims = [], onClose }: SourceModalProps) {
  if (!source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {source.sourceType.replace("_", " ")}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {source.domain}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {source.publicationDate !== "unknown"
                  ? formatDateSafe(source.publicationDate)
                  : "Date unconfirmed"}
              </span>
            </div>
            <h3 className="text-base font-semibold leading-snug text-white">
              {source.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close source details"
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/60 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Publisher quality heuristic</span>
              <span className="font-semibold text-emerald-400">
                {Math.round(source.credibilityScore * 100)} / 100
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Query Angle</span>
              <span className="font-medium text-slate-300">
                {source.searchAngle || "General web intelligence"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Source Provenance</span>
              <span className="font-medium text-slate-300">Tavily Search + Extract</span>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Search query</span>
              <span className="font-medium text-slate-300">{source.searchQuery || source.searchAngle || "Not available"}</span>
            </div>
            {source.relevanceScore !== undefined && (
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Meeting relevance heuristic</span>
                <span className="font-medium text-slate-300">{Math.round(source.relevanceScore * 100)} / 100</span>
              </div>
            )}
            <div className="col-span-2 sm:col-span-3 min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Original URL</span>
              <span className="font-mono text-[10px] text-blue-300 break-all">{source.url}</span>
            </div>
          </div>

          {/* Extracted Evidence */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              Extracted Raw Evidence &amp; Text
            </h4>
            <div className="p-4 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-300 font-mono leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
              {source.extractedContent || "Content extracted during research crawl."}
            </div>
          </div>

          {/* Related Claims */}
          {relatedClaims.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Claims Attributed to This Source ({relatedClaims.length})
              </h4>
              <div className="space-y-2">
                {relatedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <VerificationBadge
                        status={claim.verificationStatus}
                        confidence={claim.confidenceLevel}
                      />
                      <span className="text-[10px] text-slate-400">
                        Date: {claim.eventDate || "Past 30 Days"}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium">{claim.text}</p>
                    {claim.reasoning && (
                      <p className="text-[11px] text-slate-400 italic">
                        Evidence logic: {claim.reasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/90 text-xs">
          <span className="text-slate-400">
            Clicking link opens external publisher in a new tab.
          </span>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <span>Visit Original Source</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
