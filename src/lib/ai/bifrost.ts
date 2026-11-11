import { z } from "zod";

export interface BifrostMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface BifrostChatOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export class BifrostGatewayService {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.baseUrl = (process.env.BIFROST_BASE_URL || "http://localhost:8080/v1").replace(/\/+$/, "");
    this.apiKey = process.env.BIFROST_API_KEY || "";
    this.model = process.env.BIFROST_MODEL || "openai/gpt-4o-mini";
  }

  public isConfigured(): boolean {
    try {
      const url = new URL(this.baseUrl);
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash && Boolean(this.model.trim());
    } catch {
      return false;
    }
  }

  public getConfig() {
    return {
      baseUrl: this.baseUrl,
      model: this.model,
      hasApiKey: Boolean(this.apiKey && this.apiKey.length > 0),
    };
  }

  /**
   * Primary inference gateway call via Bifrost OpenAI-compatible endpoint
   */
  public async chat(
    messages: BifrostMessage[],
    options: BifrostChatOptions = {}
  ): Promise<string> {
    const endpoint = `${this.baseUrl}/chat/completions`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for deep analysis

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "SignalBrief-Agent/1.0",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const payload: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 2500,
    };

    if (options.jsonMode) {
      payload.response_format = { type: "json_object" };
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const responseText = (await response.text()).slice(0, 1200);
        const errorText = this.apiKey ? responseText.replaceAll(this.apiKey, "[REDACTED]") : responseText;
        let parsedMessage = errorText;
        try {
          const errJson = JSON.parse(errorText);
          parsedMessage = errJson.error?.message || errJson.message || errorText;
        } catch {
          // keep raw text
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `Bifrost Gateway Authentication Failed (${response.status}): Check your BIFROST_API_KEY or gateway authorization rules. Details: ${parsedMessage}`
          );
        }

        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error(
            `Bifrost Gateway Connectivity Issue (${response.status}): The gateway at ${this.baseUrl} is unavailable or timed out upstream. Verify that Bifrost is running.`
          );
        }

        throw new Error(`Bifrost Gateway inference failed (${response.status}): ${parsedMessage}`);
      }

      const json = await response.json();
      const content = z.object({
        choices: z.array(z.object({ message: z.object({ content: z.string().nullable().optional() }) })).min(1),
      }).parse(json).choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("Bifrost gateway returned empty response content in choices[0].message.content");
      }

      return content;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          throw new Error(
            `Bifrost Gateway Request Timed Out (45s) at ${this.baseUrl}. The model inference exceeded latency limit.`
          );
        }
        if (err.message.includes("ECONNREFUSED") || err.message.includes("fetch failed")) {
          throw new Error(
            `Cannot connect to Bifrost Gateway at ${this.baseUrl}. Please verify your BIFROST_BASE_URL and that the gateway container/service is running.`
          );
        }
        throw err;
      }
      throw new Error(String(err));
    }
  }

  /**
   * Clean JSON string from potential markdown code fences
   */
  private extractJsonString(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.startsWith("```")) {
      const stripped = trimmed
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
      return stripped.trim();
    }
    return trimmed;
  }

  /**
   * Robust structured JSON generation with 1-step repair loop and Zod validation
   */
  public async generateStructured<T>(
    messages: BifrostMessage[],
    schema: z.ZodSchema<T>,
    stageDescription: string,
    options: BifrostChatOptions = {}
  ): Promise<T> {
    const systemPromptAddition: BifrostMessage = {
      role: "system",
      content:
        "CRITICAL: You MUST respond ONLY with a valid, parseable JSON object matching the requested schema. Do not enclose in markdown ticks, and do not include explanatory conversation outside the JSON.",
    };

    const combinedMessages = [systemPromptAddition, ...messages];

    // Attempt 1: Standard structured inference
    let rawContent: string;
    try {
      rawContent = await this.chat(combinedMessages, {
        ...options,
        jsonMode: true,
      });
    } catch (err) {
      throw new Error(`[Bifrost - ${stageDescription}] Gateway call failed: ${(err as Error).message}`);
    }

    const cleaned = this.extractJsonString(rawContent);
    try {
      const parsedJson = JSON.parse(cleaned);
      const validated = schema.safeParse(parsedJson);
      if (validated.success) {
        return validated.data;
      }
      // If validation failed, log why and attempt 1 repair
      console.warn(`[Bifrost - ${stageDescription}] Validation error on initial response:`, validated.error.issues);
    } catch (jsonParseErr) {
      console.warn(`[Bifrost - ${stageDescription}] JSON parse error on initial response:`, jsonParseErr);
    }

    // Attempt 2: Controlled repair loop
    console.info(`[Bifrost - ${stageDescription}] Triggering 1-step JSON repair loop via Bifrost...`);
    const repairMessages: BifrostMessage[] = [
      ...combinedMessages,
      { role: "assistant", content: rawContent },
      {
        role: "user",
        content: `Your previous response was malformed or failed schema validation. Please fix the JSON syntax and ensure all required fields strictly adhere to the requested schema. Respond ONLY with the corrected valid JSON object.`,
      },
    ];

    const repairedContent = await this.chat(repairMessages, {
      ...options,
      jsonMode: true,
      temperature: 0.1, // lower temperature for deterministic repair
    });

    const repairedCleaned = this.extractJsonString(repairedContent);
    try {
      const repairedJson = JSON.parse(repairedCleaned);
      const secondValidation = schema.safeParse(repairedJson);
      if (secondValidation.success) {
        return secondValidation.data;
      }
      throw new Error(
        `[Bifrost - ${stageDescription}] Repaired response still failed validation: ${secondValidation.error.message}`
      );
    } catch (err) {
      throw new Error(
        `[Bifrost - ${stageDescription}] Failed to parse structured output even after repair: ${(err as Error).message}`
      );
    }
  }
}

export const bifrostService = new BifrostGatewayService();
