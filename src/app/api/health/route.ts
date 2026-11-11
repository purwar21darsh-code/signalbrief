import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tavilyService } from "@/lib/research/tavily";
import { bifrostService } from "@/lib/ai/bifrost";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unhealthy";
  let briefingCount = 0;

  try {
    briefingCount = await prisma.briefing.count();
    dbStatus = "healthy";
  } catch (dbErr) {
    dbStatus = `error: ${(dbErr as Error).message}`;
  }

  const tavilyConfigured = tavilyService.isConfigured();
  const bifrostConfig = bifrostService.getConfig();

  return NextResponse.json({
    status: dbStatus === "healthy" ? "ok" : "degraded",
    app: "SignalBrief - Evidence-First Meeting Intelligence Agent",
    version: "1.0.0",
    hackathon: "Global AI Hackathon 2026 | Problem Statement 05",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    integrations: {
      tavily: {
        configured: tavilyConfigured,
        provider: "Tavily AI Search & Extract Engine",
        status: tavilyConfigured ? "key_configured" : "missing_key",
        endpoints: ["https://api.tavily.com/search", "https://api.tavily.com/extract"],
        usage: tavilyService.getUsage(),
      },
      bifrost: {
        configured: bifrostService.isConfigured(),
        provider: "Bifrost by Maxim AI",
        model: bifrostConfig.model,
        interface: "OpenAI-compatible inference gateway",
      },
      database: {
        status: dbStatus,
        totalBriefings: briefingCount,
      },
    },
  }, { status: dbStatus === "healthy" ? 200 : 503 });
}
