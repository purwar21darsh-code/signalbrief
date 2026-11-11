import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subDays, isAfter, format, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates dynamic 30-day date window.
 * The report calculates its research window using the scheduled meeting date,
 * while never claiming knowledge of future publications.
 * For a future meeting, capped at actual research generation time.
 */
export function calculateResearchWindow(
  meetingDateTimeStr: string,
  now: Date = new Date()
): { start: Date; end: Date; isFutureMeeting: boolean; windowDays: number } {
  const meetingDate = parseISO(meetingDateTimeStr);
  if (!isValid(meetingDate)) {
    throw new RangeError("Meeting date and time must be a valid ISO 8601 timestamp.");
  }
  if (!isValid(now)) throw new RangeError("Research generation time is invalid.");

  const isFutureMeeting = isAfter(meetingDate, now);
  // Cap available evidence at actual research generation time
  const effectiveEnd = isFutureMeeting ? now : meetingDate;
  const effectiveStart = subDays(effectiveEnd, 30);

  return {
    start: effectiveStart,
    end: effectiveEnd,
    isFutureMeeting,
    windowDays: 30,
  };
}

export function formatDateSafe(
  dateInput: string | Date | undefined | null,
  formatPattern: string = "MMM d, yyyy"
): string {
  if (!dateInput) return "Unknown";
  try {
    const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) {
      const fallback = new Date(dateInput);
      if (isValid(fallback)) return format(fallback, formatPattern);
      return String(dateInput);
    }
    return format(d, formatPattern);
  } catch {
    return String(dateInput);
  }
}

export function getDomainFromUrl(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return urlString.split("/")[2] || urlString;
  }
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function sanitizeText(text: string): string {
  if (!text) return "";
  // Strip control characters while preserving standard whitespace
  return text.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "").trim();
}

export function deduplicateUrls<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const results: T[] = [];

  for (const item of items) {
    if (!item.url) continue;
    try {
      const parsed = new URL(item.url);
      // Normalize URL: remove trailing slash, lowercase host, strip common tracking params
      parsed.hash = "";
      parsed.searchParams.delete("utm_source");
      parsed.searchParams.delete("utm_medium");
      parsed.searchParams.delete("utm_campaign");
      parsed.searchParams.delete("utm_term");
      parsed.searchParams.delete("utm_content");
      parsed.searchParams.delete("ref");
      const normalized = parsed.toString().replace(/\/$/, "");

      if (!seen.has(normalized)) {
        seen.add(normalized);
        results.push(item);
      }
    } catch {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        results.push(item);
      }
    }
  }

  return results;
}

/** Canonical URL key used only for source identity and citation mapping. */
export function normalizeSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (
      hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") ||
      hostname.endsWith(".internal") || hostname.endsWith(".test") || hostname.includes(":")
    ) return null;
    const ipv4 = hostname.split(".").map(Number);
    if (ipv4.length === 4 && ipv4.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)) {
      const [a, b] = ipv4;
      if (a === 0 || a === 10 || a === 127 || a === 169 && b === 254 || a === 192 && b === 168 || a === 172 && b >= 16 && b <= 31) return null;
    }
    if (url.port && url.port !== "443") return null;
    url.hash = "";
    const keysToDelete: string[] = [];
    url.searchParams.forEach((_value, key) => {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|ref$)/i.test(key)) keysToDelete.push(key);
    });
    keysToDelete.forEach((key) => url.searchParams.delete(key));
    url.hostname = url.hostname.toLowerCase();
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function isDateWithinWindow(value: string, start: Date, end: Date): boolean {
  if (!value || value.toLowerCase() === "unknown") return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = value.slice(0, 10);
    return date >= start.toISOString().slice(0, 10) && date <= end.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  return isValid(parsed) && parsed >= start && parsed <= end;
}
