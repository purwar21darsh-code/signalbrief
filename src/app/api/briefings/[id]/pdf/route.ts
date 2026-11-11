import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateBriefingPdf } from "@/lib/export/pdf";
import { BriefingFull } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let briefingId = "unknown";
  try {
    const { id } = await params;
    briefingId = id;

    const briefing = await prisma.briefing.findUnique({
      where: { id },
      include: {
        meeting: true,
        sources: true,
        claims: {
          include: { claimSources: true },
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
    } catch (e) {
      // ignore
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

    const pdfBuffer = await generateBriefingPdf(fullBriefing);
    const filename = `SignalBrief_${briefing.meeting.entityName.replace(/[^a-zA-Z0-9]/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error(`GET /api/briefings/${briefingId}/pdf error:`, err);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: (err as Error).message },
      { status: 500 }
    );
  }
}
