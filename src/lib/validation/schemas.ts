import { z } from "zod";

export const MeetingPurposeEnum = z.enum([
  "sales",
  "partnership",
  "investment",
  "interview",
  "business_development",
  "general",
]);

export const EntityTypeEnum = z.enum(["company", "person"]);

export const CreateMeetingSchema = z.object({
  entityName: z
    .string()
    .trim()
    .min(2, "Entity name must be at least 2 characters")
    .max(120, "Entity name must be under 120 characters"),
  entityType: EntityTypeEnum.default("company"),
  meetingDateTime: z.string().datetime({ offset: true, message: "Meeting date and time must include a timezone offset." }),
  timezone: z.string().min(1).default("UTC").refine((timezone) => {
    try { new Intl.DateTimeFormat("en", { timeZone: timezone }); return true; } catch { return false; }
  }, "Timezone must be a valid IANA timezone."),
  meetingPurpose: MeetingPurposeEnum.default("general"),
  objective: z.string().max(1000).optional().nullable(),
  additionalContext: z.string().max(2000).optional().nullable(),
  isDemo: z.boolean().optional().default(false),
});

export type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>;

// Research Plan from LLM
export const ResearchQueryPlanSchema = z.object({
  category: z.string(),
  query: z.string(),
  angle: z.string(),
  rationale: z.string(),
});

export const ResearchPlanSchema = z.object({
  resolvedEntity: z.string(),
  entityType: EntityTypeEnum,
  isAmbiguous: z.boolean(),
  ambiguityNote: z.string().optional(),
  queries: z.array(ResearchQueryPlanSchema).min(4).max(8),
});

export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;

// Evidence Claim from LLM
export const ClaimExtractionItemSchema = z.object({
  text: z.string(),
  eventDate: z.string().default("unknown"),
  verificationStatus: z.enum(["verified", "disputed", "uncertain"]).default("uncertain"),
  confidenceLevel: z.enum(["high", "medium", "low"]).default("low"),
  reasoning: z.string(),
  relevanceReason: z.string().default(""),
  sourceUrls: z.array(z.string()).min(1),
  category: z.enum(["product", "leadership", "partnership", "financial", "regulatory", "other"]).default("other"),
});

export const EvidenceExtractionOutputSchema = z.object({
  claims: z.array(ClaimExtractionItemSchema),
  identifiedContradictions: z.array(
    z.object({
      topic: z.string(),
      explanation: z.string(),
      involvedUrls: z.array(z.string()),
    })
  ).default([]),
});

export type EvidenceExtractionOutput = z.infer<typeof EvidenceExtractionOutputSchema>;

// Final Structured Briefing Output Schema from Bifrost
export const BriefingDevelopmentSchema = z.object({
  id: z.string().optional(),
  eventDate: z.string(),
  headline: z.string(),
  whatHappened: z.string(),
  whyItMatters: z.string(),
  verificationStatus: z.enum(["verified", "disputed", "uncertain"]).default("uncertain"),
  confidence: z.enum(["high", "medium", "low"]).default("low"),
  sourceUrls: z.array(z.string()).min(1),
  category: z.enum(["product", "leadership", "partnership", "financial", "regulatory", "other"]).default("other"),
});

export const StrategicImplicationSchema = z.object({
  id: z.string().optional(),
  area: z.string(),
  implication: z.string(),
  strategicContext: z.string(),
  isFactOrAnalysis: z.enum(["analysis", "fact"]).default("analysis"),
  relatedClaimIndices: z.array(z.number()).optional().default([]),
});

export const TargetedQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  context: z.string(),
  targetObjective: z.string(),
  referencedDevelopmentIndex: z.number().optional(),
});

export const WatchlistItemSchema = z.object({
  id: z.string().optional(),
  topic: z.string(),
  concern: z.string(),
  type: z.enum(["uncertainty", "missing_info", "contradiction", "monitor_item"]),
  suggestedAction: z.string().optional(),
});

export const FinalBriefingGenerationSchema = z.object({
  executiveSnapshot: z.string().min(50),
  developments: z.array(BriefingDevelopmentSchema).max(8),
  implications: z.array(StrategicImplicationSchema).max(6),
  questions: z.array(TargetedQuestionSchema).min(4).max(6),
  watchlist: z.array(WatchlistItemSchema).max(6),
});

export type FinalBriefingGeneration = z.infer<typeof FinalBriefingGenerationSchema>;

// Tavily API response structures
export const TavilySearchResultItemSchema = z.object({
  title: z.string().default("Untitled Source"),
  url: z.string().url(),
  content: z.string().default(""),
  score: z.number().optional().default(0),
  published_date: z.string().optional().nullable(),
  raw_content: z.string().optional().nullable(),
});

export const TavilySearchResponseSchema = z.object({
  query: z.string().optional(),
  results: z.array(TavilySearchResultItemSchema).default([]),
  answer: z.string().optional().nullable(),
  response_time: z.number().optional(),
});

export const TavilyExtractResultItemSchema = z.object({
  url: z.string(),
  raw_content: z.string().default(""),
});

export const TavilyExtractResponseSchema = z.object({
  results: z.array(TavilyExtractResultItemSchema).default([]),
  failed_results: z
    .array(
      z.object({
        url: z.string(),
        error: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});
