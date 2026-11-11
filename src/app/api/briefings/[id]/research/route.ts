import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { researchOrchestrator } from "@/lib/pipeline/orchestrator";
import { StageEvent } from "@/types";
import { checkRateLimit, redactSecrets } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

/** Reconnect to persisted events when a browser reconnects or React remounts during a run. */
function streamExistingRun(id: string, request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const seen = new Set<string>();
      try {
        while (!request.signal.aborted) {
          const current = await prisma.briefing.findUnique({
            where: { id },
            select: { status: true, lastError: true, researchRuns: { orderBy: { startedAt: "asc" } } },
          });
          if (!current) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: true, message: "Briefing not found" })}\n\n`));
            break;
          }

          for (const run of current.researchRuns) {
            let events: StageEvent[] = [];
            try { events = run.logsJson ? JSON.parse(run.logsJson) : []; } catch { /* ignore malformed historical event JSON */ }
            for (const event of events) {
              const key = `${event.stage}|${event.timestamp}|${event.status}|${event.message}`;
              if (seen.has(key)) continue;
              seen.add(key);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            }
          }

          if (current.status === "completed") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, briefingId: id })}\n\n`));
            break;
          }
          if (current.status === "failed") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: true, message: current.lastError || "Research failed. Retry the briefing." })}\n\n`));
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        if (!request.signal.aborted) console.error("Research event replay failed:", redactSecrets((error as Error).message));
      } finally {
        try { controller.close(); } catch { /* stream may already be closed */ }
      }
    },
  });
  return new Response(stream, { headers: sseHeaders() });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rate = checkRateLimit(req, "research-stream", 5, 10 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Too many research requests. Try again shortly." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });

  const briefing = await prisma.briefing.findUnique({
    where: { id },
    include: { meeting: true },
  });

  if (!briefing) {
    return NextResponse.json({ error: "Briefing not found" }, { status: 404 });
  }

  const started = await prisma.briefing.updateMany({
    where: { id, status: { not: "researching" } },
    data: { status: "researching", lastError: null },
  });
  if (!started.count) {
    const current = await prisma.briefing.findUnique({ where: { id }, select: { status: true } });
    if (current?.status === "researching") return streamExistingRun(id, req);
    return NextResponse.json({ error: "Research is already running for this briefing." }, { status: 409 });
  }

  // Create ReadableStream for Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: StageEvent) => {
        const payload = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      try {
        const stageRuns = new Map<string, string>();
        const completedBriefing = await researchOrchestrator.executePipeline(
          briefing.meetingId,
          {
            entityName: briefing.meeting.entityName,
            entityType: briefing.meeting.entityType as any,
            meetingDateTime: briefing.meeting.meetingDateTime.toISOString(),
            timezone: briefing.meeting.timezone,
            meetingPurpose: briefing.meeting.meetingPurpose as any,
            objective: briefing.meeting.objective || undefined,
            additionalContext: briefing.meeting.additionalContext || undefined,
            isDemo: briefing.isDemo,
          },
          async (stageEvent: StageEvent) => {
            sendEvent(stageEvent);
            try {
              const runId = stageRuns.get(stageEvent.stage);
              if (!runId) {
                const run = await prisma.researchRun.create({
                  data: {
                    briefingId: id,
                    stage: stageEvent.stage,
                    status: stageEvent.status === "failed" ? "failed" : stageEvent.status === "running" ? "in_progress" : "completed",
                    logsJson: JSON.stringify([stageEvent]),
                    completedAt: stageEvent.status === "running" ? null : new Date(stageEvent.timestamp),
                  },
                });
                stageRuns.set(stageEvent.stage, run.id);
              } else {
                const run = await prisma.researchRun.findUnique({ where: { id: runId } });
                const logs = run?.logsJson ? JSON.parse(run.logsJson) : [];
                await prisma.researchRun.update({
                  where: { id: runId },
                  data: {
                    status: stageEvent.status === "failed" ? "failed" : stageEvent.status === "running" ? "in_progress" : "completed",
                    logsJson: JSON.stringify([...logs, stageEvent]),
                    completedAt: stageEvent.status === "running" ? null : new Date(stageEvent.timestamp),
                    errorMessage: stageEvent.status === "failed" ? redactSecrets(stageEvent.message) : null,
                  },
                });
              }
            } catch (progressError) {
              console.warn("Could not persist research stage event:", redactSecrets((progressError as Error).message));
            }
          }
        );

        // Final completion event
        const donePayload = `data: ${JSON.stringify({
          done: true,
          briefingId: completedBriefing.id,
          briefing: completedBriefing,
        })}\n\n`;
        controller.enqueue(encoder.encode(donePayload));
        controller.close();
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        console.error("Streaming research pipeline failed:", redactSecrets(errMessage));

        await prisma.briefing.update({
          where: { id },
          data: { status: "failed", lastError: redactSecrets(errMessage) },
        }).catch(() => {});

        const errorPayload = `data: ${JSON.stringify({
          error: true,
          message: redactSecrets(errMessage),
        })}\n\n`;
        controller.enqueue(encoder.encode(errorPayload));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rate = checkRateLimit(req, "run-research", 5, 10 * 60 * 1000);
    if (!rate.allowed) return NextResponse.json({ error: "Too many research requests. Try again shortly." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });

    const briefing = await prisma.briefing.findUnique({
      where: { id },
      include: { meeting: true },
    });

    if (!briefing) {
      return NextResponse.json({ error: "Briefing not found" }, { status: 404 });
    }

    const started = await prisma.briefing.updateMany({
      where: { id, status: { not: "researching" } },
      data: { status: "researching", lastError: null },
    });
    if (!started.count) return NextResponse.json({ error: "Research is already running for this briefing." }, { status: 409 });

    const result = await researchOrchestrator.executePipeline(briefing.meetingId, {
      entityName: briefing.meeting.entityName,
      entityType: briefing.meeting.entityType as any,
      meetingDateTime: briefing.meeting.meetingDateTime.toISOString(),
      timezone: briefing.meeting.timezone,
      meetingPurpose: briefing.meeting.meetingPurpose as any,
      objective: briefing.meeting.objective || undefined,
      additionalContext: briefing.meeting.additionalContext || undefined,
      isDemo: briefing.isDemo,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = redactSecrets((err as Error).message);
    console.error("POST /api/briefings/[id]/research error:", message);
    await prisma.briefing.update({ where: { id }, data: { status: "failed", lastError: message } }).catch(() => {});
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
