# Testing guide

SignalBrief uses Vitest for unit and mocked HTTP/database coverage and Playwright for browser workflows. Mocked Tavily/Bifrost tests verify request paths, headers, parsing and error behavior; they are not evidence of successful live credentials or external service availability.

## Commands

```bash
npm run typecheck
npm test
npm run test:e2e:install
npm run test:e2e
npm run test:e2e:postgres # after setting DATABASE_URL, migrating and building for PostgreSQL
npm run build:postgres
```

`npm run test:e2e` first prepares an isolated SQLite file in the operating system temp directory. Its name is derived from the workspace path, so it does not reuse the developer's local database. Playwright runs a production Next.js build with that database. Chromium must be installed once with `npm run test:e2e:install`.

## Coverage

- Unit and React Testing Library: date-window calculation/capping, invalid timestamps, URL normalization and deduplication, relevance scoring, schemas, demo fixture labeling, citation mapping, and an uncertainty-status badge.
- Mocked Tavily: Search request date parameters and bearer authentication, response validation, 429 handling, Extract request/result mapping.
- Mocked Bifrost: OpenAI-compatible endpoint/authentication, structured output validation and one controlled repair request.
- Persistence: Prisma relation and source/claim association behavior against local SQLite.
- PDF: Playwright Chromium renders a PDF buffer with a `%PDF-` header and errors if it cannot fit on one A4 page.
- E2E: opens the app, pre-fills the archived Microsoft example, starts its clearly labelled fixture run, opens the saved report/source modal and downloads PDF.
- PostgreSQL E2E: runs the same browser workflow against the existing PostgreSQL production build and a migrated PostgreSQL database without rebuilding over it.

## Live integration smoke check

After configuring valid `TAVILY_API_KEY`, `BIFROST_BASE_URL`, `BIFROST_API_KEY` as required, and `BIFROST_MODEL`, use the UI to create a live briefing with `isDemo` off. Confirm the activity shows Bifrost planning, Tavily searches/extraction, accepted evidence counts, and saved claims. This is intentionally a manual smoke check because it uses billable/limited third-party services. No key is present in this source tree's example configuration.

## Latest run results (November 11, 2026)

| Command | Result |
| --- | --- |
| `npm test` | Passed: 23 tests in 3 files, including mocked Tavily/Bifrost tests and one React Testing Library test. |
| `npm run typecheck` | Passed. |
| `npm run test:e2e` | Passed: 1 browser flow covering archived briefing creation, source inspection and PDF download. |
| `npm run test:e2e:postgres` | Passed: the production server used PostgreSQL 18 and completed the same briefing, citation and PDF browser flow. |
| `npm run build:postgres` | Passed: optimized Next.js production build using the PostgreSQL Prisma client. |
| `npm audit` | Passed: 0 reported vulnerabilities. |
| `npx prisma validate --schema=prisma/schema.postgresql.prisma` | Passed. PostgreSQL migration SQL was compared to the current schema; the only generated diff was the default `public` schema declaration. |

The live Tavily and Bifrost APIs were not called because this workspace has no API credentials. The mocked tests are not evidence of live service availability. Docker build/Compose startup was not run: Docker Desktop was installed per-user, but the engine remained in `starting` and its health checks timed out. PostgreSQL migration deployment and production E2E were verified against an isolated temporary PostgreSQL 18 cluster bound to loopback; it was not the user's existing password-protected PostgreSQL service. Chromium was available and the PDF download was exercised in Playwright.
