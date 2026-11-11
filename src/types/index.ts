export type EntityType = "company" | "person";

export type MeetingPurpose =
  | "sales"
  | "partnership"
  | "investment"
  | "interview"
  | "business_development"
  | "general";

export interface MeetingInput {
  entityName: string;
  entityType?: EntityType;
  meetingDateTime: string; // ISO string or YYYY-MM-DDTHH:mm
  timezone: string;
  meetingPurpose: MeetingPurpose;
  objective?: string;
  additionalContext?: string;
  isDemo?: boolean;
}

export type PipelineStage =
  | "NORMALIZATION"
  | "ENTITY_IDENTIFICATION"
  | "RESEARCH_PLANNING"
  | "WEB_RESEARCH"
  | "CONTENT_EXTRACTION"
  | "EVIDENCE_PROCESSING"
  | "CLAIM_VERIFICATION"
  | "MEETING_INTELLIGENCE"
  | "BRIEFING_GENERATION"
  | "QUALITY_CHECK";

export type StageStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface StageEvent {
  stage: PipelineStage;
  status: StageStatus;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  progressPercent?: number;
}

export type SourceType =
  | "company_announcement"
  | "press_release"
  | "news"
  | "regulatory"
  | "interview"
  | "other";

export interface SourceItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  publicationDate: string; // YYYY-MM-DD or "unknown"
  extractedContent?: string;
  sourceType: SourceType;
  credibilityScore: number; // 0 to 1
  searchScore?: number;
  relevanceScore?: number;
  searchQuery?: string;
  searchAngle?: string;
}

export type ClaimVerificationStatus = "verified" | "disputed" | "uncertain";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface ClaimItem {
  id: string;
  text: string;
  eventDate?: string; // YYYY-MM-DD or "unknown"
  verificationStatus: ClaimVerificationStatus;
  confidenceLevel: ConfidenceLevel;
  reasoning: string;
  relevanceReason?: string;
  sourceIds: string[];
}

export interface FindingDevelopment {
  id: string;
  eventDate: string;
  headline: string;
  whatHappened: string;
  whyItMatters: string;
  verificationStatus: ClaimVerificationStatus;
  confidence: ConfidenceLevel;
  sourceIds: string[];
  category: "product" | "leadership" | "partnership" | "financial" | "regulatory" | "other";
}

export interface StrategicImplication {
  id: string;
  area: string;
  implication: string;
  strategicContext: string;
  isFactOrAnalysis: "analysis" | "fact";
  relatedFindingIds: string[];
}

export interface TargetedQuestion {
  id: string;
  question: string;
  context: string;
  targetObjective: string;
  referencedFindingIds?: string[];
}

export interface WatchlistItem {
  id: string;
  topic: string;
  concern: string;
  type: "uncertainty" | "missing_info" | "contradiction" | "monitor_item";
  suggestedAction?: string;
}

export interface BriefingContent {
  executiveSnapshot: string;
  developments: FindingDevelopment[];
  implications: StrategicImplication[];
  questions: TargetedQuestion[];
  watchlist: WatchlistItem[];
  wordCount: number;
}

export interface QualityReport {
  dateWindowValid: boolean;
  claimsAttributedCount: number;
  totalClaimsCount: number;
  citationCompletenessPercent: number;
  wordCount: number;
  withinLengthLimits: boolean;
  warnings: string[];
  qualityScore: number;
}

export interface BriefingFull {
  id: string;
  meetingId: string;
  meeting: {
    id: string;
    entityName: string;
    entityType: EntityType;
    meetingDateTime: string;
    timezone: string;
    meetingPurpose: MeetingPurpose;
    objective?: string | null;
    additionalContext?: string | null;
  };
  status: "pending" | "researching" | "completed" | "failed";
  lastError?: string | null;
  isDemo: boolean;
  executiveSummary?: string | null;
  developments: FindingDevelopment[];
  implications: StrategicImplication[];
  questions: TargetedQuestion[];
  watchlist: WatchlistItem[];
  sources: SourceItem[];
  claims: ClaimItem[];
  researchWindowStart: string;
  researchWindowEnd: string;
  generatedAt?: string | null;
  wordCount?: number | null;
  qualityScore?: number | null;
  createdAt: string;
}
