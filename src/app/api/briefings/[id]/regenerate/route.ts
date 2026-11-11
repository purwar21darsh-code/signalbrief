import { NextRequest } from "next/server";
import { POST as startResearch } from "../research/route";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return startResearch(request, context);
}
