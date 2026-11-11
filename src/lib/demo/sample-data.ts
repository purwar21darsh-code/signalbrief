import { BriefingFull } from "@/types";

export interface DemoBriefingPreset {
  entityName: string;
  entityType: "company" | "person";
  meetingPurpose: "partnership" | "sales" | "investment" | "business_development" | "general";
  objective: string;
  additionalContext: string;
  briefing: Omit<BriefingFull, "id" | "meetingId" | "createdAt" | "meeting">;
}

/** Archived, source-attributed fixture. It is never represented as live Tavily research. */
export const DEMO_PRESETS: Record<string, DemoBriefingPreset> = {
  microsoft: {
    entityName: "Microsoft",
    entityType: "company",
    meetingPurpose: "partnership",
    objective: "Discuss enterprise adoption and partner opportunities around Microsoft Copilot and AI agents.",
    additionalContext: "Archived demonstration snapshot generated on April 10, 2025.",
    briefing: {
      status: "completed",
      isDemo: true,
      executiveSummary:
        "This is an archived demonstration snapshot, not current intelligence. Microsoft’s April 4, 2025 posts described a broader Copilot experience focused on personalization, research, search and actions, alongside new developer agent capabilities. The posts document Microsoft’s announced direction and staged rollouts; they do not establish current availability or adoption. For a partnership discussion, confirm rollout status, tenant controls and the integration path for the specific customer segment.",
      researchWindowStart: "2025-03-11T12:00:00.000Z",
      researchWindowEnd: "2025-04-10T12:00:00.000Z",
      generatedAt: "2025-04-10T12:00:00.000Z",
      wordCount: 340,
      developments: [
        {
          id: "demo-microsoft-1",
          eventDate: "2025-04-04",
          headline: "Microsoft described a more personalized Copilot experience",
          whatHappened:
            "Microsoft announced Copilot updates covering memory and personalization, Deep Research, Copilot Search, Pages and additional actions. The post says initial versions would begin rolling out that day, with availability varying by platform, market and language.",
          whyItMatters:
            "The breadth of the announced experiences makes rollout scope, user controls and enterprise readiness useful partnership topics.",
          verificationStatus: "verified",
          confidence: "high",
          sourceIds: ["demo-ms-source-1"],
          category: "product",
        },
        {
          id: "demo-microsoft-2",
          eventDate: "2025-04-04",
          headline: "Microsoft announced developer agent updates during its 50th anniversary",
          whatHappened:
            "Microsoft said GitHub Copilot Agent Mode and Code Review Agent were beginning to roll out, and described a new multi-agent framework for Azure AI Foundry.",
          whyItMatters:
            "These announcements create a concrete opening to ask how Microsoft expects partners to build, govern and distribute agent workflows.",
          verificationStatus: "verified",
          confidence: "high",
          sourceIds: ["demo-ms-source-2"],
          category: "product",
        },
      ],
      implications: [
        {
          id: "demo-ms-implication-1",
          area: "Enterprise rollout",
          implication: "Clarify which Copilot capabilities are available to the target customer segment and which remain in staged rollout.",
          strategicContext: "The announcement explicitly notes that availability varies by platform, market and language.",
          isFactOrAnalysis: "analysis",
          relatedFindingIds: ["demo-microsoft-1"],
        },
        {
          id: "demo-ms-implication-2",
          area: "Agent ecosystem",
          implication: "Explore where a partner integration could fit within Foundry’s announced multi-agent framework.",
          strategicContext: "Microsoft described a framework announcement, but the article does not specify partner terms or adoption outcomes.",
          isFactOrAnalysis: "analysis",
          relatedFindingIds: ["demo-microsoft-2"],
        },
      ],
      questions: [
        { id: "demo-ms-q1", question: "Which Copilot capabilities announced on April 4 are available to our target users today?", context: "The post describes initial rollouts with availability varying by market and platform.", targetObjective: "Establish the actual rollout scope.", referencedFindingIds: ["demo-microsoft-1"] },
        { id: "demo-ms-q2", question: "What tenant and user controls are available for Copilot memory and personalization?", context: "Microsoft described user control and opt-out options for Memory.", targetObjective: "Understand governance requirements.", referencedFindingIds: ["demo-microsoft-1"] },
        { id: "demo-ms-q3", question: "How can an external partner integrate with the Azure AI Foundry multi-agent framework?", context: "The anniversary post announced a new agent framework but did not detail partner onboarding.", targetObjective: "Identify the technical and commercial path.", referencedFindingIds: ["demo-microsoft-2"] },
        { id: "demo-ms-q4", question: "What evaluation and safety requirements apply to agents distributed through Microsoft’s ecosystem?", context: "The post describes new agent tooling and evaluation capabilities.", targetObjective: "Surface launch-readiness criteria.", referencedFindingIds: ["demo-microsoft-2"] },
      ],
      watchlist: [
        { id: "demo-ms-watch-1", topic: "Feature availability", concern: "The posts describe announcements and staged rollouts, not current availability for every customer segment.", type: "missing_info", suggestedAction: "Confirm present availability with Microsoft before making a launch commitment." },
        { id: "demo-ms-watch-2", topic: "Partner terms", concern: "The cited posts do not specify integration approval, commercial terms or partner access.", type: "missing_info", suggestedAction: "Request current partner program documentation." },
      ],
      sources: [
        {
          id: "demo-ms-source-1",
          title: "Your AI Companion",
          url: "https://blogs.microsoft.com/blog/2025/04/04/your-ai-companion/",
          domain: "blogs.microsoft.com",
          publicationDate: "2025-04-04",
          extractedContent: "Microsoft announced updates including Memory and Personalization, Pages, Deep Research, Copilot Search, Shopping, Actions, a Windows app and Copilot Vision on Mobile. The post says initial versions would begin rolling out that day, with availability varying by platform, market and language.",
          sourceType: "company_announcement",
          credibilityScore: 0.98,
          searchAngle: "Archived demo: official product announcement",
        },
        {
          id: "demo-ms-source-2",
          title: "Celebrating Microsoft's 50 years",
          url: "https://blogs.microsoft.com/blog/2025/04/04/celebrating-microsofts-50-years/",
          domain: "blogs.microsoft.com",
          publicationDate: "2025-04-04",
          extractedContent: "Microsoft described the rollout of GitHub Copilot Agent Mode and Code Review Agent, plus a new agent framework for building multi-agent systems in Azure AI Foundry.",
          sourceType: "company_announcement",
          credibilityScore: 0.98,
          searchAngle: "Archived demo: official developer announcement",
        },
      ],
      claims: [
        {
          id: "demo-ms-claim-1",
          text: "Microsoft announced new Copilot experiences and said initial versions would begin rolling out on April 4, 2025.",
          eventDate: "2025-04-04",
          verificationStatus: "verified",
          confidenceLevel: "high",
          reasoning: "Directly supported by Microsoft's dated corporate blog post.",
          sourceIds: ["demo-ms-source-1"],
        },
        {
          id: "demo-ms-claim-2",
          text: "Microsoft announced GitHub Copilot Agent Mode, Code Review Agent and an Azure AI Foundry multi-agent framework.",
          eventDate: "2025-04-04",
          verificationStatus: "verified",
          confidenceLevel: "high",
          reasoning: "Directly supported by Microsoft's dated corporate blog post.",
          sourceIds: ["demo-ms-source-2"],
        },
      ],
    },
  },
};
