import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TavilyService } from "../lib/research/tavily";
import { BifrostGatewayService } from "../lib/ai/bifrost";
import { z } from "zod";
import { prisma } from "../lib/db";

describe("SignalBrief Integration Tests", () => {
  const originalFetch = global.fetch;
  const originalBifrostKey = process.env.BIFROST_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalBifrostKey === undefined) delete process.env.BIFROST_API_KEY;
    else process.env.BIFROST_API_KEY = originalBifrostKey;
    vi.restoreAllMocks();
  });

  describe("Tavily Service Integration (Mocked HTTP)", () => {
    it("should process search response and classify sources accurately", async () => {
      const mockTavilyResponse = {
        results: [
          {
            title: "Stripe Announces New Developer Features",
            url: "https://stripe.com/newsroom/news/announcement-1",
            content: "Stripe launched new payment tools for AI agents.",
            published_date: "2026-10-24",
            score: 0.95,
          },
          {
            title: "Reuters: Stripe Acquisition Update",
            url: "https://www.reuters.com/tech/stripe-deal-2026",
            content: "Stripe acquired Bridge in a landmark stablecoin move.",
            published_date: "2026-10-18",
            score: 0.9,
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTavilyResponse,
      } as Response);

      const client = new TavilyService("tvly-test-api-key");
      const result = await client.searchSingle({ query: "Stripe 2026", startDate: "2026-10-12", endDate: "2026-11-11" }, "product");

      expect(result.sources.length).toBe(2);
      expect(result.sources[0].domain).toBe("stripe.com");
      expect(result.sources[0].sourceType).toBe("company_announcement");
      expect(result.sources[0].credibilityScore).toBeGreaterThanOrEqual(0.9);
      expect(result.sources[1].domain).toBe("reuters.com");
      expect(result.sources[1].sourceType).toBe("news");
      const call = vi.mocked(global.fetch).mock.calls[0];
      const requestBody = JSON.parse(call[1]?.body as string);
      expect(call[0]).toBe("https://api.tavily.com/search");
      expect(requestBody.start_date).toBe("2026-10-12");
      expect(requestBody.end_date).toBe("2026-11-11");
      expect(requestBody.include_published_date).toBe(true);
      expect(requestBody).not.toHaveProperty("api_key");
      expect((call[1]?.headers as Record<string, string>).Authorization).toBe("Bearer tvly-test-api-key");
    });

    it("should handle Tavily 429 rate limit with a clear error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => "Rate limit exceeded",
      } as Response);

      const client = new TavilyService("tvly-test-api-key");
      await expect(client.searchSingle({ query: "Test" })).rejects.toThrow(
        /rate limit exceeded/i
      );
    });

    it("should handle Tavily Extract API response", async () => {
      const mockExtractResponse = {
        results: [
          {
            url: "https://stripe.com/newsroom/news/announcement-1",
            raw_content: "# Full Announcement Markdown Content\n\nStripe today released...",
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockExtractResponse,
      } as Response);

      const client = new TavilyService("tvly-test-api-key");
      const extractMap = await client.extractUrls([
        "https://stripe.com/newsroom/news/announcement-1",
      ]);

      expect(extractMap.has("https://stripe.com/newsroom/news/announcement-1")).toBe(true);
      expect(extractMap.get("https://stripe.com/newsroom/news/announcement-1")).toContain(
        "Full Announcement"
      );
    });
  });

  describe("Bifrost Gateway Integration (Mocked HTTP)", () => {
    it("should route inference through OpenAI-compatible endpoint with gateway headers", async () => {
      const mockBifrostResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                resolvedEntity: "Anthropic PBC",
                entityType: "company",
                isAmbiguous: false,
                queries: [
                  {
                    category: "product",
                    query: "Anthropic Claude 3.5 2026",
                    angle: "Product",
                    rationale: "Discover model releases",
                  },
                  {
                    category: "leadership",
                    query: "Anthropic executive 2026",
                    angle: "Leadership",
                    rationale: "Track hires",
                  },
                  {
                    category: "partnerships",
                    query: "Anthropic AWS Google Cloud 2026",
                    angle: "Partnerships",
                    rationale: "Cloud deals",
                  },
                ],
              }),
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockBifrostResponse,
      } as Response);

      process.env.BIFROST_API_KEY = "test-bifrost-key";
      const client = new BifrostGatewayService();
      const testSchema = z.object({
        resolvedEntity: z.string(),
        entityType: z.enum(["company", "person"]),
        isAmbiguous: z.boolean(),
        queries: z.array(
          z.object({
            category: z.string(),
            query: z.string(),
            angle: z.string(),
            rationale: z.string(),
          })
        ),
      });

      const parsed = await client.generateStructured(
        [{ role: "user", content: "Plan research for Anthropic" }],
        testSchema,
        "Test Planning"
      );

      expect(parsed.resolvedEntity).toBe("Anthropic PBC");
      expect(parsed.queries.length).toBe(3);
      const call = vi.mocked(global.fetch).mock.calls[0];
      expect(call[0]).toBe("http://localhost:8080/v1/chat/completions");
      expect((call[1]?.headers as Record<string, string>).Authorization).toBe("Bearer test-bifrost-key");
      expect(call[1]?.headers).not.toHaveProperty("x-bifrost-api-key");
    });

    it("should trigger repair loop if first response is malformed JSON", async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          // Return malformed JSON
          return {
            ok: true,
            status: 200,
            json: async () => ({
              choices: [{ message: { content: "{ invalid json here: missing bracket" } }],
            }),
          };
        }
        // Return repaired valid JSON on attempt 2
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({ status: "repaired", confidence: "high" }),
                },
              },
            ],
          }),
        };
      });

      const client = new BifrostGatewayService();
      const schema = z.object({ status: z.string(), confidence: z.string() });

      const result = await client.generateStructured(
        [{ role: "user", content: "Analyze" }],
        schema,
        "Test Repair"
      );

      expect(callCount).toBe(2);
      expect(result.status).toBe("repaired");
    });
  });

  describe("Prisma Database Persistence Integration", () => {
    it("should create meeting and persist relational briefing records in SQLite", async () => {
      const meeting = await prisma.meeting.create({
        data: {
          entityName: "Test Corporation",
          entityType: "company",
          meetingDateTime: new Date("2026-11-20T10:00:00.000Z"),
          timezone: "UTC",
          meetingPurpose: "sales",
          objective: "Integration discussion",
        },
      });

      expect(meeting.id).toBeDefined();

      const briefing = await prisma.briefing.create({
        data: {
          meetingId: meeting.id,
          status: "completed",
          isDemo: false,
          executiveSummary: "Test executive summary content.",
          researchWindowStart: new Date("2026-10-21T00:00:00.000Z"),
          researchWindowEnd: new Date("2026-11-20T00:00:00.000Z"),
          wordCount: 350,
          qualityScore: 99.0,
        },
      });

      expect(briefing.id).toBeDefined();

      const source = await prisma.source.create({
        data: {
          briefingId: briefing.id,
          title: "Test Announcement",
          url: "https://test.com/news",
          domain: "test.com",
          sourceType: "company_announcement",
          credibilityScore: 0.95,
        },
      });

      expect(source.id).toBeDefined();

      // Clean up test records
      await prisma.meeting.delete({ where: { id: meeting.id } });
    });
  });
});
