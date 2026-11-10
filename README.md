# Job Hunt Tracker

Track every job application from wishlist to offer, with an AI assistant that compares a job posting with your résumé.

Built as a production-style full stack project: typed end to end, containerized, tested at every level and checked by CI on every pull request.

## Stack

| Layer | Tech |
| --- | --- |
| Web | Next.js 16 (App Router, Server Actions, Cache Components), React 19, Tailwind CSS 4, shadcn/ui, Recharts |
| API | Node.js 22, Fastify 5, Zod 4 (validation + OpenAPI docs) |
| Auth | Better Auth (email and password, database sessions) |
| AI | Claude API (Anthropic TypeScript SDK, structured outputs) |
| Data | PostgreSQL 17, Prisma 7 |
| Tests | Vitest, Testing Library, Playwright |
| Infra | Docker, Docker Compose, GitHub Actions, GitHub Container Registry |

## Architecture

```
apps/
  web/   Next.js app. Server Components call the API; Server Actions handle mutations.
  api/   Fastify REST API. Routes depend on an ApplicationRepository interface,
         implemented with Prisma in production and in memory in unit tests.
```

API docs (Swagger UI) are served at `http://localhost:3333/docs`.

### Authentication

Better Auth runs inside the API and stores users and sessions in Postgres through Prisma. The browser never calls the API directly: the web app proxies `/api/auth/*` to it, so the session cookie is first-party on the web origin. Server Components forward that cookie when they call the API, and every `/applications` route resolves the user from it and only reads or changes that user's data.

### Résumé match

Each user saves their résumé once. On an application's page they paste the job posting, and the API sends both to Claude (`claude-opus-5-5`) with a JSON schema for the answer: a 0-100 score, a summary, strengths, gaps and suggestions. The result is stored with the application, so it is still there on the next visit.

- **Pluggable analyzer:** routes depend on a `MatchAnalyzer` interface. With `ANTHROPIC_API_KEY` set the API uses Claude; without it, a deterministic keyword baseline, so local development, CI and the e2e tests run offline and for free.
- **Safety and cost:** the résumé and posting are passed as data inside tags, the system prompt tells the model to ignore instructions inside them, refusals and API errors become a `502` with a friendly message, and each user is limited to 20 analyses per hour.

## Running locally

With Docker (whole stack, migrations applied on start):

```bash
docker compose up --build
# web: http://localhost:3000  api: http://localhost:3333
```

To use Claude for the résumé match, export `ANTHROPIC_API_KEY` before `docker compose up` (or put it in `apps/api/.env`). Without it the keyword baseline is used.

Without Docker for the apps (only Postgres in a container):

```bash
pnpm install
docker compose up -d db
cp apps/api/.env.example apps/api/.env
pnpm --filter api db:migrate
pnpm dev
```

## Tests

```bash
pnpm test                          # unit + component tests (Vitest, Testing Library)
pnpm --filter api test:integration # API repository against a real Postgres
pnpm test:e2e                      # Playwright against the running stack
```

## CI

Every pull request runs lint, typecheck and unit tests, the integration tests against a Postgres service container, and the Playwright suite against the full stack started with Docker Compose. Pushes to `main` also build and publish the Docker images to GHCR.

## Roadmap

- [x] Applications CRUD and Kanban board
- [x] Docker, tests and CI
- [x] UI with shadcn/ui
- [x] Authentication (email and password)
- [x] Dashboard with job hunt metrics
- [x] AI: match a job posting against your résumé
- [ ] Deploy to AWS
