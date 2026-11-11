import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
} from "lucide-react";

export default function LandingPage() {
  const workflowSteps = [
    { title: "User Input", desc: "Entity name, meeting purpose, scheduled date & time" },
    { title: "Dynamic 30-Day Window", desc: "Calculates precise research boundary capped at execution" },
    { title: "Bifrost Planning", desc: "Decomposes entity context into 4-6 specialized query angles" },
    { title: "Tavily Web Search", desc: "Executes targeted parallel searches across recent news & PR" },
    { title: "Content Extraction", desc: "Retrieves authoritative text from high-credibility primary sources" },
    { title: "Claim Verification", desc: "Extracts factual claims & evaluates confidence and discrepancies" },
    { title: "Meeting Intelligence", desc: "Formulates strategic implications & 4-6 targeted questions" },
    { title: "Executive One-Page PDF", desc: "Strict 450-650 word layout ready for executive download" },
  ];

  const features = [
    {
      icon: Search,
      title: "Real-Time 30-Day Tavily Crawl",
      desc: "Tavily searches multiple angles; dated evidence, older background and unknown publication dates stay distinct in the report.",
    },
    {
      icon: BrainCircuit,
      title: "Bifrost by Maxim AI Gateway",
      desc: "Enterprise LLM inference routed through Bifrost with strict JSON schema validation, controlled repair loops, and transparent error handling.",
    },
    {
      icon: ShieldCheck,
      title: "Granular Claim-Level Citations",
      desc: "Each included finding links to supplied source evidence. Uncertain dates, conflicts and missing details are surfaced for review.",
    },
    {
      icon: FileText,
      title: "True One-Page A4 Executive PDF",
      desc: "Designed for founders, VCs, and BD executives. Generates a clean, dense, printable one-page briefing with zero fluff.",
    },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Global AI Hackathon 2026 • Problem Statement 05 (Tavily + Bifrost)</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Walk into every meeting{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              informed.
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Turn the last 30 days of business intelligence into your next strategic advantage.
            An autonomous agent that generates source-attributed, one-page executive briefings
            before you enter the room.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/briefings/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Prepare Your Next Meeting</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium px-6 py-3.5 rounded-xl transition-all"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Explore Demo Briefings</span>
            </Link>
          </div>

          {/* Value Prop Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Real Tavily Web Search &amp; Extract</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span>Bifrost Inference Gateway</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span>Print-Ready One-Page PDF Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Diagram */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
            The Autonomous Engine
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            From Raw Calendar Input to Verifiable Intelligence
          </p>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Never sacrifice factual reliability for impressive-sounding AI output. Every step is
            structured, observable, and grounded in authentic primary sources.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">
                  STEP 0{idx + 1}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">{step.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${((idx + 1) / workflowSteps.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Architecture Highlights
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for High-Stakes Business Meetings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition-all space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sample Briefing Preview Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Sample Executive Briefing Preview</h2>
            <p className="text-xs text-slate-400">
              Explore how real-time intelligence is structured for instant pre-meeting ingestion.
            </p>
          </div>
          <Link
            href="/demo"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All Demo Scenarios</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                ARCHIVED EXAMPLE: MICROSOFT (COMPANY)
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Copilot and AI agent partnership discussion
              </h3>
            </div>
            <div className="text-xs text-slate-400">
              Research Window: <strong className="text-white">Mar 11–Apr 10, 2025</strong> • This is not live research
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400">
                Archived source-backed example · Apr 4, 2025
              </span>
              <h4 className="font-bold text-slate-100">
                Microsoft described an expanded Copilot experience
              </h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The official post described Memory, Deep Research, Copilot Search, Pages and additional actions, with availability varying by market and platform.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-400">
                Strategic Implication (Analysis)
              </span>
              <h4 className="font-bold text-slate-100">
                Confirm availability and enterprise controls
              </h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The post describes initial rollout plans; confirm which capabilities are available to the meeting’s target users today.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
            >
              <span>Inspect Full Briefing &amp; PDF</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
