import { buildApp } from "./app.js";
import { createAuth } from "./auth.js";
import { betterAuthAuthenticator } from "./authenticator.js";
import { createPrismaClient } from "./db.js";
import { PrismaApplicationRepository } from "./repositories/prisma-application-repository.js";

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
const app = await buildApp({
  repository: new PrismaApplicationRepository(prisma),
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

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3333) });
