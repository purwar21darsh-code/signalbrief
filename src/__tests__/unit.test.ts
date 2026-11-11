import { describe, it, expect } from "vitest";
import {
  calculateResearchWindow,
  deduplicateUrls,
  getDomainFromUrl,
  countWords,
  formatDateSafe,
  isDateWithinWindow,
  normalizeSourceUrl,
} from "../lib/utils";
import { scoreSourceRelevance } from "../lib/research/ranking";
import {
  CreateMeetingSchema,
  ResearchPlanSchema,
  EvidenceExtractionOutputSchema,
  FinalBriefingGenerationSchema,
} from "../lib/validation/schemas";
import { mapSourceUrlsToSources } from "../lib/research/verification";
import { generateBriefingPdf } from "../lib/export/pdf";
import { DEMO_PRESETS } from "../lib/demo/sample-data";
import { BriefingFull } from "../types";

describe("SignalBrief Intelligence Engine - Unit Tests", () => {
  describe("Date Window Calculation", () => {
    it("should cap future meetings at actual research generation time", () => {
      const fixedNow = new Date("2026-11-11T12:00:00.000Z");
      const futureMeeting = "2026-11-25T15:00:00.000Z";

      const window = calculateResearchWindow(futureMeeting, fixedNow);

      expect(window.isFutureMeeting).toBe(true);
      expect(window.end.toISOString()).toBe(fixedNow.toISOString());
      // 30 days before Nov 11 is Oct 12
      expect(window.start.toISOString()).toBe(
        new Date("2026-10-12T12:00:00.000Z").toISOString()
      );
      expect(window.windowDays).toBe(30);
    });

    it("should calculate 30 days prior for past or current meetings", () => {
      const fixedNow = new Date("2026-11-11T12:00:00.000Z");
      const pastMeeting = "2026-11-01T10:00:00.000Z";

      const window = calculateResearchWindow(pastMeeting, fixedNow);

      expect(window.isFutureMeeting).toBe(false);
      expect(window.end.toISOString()).toBe(new Date(pastMeeting).toISOString());
      expect(window.start.toISOString()).toBe(
        new Date("2026-10-02T10:00:00.000Z").toISOString()
      );
    });

    it("should reject invalid timestamps instead of substituting today's date", () => {
      expect(() => calculateResearchWindow("invalid-date-string", new Date("2026-11-11T12:00:00.000Z"))).toThrow(/valid ISO 8601/);
    });

    it("should cap date-only publication dates to the research window's UTC calendar dates", () => {
      expect(isDateWithinWindow("2026-10-12", new Date("2026-10-12T12:00:00Z"), new Date("2026-11-11T12:00:00Z"))).toBe(true);
      expect(isDateWithinWindow("2026-10-11", new Date("2026-10-12T12:00:00Z"), new Date("2026-11-11T12:00:00Z"))).toBe(false);
    });
  });

  describe("URL Deduplication & Normalization", () => {
    it("should deduplicate URLs and strip tracking query parameters", () => {
      const input = [
        { url: "https://stripe.com/newsroom/news?utm_source=twitter&utm_medium=social" },
        { url: "https://stripe.com/newsroom/news/" },
        { url: "https://stripe.com/newsroom/news#section" },
        { url: "https://techcrunch.com/article-1" },
      ];

      const deduplicated = deduplicateUrls(input);
      expect(deduplicated.length).toBe(2);
      expect(deduplicated[0].url).toContain("stripe.com/newsroom/news");
      expect(deduplicated[1].url).toContain("techcrunch.com/article-1");
    });

    it("should extract domains correctly", () => {
      expect(getDomainFromUrl("https://www.reuters.com/business/finance/article")).toBe(
        "reuters.com"
      );
      expect(getDomainFromUrl("https://blog.databricks.com/post-1")).toBe("blog.databricks.com");
    });

    it("should canonicalize safe HTTPS citation URLs and reject unsafe schemes", () => {
      expect(normalizeSourceUrl("https://www.example.com/story/?utm_source=x#top")).toBe("https://www.example.com/story");
      expect(normalizeSourceUrl("javascript:alert(1)")).toBeNull();
      expect(normalizeSourceUrl("http://example.com/story")).toBeNull();
      expect(normalizeSourceUrl("https://127.0.0.1/private")).toBeNull();
      expect(normalizeSourceUrl("https://service.local/internal")).toBeNull();
    });

    it("should map citations only to safe supplied sources and reject unknown URLs", () => {
      const source = { id: "source-1", title: "A story", url: "https://www.example.com/story", domain: "example.com", publicationDate: "2026-11-01", sourceType: "news" as const, credibilityScore: 0.7 };
      const result = mapSourceUrlsToSources([
        "https://www.example.com/story?utm_source=newsletter#top",
        "https://other.example.net/unseen",
        "javascript:alert(1)",
      ], [source]);
      expect(result.sources.map((item) => item.id)).toEqual(["source-1"]);
      expect(result.rejectedUrls).toHaveLength(2);
    });

    it("should keep source relevance separate from factual confidence", () => {
      const score = scoreSourceRelevance({
        id: "source-1", title: "Microsoft announces new partnership integration", url: "https://microsoft.com/news", domain: "microsoft.com", publicationDate: "2026-11-01", extractedContent: "Microsoft product partnership integration news", sourceType: "company_announcement", credibilityScore: 0.98,
      }, "Microsoft", "partnership", { start: new Date("2026-10-12"), end: new Date("2026-11-11") });
      expect(score).toBeGreaterThan(0.8);
      expect(score).toBeLessThanOrEqual(1);
    });

    it("should count words accurately", () => {
      expect(countWords("The quick brown fox jumps over the lazy dog.")).toBe(9);
      expect(countWords("")).toBe(0);
      expect(countWords("   Multiple    spaces   between   words.  ")).toBe(4);
    });
  });

  describe("Zod Validation Schemas", () => {
    it("should validate a valid meeting creation input", () => {
      const valid = {
        entityName: "Stripe",
        entityType: "company",
        meetingDateTime: "2026-11-20T10:00:00.000Z",
        timezone: "America/New_York",
        meetingPurpose: "partnership",
        objective: "Discuss agentic commerce integration",
      };

      const result = CreateMeetingSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.entityName).toBe("Stripe");
    });

    it("should reject invalid meeting creation input with too short entity name", () => {
      const invalid = {
        entityName: "A",
        meetingDateTime: "2026-11-20T10:00:00.000Z",
      };

      const result = CreateMeetingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 2 characters");
      }
    });

    it("should validate a research plan schema", () => {
      const plan = {
        resolvedEntity: "Stripe, Inc.",
        entityType: "company",
        isAmbiguous: false,
        queries: [
          {
            category: "product",
            query: "Stripe product launches 2026",
            angle: "Product launches",
            rationale: "Capture new features",
          },
          {
            category: "leadership",
            query: "Stripe executive hires 2026",
            angle: "Leadership",
            rationale: "Track team changes",
          },
          {
            category: "partnerships",
            query: "Stripe partnerships acquisitions 2026",
            angle: "Partnerships",
            rationale: "Commercial deals",
          },
          {
            category: "announcements",
            query: "Stripe recent official announcements",
            angle: "Company announcements",
            rationale: "Capture primary sources",
          },
        ],
      };

      const result = ResearchPlanSchema.safeParse(plan);
      expect(result.success).toBe(true);
    });

    it("defaults missing model confidence to uncertain and requires claim citations", () => {
      const output = EvidenceExtractionOutputSchema.safeParse({
        claims: [{ text: "A dated company announcement", eventDate: "2026-11-01", reasoning: "The supplied source says this." }],
      });
      expect(output.success).toBe(false);

      const cited = EvidenceExtractionOutputSchema.safeParse({
        claims: [{ text: "A dated company announcement", eventDate: "2026-11-01", reasoning: "The supplied source says this.", sourceUrls: ["https://example.com/news"] }],
      });
      expect(cited.success).toBe(true);
      if (cited.success) {
        expect(cited.data.claims[0].verificationStatus).toBe("uncertain");
        expect(cited.data.claims[0].confidenceLevel).toBe("low");
      }
    });

    it("validates a briefing report with four meeting questions", () => {
      const report = FinalBriefingGenerationSchema.safeParse({
        executiveSnapshot: "A concise executive snapshot based on the supplied evidence and meeting context.",
        developments: [],
        implications: [],
        questions: ["What changed?", "What is the rollout?", "What remains unclear?", "What should happen next?"].map((question) => ({ question, context: "Use this to guide discussion.", targetObjective: "Clarify next steps." })),
        watchlist: [],
      });
      expect(report.success).toBe(true);
    });
  });

  describe("Executive PDF Export", () => {
    it("should generate a valid binary PDF buffer from briefing data", async () => {
      const microsoftPreset = DEMO_PRESETS.microsoft;
      const fullBriefing: BriefingFull = {
        id: "test-briefing-id",
        meetingId: "test-meeting-id",
        meeting: {
          id: "test-meeting-id",
          entityName: microsoftPreset.entityName,
          entityType: microsoftPreset.entityType,
          meetingDateTime: "2026-11-15T15:00:00.000Z",
          timezone: "America/New_York",
          meetingPurpose: microsoftPreset.meetingPurpose,
          objective: microsoftPreset.objective,
          additionalContext: microsoftPreset.additionalContext,
        },
        status: "completed",
        isDemo: true,
        executiveSummary: microsoftPreset.briefing.executiveSummary,
        developments: microsoftPreset.briefing.developments,
        implications: microsoftPreset.briefing.implications,
        questions: microsoftPreset.briefing.questions,
        watchlist: microsoftPreset.briefing.watchlist,
        sources: microsoftPreset.briefing.sources,
        claims: microsoftPreset.briefing.claims,
        researchWindowStart: microsoftPreset.briefing.researchWindowStart,
        researchWindowEnd: microsoftPreset.briefing.researchWindowEnd,
        generatedAt: microsoftPreset.briefing.generatedAt,
        wordCount: microsoftPreset.briefing.wordCount,
        qualityScore: microsoftPreset.briefing.qualityScore,
        createdAt: new Date().toISOString(),
      };

      const buffer = await generateBriefingPdf(fullBriefing);
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(1000);
      // Valid PDF files start with "%PDF-"
      const header = buffer.slice(0, 5).toString("utf-8");
      expect(header).toBe("%PDF-");
    });
  });
});
