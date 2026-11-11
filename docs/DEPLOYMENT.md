# Deployment guide

## Requirements

- Node.js 22.12+ (or 24+) for direct Node deployment, or Docker.
- PostgreSQL for production.
- A Tavily API key for live web search/extraction.
- A reachable Bifrost deployment with at least one provider/model route configured. The selected model ID must match `BIFROST_MODEL`.
- Chromium available to the server for PDF export.

Official integration references: [Tavily Search API](https://docs.tavily.com/documentation/api-reference/endpoint/search), [Tavily Extract API](https://docs.tavily.com/documentation/api-reference/endpoint/extract), [Bifrost Gateway quickstart](https://docs.getbifrost.ai/quickstart/gateway/setting-up), and [Bifrost OpenAI-compatible integration](https://docs.getbifrost.ai/integrations/openai-sdk/overview).

## Docker Compose (recommended)

1. Copy `.env.example` to `.env` and set `TAVILY_API_KEY`. Configure Bifrost credentials/model as required by your gateway.
2. Run:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f signalbrief
```

Compose starts PostgreSQL 16, the pinned Bifrost container and SignalBrief. The app entrypoint applies `prisma/migrations` before starting Next.js. Bifrost itself still needs a provider/model configured (for example through the deployment's supported control plane) before model requests can succeed. In Compose, the app reaches it at `http://bifrost:8080/v1`; the host gateway port is loopback-only. PostgreSQL credentials in the compose file are development defaults: change them and set a durable secret before exposing a deployment.

Set optional values in `.env` before `docker compose up`:

```dotenv
BIFROST_BASE_URL=http://bifrost:8080/v1
BIFROST_API_KEY=
BIFROST_MODEL=openai/gpt-4o-mini
APP_URL=http://localhost:3000
```

Use a configured remote Bifrost URL and authentication for production rather than the bundled local gateway. Do not commit `.env`.

## Direct Node deployment / Railway

Use a PostgreSQL database and a Node 22 container with Chromium installed. The included Dockerfile is the supported Railway deployment route:

1. Push the repository to GitHub and create a Railway project from it.
2. Add PostgreSQL, then set `DATABASE_URL`, `TAVILY_API_KEY`, `BIFROST_BASE_URL`, `BIFROST_API_KEY` as required, `BIFROST_MODEL`, and `APP_URL` in the service settings.
3. Deploy with the repository Dockerfile. It generates the PostgreSQL Prisma client, builds Next.js and applies migrations on container start.
4. Configure the Bifrost provider separately and check `/api/health` for app/database/configuration status. The health route does not make upstream service calls.

For a manually managed Node host:

```bash
npm ci
npm run db:generate:postgres
npm run db:migrate:deploy
npm run build:postgres
npm start
```

Install Playwright Chromium and its system libraries on that host for PDF export. Keep the process alive and set `PORT`/`HOSTNAME` as your platform expects.

## Vercel

The app uses the Next.js App Router and `npm run vercel-build` generates the PostgreSQL Prisma client before the build. Use an external PostgreSQL database and set the environment variables above in Vercel. Database migrations must be applied as a deployment step with `npm run db:migrate:deploy`.

**PDF export needs separate runtime setup.** The PDF route launches Playwright Chromium, and Vercel's standard function image is not provisioned by this repository with a Chromium executable. A Vercel deployment can serve the application only after adding a Chromium-compatible function runtime/layer and configuring its binary path. That deployment configuration has not been tested here. Use Docker/Railway for a ready Chromium runtime.

## Migrations and database configuration

- Local SQLite: `DATABASE_URL="file:./prisma/dev.db"` and `npm run db:push`.
- PostgreSQL: `DATABASE_URL="postgresql://.../signalbrief?schema=public"`, `npm run db:generate:postgres`, then `npm run db:migrate:deploy`.
- PostgreSQL initial migration is checked in at `prisma/migrations/20261111100000_init/migration.sql`.
- Production build: `npm run build:postgres`.
- Prisma 7 uses driver adapters: `PrismaBetterSqlite3` locally and `PrismaPg` for PostgreSQL. The root `prisma.config.ts` points Prisma CLI migrations at the PostgreSQL schema.

Do not use `prisma db push` on production data; apply reviewed migrations.

## Verification status for this workspace

The PostgreSQL-targeted Next.js production build and PostgreSQL Prisma schema validation succeeded. The migration was reviewed against the schema but was not applied to a live database. Docker Compose startup was not exercised because Docker Engine is unavailable in the development environment. No live Tavily or Bifrost call was made because API credentials are not configured.

## Environment variables

| Name | Required for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | All deployments | PostgreSQL in production, SQLite for local setup |
| `TAVILY_API_KEY` | Live research | Server-only Tavily authentication |
| `BIFROST_BASE_URL` | Live research | Bifrost OpenAI-compatible base URL, ending in `/v1` |
| `BIFROST_API_KEY` | As configured by Bifrost | Leave blank only if that gateway permits unauthenticated access |
| `BIFROST_MODEL` | Live research | Route identifier configured in Bifrost, e.g. `openai/gpt-4o-mini` |
| `APP_URL` | External deployment | Public application base URL |
| `FORCE_DEMO_MODE` | Optional | Local showcase switch; uses only archived Microsoft fixture |

See [.env.example](../.env.example). Never place these values in client code or public `NEXT_PUBLIC_` variables.

## Operations

- Confirm PostgreSQL connectivity and integration configuration at `/api/health`.
- Confirm a live provider by creating a live briefing; health only reports local configuration.
- Use `/api/briefings/:id/status` to inspect saved stage events after a run.
- Scale only after replacing process-local rate limits/cache with shared services and moving long research jobs to a durable queue.
- Configure backups and TLS at the platform/database layer. The initial app has no login or user-level report access controls.
