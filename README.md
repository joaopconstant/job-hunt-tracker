# Job Hunt Tracker

Track every job application from wishlist to offer, with an AI assistant that compares a job posting with your résumé (coming soon).

Built as a production-style full stack project: typed end to end, containerized, tested at every level and checked by CI on every pull request.

## Stack

| Layer | Tech |
| --- | --- |
| Web | Next.js 16 (App Router, Server Actions, Cache Components), React 19, Tailwind CSS 4, shadcn/ui |
| API | Node.js 22, Fastify 5, Zod 4 (validation + OpenAPI docs) |
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

## Running locally

With Docker (whole stack, migrations applied on start):

```bash
docker compose up --build
# web: http://localhost:3000  api: http://localhost:3333
```

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
- [ ] Authentication
- [ ] Dashboard with job hunt metrics
- [ ] AI: parse a job posting and match it against your résumé
- [ ] Deploy to AWS
