# API reference

Base URL is `APP_URL` (locally `http://localhost:3000`). JSON endpoints use `application/json`. Inputs are validated server-side. Routes return 404 for unknown records, 409 if a research run is already active, 413 for oversized create requests, and 429 when an in-memory per-IP rate limit is reached.

## `GET /api/health`

Returns application status, database connectivity/count, whether Tavily and Bifrost are configured, the configured model identifier and per-process Tavily usage counters. It does not return API keys or the Bifrost base URL. It does not make a live provider health request. A database failure returns `503`; integration configuration does not mean the provider is reachable.

## `GET /api/briefings?limit=20`

Lists the most recent briefing summaries. `limit` is bounded to 1–50. Counts reflect persisted findings, sources and claims; there are no seeded/fabricated report counts.

## `POST /api/briefings`

Creates a meeting and pending briefing. Request body is limited to 16 KB.

```json
{
  "entityName": "Microsoft",
  "entityType": "company",
  "meetingDateTime": "2026-11-20T15:00:00.000Z",
  "timezone": "America/New_York",
  "meetingPurpose": "partnership",
  "objective": "Discuss a partner integration",
  "additionalContext": "Focus on enterprise customers",
  "isDemo": false
}
```

`entityType`: `company` or `person`. `meetingPurpose`: `sales`, `partnership`, `investment`, `interview`, `business_development` or `general`. `meetingDateTime` must be ISO 8601 with an offset. `timezone` must be a valid IANA timezone. `isDemo: true` selects the archived Microsoft fixture only; it is not live research.

Returns `201` with the created meeting, briefing and calculated `researchWindow.start`, `.end` and `.isFutureMeeting`.

## `GET /api/briefings/:id`

Returns one briefing with meeting details, developments, implications, questions, watchlist, sources and related claims. Each finding's `sourceIds` refer to the returned source IDs. Sources include original URL, publisher/domain, available publication date, extraction text, query metadata and heuristic scores.

## `GET /api/briefings/:id/research`

Starts a research run and streams Server-Sent Events (`text/event-stream`). The briefing status update acts as a duplicate-run lock. The browser uses this route for live progress.

Stage events use `data: {"stage":"WEB_RESEARCH","status":"running", ...}`. On success, the stream ends with `{ "done": true, "briefingId": "...", "briefing": { ... } }`. On failure it ends with `{ "error": true, "message": "..." }`; the briefing is persisted as failed with an error and already-collected candidate sources retained when available.

## `POST /api/briefings/:id/research`

Runs the same workflow and returns the completed briefing as JSON. Useful for non-streaming clients.

## `POST /api/briefings/:id/regenerate`

Alias to start another research run for the saved meeting. Returns a duplicate-run conflict if another run is active. Existing evidence is retained if a later Bifrost step fails; successful regeneration replaces the report's current sources and claims.

## `GET /api/briefings/:id/status`

Returns `id`, current `status`, sanitized last error, update time and persisted stage records with event lists.

## `GET /api/briefings/:id/pdf`

Renders the saved briefing as an A4 PDF using server-side Playwright Chromium. The PDF has links to validated HTTPS source URLs. Export returns `500` with an error if Chromium is unavailable or content cannot fit after the compact layout pass.

## Input and operational limits

- Create request: 16 KB maximum; entity name: 2–120 characters; objective: 1,000 characters maximum; context: 2,000 characters maximum.
- Create requests: 10 per IP per 10 minutes in the current process.
- Research stream and non-stream runs: 5 per IP per 10 minutes; a briefing also has an atomic one-run lock.
- Limits use process memory and are not shared between replicas. Add a shared rate-limit store before running multiple instances.
