# Technical decisions

## Tavily and Bifrost remain real dependencies

Live mode fails clearly if Tavily is not configured or the Bifrost endpoint/model is unusable. No upstream LLM fallback is present. The archived Microsoft demo is an isolated fixture for UI review and makes no Tavily or Bifrost request.

## Plan before searching

Bifrost resolves the entity and returns four to eight focused query angles. Tavily search runs them in parallel. This increases search usage compared with a single broad query, so each angle is capped at five results and cache entries expire after five minutes.

## Evidence is gated in application code

Search results are not accepted as recent facts just because Tavily ranked them. The application keeps only HTTPS URLs, deduplicates by normalized URL and similar title, and restricts recent claim extraction to results whose publication date is known and inside the calculated window. Unknown or outside-window sources remain background material. A model URL is accepted only if it maps to an exact URL supplied in the source set. Claims with unknown or out-of-window event dates do not enter recent developments.

These checks improve traceability, but they cannot independently prove that a publisher is correct or that two reports have separate origins. `verified` describes the pipeline's evidence checks, not a guarantee of truth. Contradictions and lower-confidence items remain visible.

## Relevance and confidence are separate

Source relevance is a weighted heuristic: entity match (30%), meeting fit (25%), recency (20%), publisher heuristic (15%) and evidence completeness (10%). The UI presents publisher and relevance values as heuristics. They are not calibrated probabilities and do not raise a claim's factual confidence.

## Bifrost structured generation

Every model request uses the configured Bifrost `/chat/completions` endpoint. Outputs are parsed and validated with Zod. One controlled repair request is allowed for malformed JSON or schema mismatch; a second invalid result fails the run. The repair pass does not bypass the gateway.

## SQLite locally, PostgreSQL for deployment

SQLite keeps local setup short. A separate PostgreSQL schema and migration provide the Docker/Railway production path. Prisma 7 uses explicit SQLite and PostgreSQL driver adapters; generate the client from the schema for the intended environment before building.

## SSE for first vertical slice

SSE carries one-way stage events over a standard route handler. It keeps the live activity view simple and reuses persisted stage logs for recovery. Long-running production jobs and multi-instance workloads should move to a durable queue and shared event store.

## Playwright for printable layout

The PDF is produced from escaped report data in Chromium, so the exported document follows the report's A4 layout. If content cannot fit after compact styling, export returns an error rather than silently clipping it. This makes Chromium availability a deployment requirement for PDF export.

## Security scope

Keys remain server-side, request bodies have size/rate limits, external evidence is untrusted, output citations are allowlisted, and errors redact known keys. The initial app has no authentication or per-user data isolation. Rate limits and caches are in-memory and should be replaced with shared infrastructure before scaling out.
