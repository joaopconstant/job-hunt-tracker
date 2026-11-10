import { buildApp } from "./app.js";
import { createPrismaClient } from "./db.js";
import { PrismaApplicationRepository } from "./repositories/prisma-application-repository.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const prisma = createPrismaClient(databaseUrl);
const app = await buildApp({
  repository: new PrismaApplicationRepository(prisma),
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
