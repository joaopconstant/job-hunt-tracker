// Only used by `@better-auth/cli generate` to update prisma/schema.prisma.
import { createAuth } from "./src/auth.js";
import { createPrismaClient } from "./src/db.js";

export const auth = createAuth(createPrismaClient("postgresql://localhost/unused"), {
  secret: "cli-only-secret-cli-only-secret-00",
  baseURL: "http://localhost:3000",
});
