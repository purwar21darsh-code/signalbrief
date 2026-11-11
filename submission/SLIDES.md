# SignalBrief — six-slide submission outline

## 1. The problem

- Meeting prep is scattered across search tabs, stale notes and broad AI summaries.
- Executives need recent developments with dates and original sources they can inspect.
- Opportunity: turn bounded public research into a practical, meeting-specific one-page brief.

## 2. SignalBrief

- “Know what matters before you enter the room.”
- Enter a company/person, meeting time and timezone, purpose and objective.
- Get dated findings, meeting implications, tailored questions and a watchlist.
- Separate live Tavily/Bifrost research from the clearly labelled archived demo.

## 3. Architecture and integrations

- Next.js App Router, TypeScript, Zod and Prisma.
- Tavily Search plans execute across four or more angles; Tavily Extract supplies page text.
- Every model request passes through configurable Bifrost using its OpenAI-compatible API.
- PostgreSQL in production; SQLite for local development. Playwright renders A4 PDF.

## 4. Research and verification

- Bifrost resolves the entity and plans focused queries.
- Tavily sources retain URL, title, date, domain, query and extraction.
- Unknown/out-of-window dates are background only; unsupported URLs are rejected.
- Conflicts and missing information remain visible. Relevance heuristics are separate from factual confidence.

## 5. Product demo

- Enter a live meeting and inspect actual Bifrost/Tavily stage events.
- Open a claim citation and inspect the source and extracted evidence.
- Review fact/analysis separation, meeting-specific questions and watchlist.
- Export the saved briefing as a one-page A4 PDF.
- Without API credentials, show `/demo` as an archived April 2025 Microsoft fixture only.

## 6. Impact, reliability and roadmap

- Immediate value: reduce the context switching needed to enter a meeting prepared.
- Reliability: date and URL checks, schema validation, bounded repair, retryable errors, source retention.
- Current limits: no auth/per-user access control, in-memory rate limits/cache, synchronous pipeline.
- Roadmap: durable job queue/shared events, user accounts and access controls, calendar integration, broader source provenance and evaluation.
