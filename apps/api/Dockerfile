# syntax=docker/dockerfile:1
# Build context: repository root (see docker-compose.yml).

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter api --ignore-scripts
COPY apps/api apps/api
RUN pnpm --filter api db:generate && pnpm --filter api build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm deploy --filter api --prod --legacy --ignore-scripts /out
# Fetch the Prisma schema engine at build time so `migrate deploy` works offline.
RUN cd /out && node node_modules/prisma/build/index.js version

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=3333
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3333
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3333/health || exit 1
# Apply pending migrations, then start the server.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node dist/server.js"]
