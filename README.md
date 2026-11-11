# SignalBrief

**Evidence-first meeting intelligence.** Know what matters before you enter the room.

SignalBrief researches a company or person before a scheduled meeting and prepares a concise, cited briefing. Live research uses the Tavily Search and Extract APIs for web evidence and routes every model request through the Bifrost gateway by Maxim AI. Claims are checked against the supplied source URLs and dates; interpretations, uncertainty and missing information are shown separately.

> Live research requires Tavily and Bifrost configuration. The included Microsoft example is an archived April 2025 fixture and is always labelled as demo data. It does not call either service.

## Features

- Meeting subject, type, purpose, time, IANA timezone and context input.
- A 30-day research window based on the scheduled meeting; evidence for future meetings ends at research generation time.
- Bifrost entity resolution and planning, structured evidence extraction, contradiction analysis and briefing composition.
- Four or more targeted Tavily search angles, followed by Tavily Extract for selected URLs.
- URL and title deduplication, date separation, source metadata and a transparent relevance heuristic.
- Claim-level links to source records; invalid model citations and out-of-window event dates are omitted and reported.
- Observable SSE stages, persisted research events, saved briefings, source explorer and Playwright A4 PDF export.
- Archived demo fixture, explicitly separated from live research.

## Stack

Next.js App Router, React, strict TypeScript, Tailwind CSS, Zod, Prisma, SQLite for local development, PostgreSQL for production, Tavily Search/Extract, Bifrost OpenAI-compatible chat completions, Vitest and Playwright.

## Quick start (local SQLite)

Prerequisites: Node.js 22.12 or later (or Node 24+) and npm.

```bash
npm ci
Copy-Item .env.example .env
npx prisma db push --schema=prisma/schema.prisma
npm run dev
```

Open `http://localhost:3000`. The archived demo works without API keys. To run live research, set the server-only keys and Bifrost settings in `.env`:

```dotenv
TAVILY_API_KEY=your-tavily-key
BIFROST_BASE_URL=http://localhost:8080/v1
BIFROST_API_KEY=
BIFROST_MODEL=openai/gpt-4o-mini
```

Configure a provider/model and any gateway key policy in Bifrost itself. The Bifrost API key may be blank only when the configured gateway does not require authentication. SignalBrief does not fall back to a direct model provider.

## Production with Docker Compose

Copy `.env.example` to `.env`, add `TAVILY_API_KEY`, then run:

```bash
docker compose up --build
```

Compose starts PostgreSQL, Bifrost and SignalBrief. Configure a model provider in Bifrost before live research. Set `BIFROST_API_KEY` and `BIFROST_MODEL` as required by that Bifrost deployment. The app container applies the PostgreSQL migration before starting Next.js. The local PostgreSQL and Bifrost ports bind to loopback.

## Commands

```bash
npm run dev                          # local development
npm run typecheck                    # TypeScript check
npm test                             # unit and mocked integration tests
npm run test:e2e:install             # download Playwright Chromium
npm run test:e2e                     # browser end-to-end flow
npm run build:postgres               # production Next build with PostgreSQL client
npm run db:migrate:deploy            # apply PostgreSQL migrations
npm start                            # serve a completed Next build
```

For e2e tests, `npm run test:e2e` prepares an isolated SQLite database in the operating system temp directory and runs against a production Next.js build; see [Testing](docs/TESTING.md).

## Configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma database URL; local example uses SQLite, deployment uses PostgreSQL |
| `TAVILY_API_KEY` | Server-side Tavily Search and Extract authentication |
| `BIFROST_BASE_URL` | Bifrost OpenAI-compatible API base, for example `http://localhost:8080/v1` |
| `BIFROST_API_KEY` | Optional only if the Bifrost deployment allows unauthenticated access |
| `BIFROST_MODEL` | Public model route identifier configured in Bifrost |
| `APP_URL` | Canonical application URL |
| `FORCE_DEMO_MODE` | Optional local showcase switch; limits processing to the Microsoft archive fixture |

See [.env.example](.env.example), [Deployment](docs/DEPLOYMENT.md) and [API](docs/API.md).

## Project map

```text
src/app/                  Next.js pages and route handlers
src/components/           Dashboard, live status, briefing and source explorer UI
src/lib/ai/bifrost.ts     Server-only Bifrost client
src/lib/research/tavily.ts Server-only Tavily Search and Extract client
src/lib/pipeline/         Research workflow and persistence
src/lib/validation/       Zod request and model output schemas
src/lib/export/pdf.ts     Playwright single-page PDF rendering
prisma/                   SQLite and PostgreSQL schemas + PostgreSQL migration
tests/e2e/                 Playwright browser workflow
src/__tests__/             Vitest unit and mocked integration tests
docs/                      Architecture, decisions, API, demo, deployment, testing
submission/                Six-slide outline and generated PPTX
```

## Current verification status

The mocked tests exercise Tavily and Bifrost request formatting and response handling; they do not prove live API credentials or service availability. This workspace has no configured live service credentials, so a real Tavily/Bifrost run remains a deployment setup step. Verification commands and their observed results are recorded in [Testing](docs/TESTING.md).

## Security and limits

- Provider keys stay on the server and are redacted from application errors.
- Web text is treated as untrusted evidence and delimited in model prompts.
- Model URLs are mapped only to URLs supplied by Tavily; only HTTPS sources are accepted.
- In-memory rate limits and Tavily caches are per process. Multi-instance deployments should use a shared rate-limit/cache service.
- Authentication and per-user data isolation are not included in this initial hackathon build; deploy behind an access-control layer if reports must be private.
- Playwright PDF export requires a Chromium runtime. Docker is the supported deployment path; see the Vercel note in the deployment guide.
