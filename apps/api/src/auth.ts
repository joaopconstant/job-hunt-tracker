import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { PrismaClient } from "./generated/prisma/client.js";

export interface AuthOptions {
  secret: string;
  /** Public URL the browser uses to reach the auth routes (the web app, which proxies /api/auth). */
  baseURL: string;
  trustedOrigins?: string[];
}

export function createAuth(prisma: PrismaClient, { secret, baseURL, trustedOrigins }: AuthOptions) {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    secret,
    baseURL,
    trustedOrigins,
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
  });
}

export type Auth = ReturnType<typeof createAuth>;
