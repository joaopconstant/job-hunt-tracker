import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { PrismaClient } from "./generated/prisma/client.js";

export interface AuthOptions {
  secret: string;
  /** Public URL the browser uses to reach the auth routes (the web app, which proxies /api/auth). */
  baseURL: string;
  trustedOrigins?: string[];
  /** Turn off Better Auth's rate limiter (on by default in production). Only for e2e runs. */
  disableRateLimit?: boolean;
}

export function createAuth(prisma: PrismaClient, { secret, baseURL, trustedOrigins, disableRateLimit }: AuthOptions) {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    secret,
    baseURL,
    trustedOrigins,
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    // The web app forwards the browser's IP in x-forwarded-for (Better Auth's default header).
    ...(disableRateLimit && { rateLimit: { enabled: false } }),
  });
}

export type Auth = ReturnType<typeof createAuth>;
