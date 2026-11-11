import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redactSecrets } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const briefing = await prisma.briefing.findUnique({
      where: { id },
      select: { id: true, status: true, lastError: true, updatedAt: true, researchRuns: { orderBy: { startedAt: "asc" } } },
    });
    if (!briefing) return NextResponse.json({ error: "Briefing not found" }, { status: 404 });
    return NextResponse.json({
      id: briefing.id,
      status: briefing.status,
      error: briefing.lastError,
      updatedAt: briefing.updatedAt.toISOString(),
      stages: briefing.researchRuns.map((run) => ({
        stage: run.stage,
        status: run.status,
        startedAt: run.startedAt.toISOString(),
        completedAt: run.completedAt?.toISOString() || null,
        error: run.errorMessage,
        events: run.logsJson ? JSON.parse(run.logsJson) : [],
      })),
    });
  } catch (error) {
    console.error("GET briefing status error:", redactSecrets((error as Error).message));
    return NextResponse.json({ error: "Failed to retrieve briefing status" }, { status: 500 });
  }
}
