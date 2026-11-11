import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BriefingFull } from "@/types";
import { redactSecrets } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const briefing = await prisma.briefing.findUnique({
      where: { id },
      include: {
        meeting: true,
        sources: {
          orderBy: { credibilityScore: "desc" },
        },
        claims: {
          include: {
            claimSources: {
              include: { source: true },
            },
          },
        },
      },
    });

    if (!briefing) {
      return NextResponse.json({ error: "Briefing not found" }, { status: 404 });
    }

    let developments = [];
    let implications = [];
    let questions = [];
    let watchlist = [];

    try {
      if (briefing.findingsJson) developments = JSON.parse(briefing.findingsJson);
      if (briefing.implicationsJson) implications = JSON.parse(briefing.implicationsJson);
      if (briefing.questionsJson) questions = JSON.parse(briefing.questionsJson);
      if (briefing.watchlistJson) watchlist = JSON.parse(briefing.watchlistJson);
    } catch (parseErr) {
      console.warn("JSON parse warning for briefing sections:", parseErr);
    }

    const fullBriefing: BriefingFull = {
      id: briefing.id,
      meetingId: briefing.meetingId,
      meeting: {
        id: briefing.meeting.id,
        entityName: briefing.meeting.entityName,
        entityType: briefing.meeting.entityType as any,
        meetingDateTime: briefing.meeting.meetingDateTime.toISOString(),
        timezone: briefing.meeting.timezone,
        meetingPurpose: briefing.meeting.meetingPurpose as any,
        objective: briefing.meeting.objective,
        additionalContext: briefing.meeting.additionalContext,
      },
      status: briefing.status as any,
      lastError: briefing.lastError,
      isDemo: briefing.isDemo,
      executiveSummary: briefing.executiveSummary,
      developments,
      implications,
      questions,
      watchlist,
      sources: briefing.sources.map((s) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        domain: s.domain,
        publicationDate: s.publicationDate || "unknown",
        extractedContent: s.extractedContent || undefined,
        sourceType: s.sourceType as any,
        credibilityScore: s.credibilityScore,
        searchScore: s.searchScore ?? undefined,
        relevanceScore: s.relevanceScore ?? undefined,
        searchQuery: s.searchQuery || undefined,
        searchAngle: s.searchAngle || undefined,
      })),
      claims: briefing.claims.map((c) => ({
        id: c.id,
        text: c.text,
        eventDate: c.eventDate || "unknown",
        verificationStatus: c.verificationStatus as any,
        confidenceLevel: c.confidenceLevel as any,
        reasoning: c.reasoning || "",
        sourceIds: c.claimSources.map((cs) => cs.sourceId),
      })),
      researchWindowStart: briefing.researchWindowStart.toISOString(),
      researchWindowEnd: briefing.researchWindowEnd.toISOString(),
      generatedAt: briefing.generatedAt?.toISOString() || null,
      wordCount: briefing.wordCount,
      qualityScore: briefing.qualityScore,
      createdAt: briefing.createdAt.toISOString(),
    };

    return NextResponse.json(fullBriefing);
  } catch (err) {
    console.error("GET briefing error:", redactSecrets((err as Error).message));
    return NextResponse.json(
      { error: "Failed to retrieve briefing" },
      { status: 500 }
    );
  }
}
