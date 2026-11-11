import { NextRequest } from "next/server";

const buckets = new Map<string, { count: number; resetsAt: number }>();

export function checkRateLimit(request: NextRequest, action: string, limit: number, windowMs: number) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client = request.headers.get("x-real-ip") || forwarded || "unknown";
  const key = `${action}:${client}`;
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetsAt - now) / 1000)) };
  }
  current.count += 1;
  if (buckets.size > 5000) {
    buckets.forEach((bucket, bucketKey) => {
      if (bucket.resetsAt <= now) buckets.delete(bucketKey);
    });
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function redactSecrets(message: string): string {
  let safe = message;
  for (const secret of [process.env.TAVILY_API_KEY, process.env.BIFROST_API_KEY]) {
    if (secret) safe = safe.replaceAll(secret, "[REDACTED]");
  }
  return safe.replace(/(https?:\/\/[^:/\s]+:)[^@/\s]+@/gi, "$1[REDACTED]@").slice(0, 1000);
}
