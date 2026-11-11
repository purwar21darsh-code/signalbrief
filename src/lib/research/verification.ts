import { SourceItem } from "@/types";
import { normalizeSourceUrl } from "@/lib/utils";

export interface CitationMapping {
  sources: SourceItem[];
  rejectedUrls: string[];
}

/** Map model-provided citation URLs only to the exact safe source set supplied to it. */
export function mapSourceUrlsToSources(urls: string[], allowedSources: SourceItem[]): CitationMapping {
  const allowedByUrl = new Map<string, SourceItem>();
  allowedSources.forEach((source) => {
    const key = normalizeSourceUrl(source.url);
    if (key && !allowedByUrl.has(key)) allowedByUrl.set(key, source);
  });

  const matchedById = new Map<string, SourceItem>();
  const rejectedUrls: string[] = [];
  urls.forEach((candidate) => {
    const key = normalizeSourceUrl(candidate);
    const source = key ? allowedByUrl.get(key) : undefined;
    if (source) matchedById.set(source.id, source);
    else rejectedUrls.push(candidate);
  });

  return { sources: Array.from(matchedById.values()), rejectedUrls };
}
