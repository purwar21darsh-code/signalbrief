import { SourceItem } from "@/types";

/** Transparent product ranking weights; these are relevance heuristics, not confidence. */
export const RELEVANCE_WEIGHTS = {
  entityMatch: 0.3,
  meetingRelevance: 0.25,
  recency: 0.2,
  sourceQuality: 0.15,
  evidenceCompleteness: 0.1,
} as const;

const PURPOSE_TERMS: Record<string, string[]> = {
  sales: ["customer", "sales", "pricing", "product", "customer", "enterprise"],
  partnership: ["partner", "partnership", "integration", "alliance", "ecosystem"],
  investment: ["funding", "revenue", "growth", "investor", "valuation", "ipo"],
  interview: ["leadership", "culture", "hiring", "role", "team", "strategy"],
  business_development: ["business", "market", "expansion", "growth", "partnership"],
  general: ["announcement", "launch", "leadership", "product", "strategy"],
};

function normalizedWords(value: string): Set<string> {
  return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter((word) => word.length > 2));
}

export function scoreSourceRelevance(
  source: SourceItem,
  entityName: string,
  meetingPurpose: string,
  window: { start: Date; end: Date }
): number {
  const content = `${source.title} ${source.extractedContent || ""}`;
  const words = normalizedWords(content);
  const entityTokens: string[] = [];
  normalizedWords(entityName).forEach((word) => entityTokens.push(word));
  const entityMatch = entityTokens.length
    ? entityTokens.filter((word) => words.has(word)).length / entityTokens.length
    : 0;
  const purposeTerms = PURPOSE_TERMS[meetingPurpose] || PURPOSE_TERMS.general;
  const meetingRelevance = purposeTerms.some((term) => words.has(term)) ? 1 : 0.25;
  const publishedAt = source.publicationDate && source.publicationDate !== "unknown"
    ? new Date(source.publicationDate)
    : null;
  const recency = publishedAt && !Number.isNaN(publishedAt.getTime()) && publishedAt >= window.start && publishedAt <= window.end
    ? 1
    : 0;
  const sourceQuality = Math.max(0, Math.min(1, source.credibilityScore));
  const evidenceCompleteness = Math.min(1, (source.extractedContent?.length || 0) / 1200);

  return Number((
    entityMatch * RELEVANCE_WEIGHTS.entityMatch +
    meetingRelevance * RELEVANCE_WEIGHTS.meetingRelevance +
    recency * RELEVANCE_WEIGHTS.recency +
    sourceQuality * RELEVANCE_WEIGHTS.sourceQuality +
    evidenceCompleteness * RELEVANCE_WEIGHTS.evidenceCompleteness
  ).toFixed(4));
}
