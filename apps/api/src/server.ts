import { buildApp } from "./app.js";
import { createAuth } from "./auth.js";
import { betterAuthAuthenticator } from "./authenticator.js";
import { createPrismaClient } from "./db.js";
import type { MatchAnalyzer } from "./match/analyzer.js";
import { ClaudeMatchAnalyzer } from "./match/claude-analyzer.js";
import { KeywordMatchAnalyzer } from "./match/keyword-analyzer.js";
import { PrismaApplicationRepository } from "./repositories/prisma-application-repository.js";
import { PrismaMatchRepository } from "./repositories/prisma-match-repository.js";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const prisma = createPrismaClient(requireEnv("DATABASE_URL"));
const auth = createAuth(prisma, {
  secret: requireEnv("BETTER_AUTH_SECRET"),
  baseURL: requireEnv("BETTER_AUTH_URL"),
  disableRateLimit: process.env.AUTH_RATE_LIMIT === "off",
});
// Claude when a key is configured; otherwise the free, offline keyword baseline.
const analyzer: MatchAnalyzer = process.env.ANTHROPIC_API_KEY
  ? new ClaudeMatchAnalyzer()
  : new KeywordMatchAnalyzer();

const app = await buildApp({
  repository: new PrismaApplicationRepository(prisma),
  matches: new PrismaMatchRepository(prisma),
  analyzer,
  authenticator: betterAuthAuthenticator(auth),
  corsOrigin: process.env.CORS_ORIGIN,
  logger: true,
});

const shutdown = async () => {
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.log.info(`match analyzer: ${analyzer.name}`);

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3333) });
