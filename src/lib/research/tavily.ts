import { SourceItem, SourceType } from "@/types";
import {
  TavilySearchResponseSchema,
  TavilyExtractResponseSchema,
} from "@/lib/validation/schemas";
import { getDomainFromUrl, normalizeSourceUrl, sanitizeText } from "@/lib/utils";

export interface TavilySearchParams {
  query: string;
  searchDepth?: "basic" | "advanced";
  topic?: "general" | "news" | "finance";
  days?: number;
  startDate?: string;
  endDate?: string;
  maxResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
}

export interface TavilySearchResult {
  sources: SourceItem[];
  rawCount: number;
  query: string;
  durationMs: number;
}

export interface TavilyUsageStats {
  searchCalls: number;
  extractCalls: number;
  totalUrlsExtracted: number;
}

// In-memory cache for queries within the server lifecycle (5-minute TTL)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const searchCache = new Map<string, CacheEntry<SourceItem[]>>();
const extractCache = new Map<string, CacheEntry<string>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export class TavilyService {
  private apiKey: string;
  private baseUrl = "https://api.tavily.com";
  private usage: TavilyUsageStats = {
    searchCalls: 0,
    extractCalls: 0,
    totalUrlsExtracted: 0,
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY || "";
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public getUsage(): TavilyUsageStats {
    return { ...this.usage };
  }

  /**
   * Classify source credibility and type based on domain and content
   */
  private classifySource(url: string, title: string): { type: SourceType; score: number } {
    const domain = getDomainFromUrl(url).toLowerCase();
    const titleLower = title.toLowerCase();

    // Primary official company / regulatory domains
    if (
      domain.includes("sec.gov") ||
      domain.includes("gov.uk") ||
      domain.includes("regulatory")
    ) {
      return { type: "regulatory", score: 0.98 };
    }

    if (
      domain.includes("newsroom") ||
      domain.includes("press") ||
      domain.includes("blog.") ||
      titleLower.includes("announces") ||
      titleLower.includes("introducing")
    ) {
      return { type: "company_announcement", score: 0.92 };
    }

    if (domain.includes("prnewswire") || domain.includes("businesswire") || domain.includes("globenewswire")) {
      return { type: "press_release", score: 0.88 };
    }

    // Top tier tech & business journalism
    const tierOneNews = [
      "reuters.com",
      "bloomberg.com",
      "wsj.com",
      "ft.com",
      "techcrunch.com",
      "theverge.com",
      "cnbc.com",
      "forbes.com",
    ];
    if (tierOneNews.some((t) => domain.endsWith(t))) {
      return { type: "news", score: 0.85 };
    }

    return { type: "news", score: 0.75 };
  }

  /**
   * Execute single Tavily search with retry and timeout
   */
  public async searchSingle(
    params: TavilySearchParams,
    searchAngle: string = "general"
  ): Promise<TavilySearchResult> {
    const cacheKey = JSON.stringify({
      query: params.query,
      searchDepth: params.searchDepth || "advanced",
      topic: params.topic || "news",
      startDate: params.startDate,
      endDate: params.endDate,
      maxResults: params.maxResults || 6,
    });
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        sources: cached.data,
        rawCount: cached.data.length,
        query: params.query,
        durationMs: 0,
      };
    }

    if (!this.isConfigured()) {
      throw new Error(
        "TAVILY_API_KEY is not configured. Set TAVILY_API_KEY in your environment or enable Demo Mode."
      );
    }

    const startTime = Date.now();
    const maxRetries = 2;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

      try {
        const payload: Record<string, unknown> = {
          query: params.query,
          search_depth: params.searchDepth || "advanced",
          topic: params.topic || "news",
          max_results: params.maxResults || 6,
          include_raw_content: false,
          include_answer: false,
          include_published_date: true,
          filter_by_published_date: false,
          include_usage: true,
        };

        if (params.startDate) payload.start_date = params.startDate;
        if (params.endDate) payload.end_date = params.endDate;

        const response = await fetch(`${this.baseUrl}/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new Error("Tavily API rate limit exceeded (HTTP 429). Please wait before retrying.");
        }

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Tavily search failed (${response.status}): ${errBody.slice(0, 300)}`);
        }

        const json = await response.json();
        this.usage.searchCalls++;

        const parsed = TavilySearchResponseSchema.safeParse(json);
        if (!parsed.success) {
          throw new Error(`Invalid Tavily response schema: ${parsed.error.message}`);
        }

        const sources = parsed.data.results.flatMap((res, idx): SourceItem[] => {
          const safeUrl = normalizeSourceUrl(res.url);
          if (!safeUrl) return [];
          const { type, score } = this.classifySource(safeUrl, res.title);
          return [{
            id: `src_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
            title: sanitizeText(res.title || "Untitled Source"),
            url: res.url,
            domain: getDomainFromUrl(safeUrl),
            // Never invent publication dates - keep raw or unknown
            publicationDate: res.published_date ? String(res.published_date).trim() : "unknown",
            extractedContent: sanitizeText(res.content || ""),
            sourceType: type,
            credibilityScore: score,
            searchScore: res.score,
            searchQuery: params.query,
            searchAngle,
          }];
        });

        searchCache.set(cacheKey, { data: sources, timestamp: Date.now() });

        return {
          sources,
          rawCount: sources.length,
          query: params.query,
          durationMs: Date.now() - startTime,
        };
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt <= maxRetries && !lastError.message.includes("429")) {
          // Exponential backoff: 1s, 2s
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        } else {
          break;
        }
      }
    }

    throw lastError || new Error("Failed to execute Tavily search after retries");
  }

  /**
   * Parallel Multi-Angle Search
   * Executes at least 4 distinct query angles and aggregates deduplicated sources
   */
  public async searchMultipleAngles(
    queries: Array<{ angle: string; query: string; category?: string }>,
    window?: { start: Date; end: Date }
  ): Promise<{ sources: SourceItem[]; queryCount: number; errors: string[] }> {
    const errors: string[] = [];
    const allSources: SourceItem[] = [];

    const searchPromises = queries.map(async (q) => {
      try {
        const result = await this.searchSingle(
          {
            query: q.query,
            startDate: window?.start.toISOString().slice(0, 10),
            endDate: window?.end.toISOString().slice(0, 10),
            searchDepth: "advanced",
            topic: "news",
            maxResults: 5,
          },
          q.angle
        );
        return result.sources;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Query [${q.angle}]: ${msg}`);
        return [] as SourceItem[];
      }
    });

    const results = await Promise.all(searchPromises);
    for (const batch of results) {
      allSources.push(...batch);
    }

    // Deduplicate by normalized URL
    const uniqueSources: SourceItem[] = [];
    const seenUrls = new Set<string>();
    const seenTitles: Set<string>[] = [];
    for (const source of allSources) {
      const normalizedUrl = normalizeSourceUrl(source.url);
      const titleKey = source.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const titleWords = new Set(titleKey.split(/\s+/).filter((word) => word.length > 2));
      const sameArticle = seenTitles.some((previous) => {
        const intersection = [...titleWords].filter((word) => previous.has(word)).length;
        const union = new Set([...titleWords, ...previous]).size;
        return union > 0 && intersection / union >= 0.9;
      });
      if (!normalizedUrl || seenUrls.has(normalizedUrl) || sameArticle) continue;
      seenUrls.add(normalizedUrl);
      seenTitles.push(titleWords);
      uniqueSources.push(source);
    }

    // Sort by credibility score descending, then by verified publication date
    uniqueSources.sort((a, b) => {
      if (b.credibilityScore !== a.credibilityScore) {
        return b.credibilityScore - a.credibilityScore;
      }
      if (a.publicationDate !== "unknown" && b.publicationDate === "unknown") return -1;
      if (a.publicationDate === "unknown" && b.publicationDate !== "unknown") return 1;
      return 0;
    });

    return {
      sources: uniqueSources,
      queryCount: queries.length,
      errors,
    };
  }

  /**
   * Tavily Extract API for in-depth content extraction
   * POST https://api.tavily.com/extract
   */
  public async extractUrls(urls: string[]): Promise<Map<string, string>> {
    const resultMap = new Map<string, string>();
    const urlsToFetch: string[] = [];

    for (const candidateUrl of urls) {
      const url = normalizeSourceUrl(candidateUrl);
      if (!url) continue;
      const cached = extractCache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        resultMap.set(url, cached.data);
      } else {
        urlsToFetch.push(url);
      }
    }

    if (urlsToFetch.length === 0) {
      return resultMap;
    }

    if (!this.isConfigured()) {
      return resultMap;
    }

    // Tavily extract accepts arrays of URLs (max 10-20 per call)
    const batch = urlsToFetch.slice(0, 20);
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(`${this.baseUrl}/extract`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            urls: batch,
            extract_depth: "basic",
            format: "markdown",
            include_usage: true,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if ((response.status === 429 || response.status >= 500) && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (2 ** attempt)));
          continue;
        }
        if (!response.ok) throw new Error(`Tavily extract failed with HTTP ${response.status}.`);

        const parsed = TavilyExtractResponseSchema.safeParse(await response.json());
        if (!parsed.success) throw new Error(`Invalid Tavily extract response: ${parsed.error.message}`);
        this.usage.extractCalls++;
        this.usage.totalUrlsExtracted += parsed.data.results.length;
        for (const item of parsed.data.results) {
          const normalizedUrl = normalizeSourceUrl(item.url);
          if (!normalizedUrl || !item.raw_content) continue;
          const cleaned = sanitizeText(item.raw_content).slice(0, 6000);
          resultMap.set(normalizedUrl, cleaned);
          extractCache.set(normalizedUrl, { data: cleaned, timestamp: Date.now() });
        }
        break;
      } catch (err) {
        clearTimeout(timeoutId);
        if (attempt === 2) console.warn("Tavily extract request failed after retries:", err instanceof Error ? err.message : "unknown error");
      }
    }

    return resultMap;
  }
}

export const tavilyService = new TavilyService();
