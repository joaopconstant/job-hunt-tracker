import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Optional so `prisma generate` works without a database (e.g. Docker builds).
    url: process.env.DATABASE_URL ?? "",
  },
});
