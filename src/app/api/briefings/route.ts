import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateMeetingSchema } from "@/lib/validation/schemas";
import { calculateResearchWindow } from "@/lib/utils";
import { checkRateLimit, redactSecrets } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsedLimit = Number(searchParams.get("limit") || 20);
    const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 50)) : 20;

    const briefings = await prisma.briefing.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        meeting: true,
        sources: {
          select: { id: true, title: true, domain: true, publicationDate: true },
        },
        claims: {
          select: { id: true, verificationStatus: true, confidenceLevel: true },
        },
      },
    });

    const formatted = briefings.map((b) => {
      let findingsCount = 0;
      try {
        if (b.findingsJson) findingsCount = JSON.parse(b.findingsJson).length;
      } catch (e) {
        // ignore
      }

      return {
        id: b.id,
        meetingId: b.meetingId,
        entityName: b.meeting.entityName,
        entityType: b.meeting.entityType,
        meetingDateTime: b.meeting.meetingDateTime,
        meetingPurpose: b.meeting.meetingPurpose,
        status: b.status,
        isDemo: b.isDemo,
        findingsCount,
        sourcesCount: b.sources.length,
        claimsCount: b.claims.length,
        createdAt: b.createdAt,
      };
    });

    return NextResponse.json({ briefings: formatted });
  } catch (err) {
    console.error("GET /api/briefings error:", redactSecrets((err as Error).message));
    return NextResponse.json(
      { error: "Failed to retrieve briefings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, "create-briefing", 10, 10 * 60 * 1000);
    if (!rate.allowed) return NextResponse.json({ error: "Too many briefing requests. Try again shortly." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });

    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > 16_384) {
      return NextResponse.json({ error: "Request body exceeds the 16 KB limit." }, { status: 413 });
    }
    let body: unknown;
    try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
    const validation = CreateMeetingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid meeting parameters", details: validation.error.format() },
        { status: 400 }
      );
    }

    const input = validation.data;
    const windowInfo = calculateResearchWindow(input.meetingDateTime);

    // Create Meeting record
    const { meeting, briefing } = await prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.create({
        data: {
          entityName: input.entityName,
          entityType: input.entityType,
          meetingDateTime: new Date(input.meetingDateTime),
          timezone: input.timezone,
          meetingPurpose: input.meetingPurpose,
          objective: input.objective || null,
          additionalContext: input.additionalContext || null,
        },
      });
      const briefing = await tx.briefing.create({
        data: { meetingId: meeting.id, status: "pending", isDemo: Boolean(input.isDemo), researchWindowStart: windowInfo.start, researchWindowEnd: windowInfo.end },
      });
      return { meeting, briefing };
    });

    return NextResponse.json(
      {
        meeting,
        briefing,
        researchWindow: {
          start: windowInfo.start.toISOString(),
          end: windowInfo.end.toISOString(),
          isFutureMeeting: windowInfo.isFutureMeeting,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/briefings error:", redactSecrets((err as Error).message));
    return NextResponse.json(
      { error: "Failed to create briefing. Check the server logs for configuration details." },
      { status: 500 }
    );
  }
}
