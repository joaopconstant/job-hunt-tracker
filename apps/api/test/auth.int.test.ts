import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { createAuth } from "../src/auth.js";
import { betterAuthAuthenticator } from "../src/authenticator.js";
import { createPrismaClient } from "../src/db.js";
import { PrismaApplicationRepository } from "../src/repositories/prisma-application-repository.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const origin = "http://localhost:3000";
const prisma = createPrismaClient(databaseUrl);
const app = await buildApp({
  repository: new PrismaApplicationRepository(prisma),
  authenticator: betterAuthAuthenticator(
    createAuth(prisma, { secret: "integration-test-secret-integration-test", baseURL: origin }),
  ),
});

beforeEach(async () => {
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

async function signUp(email: string) {
  const response = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { origin },
    payload: { name: email.split("@")[0], email, password: "correct-horse-battery" },
  });
  expect(response.statusCode).toBe(200);
  const cookie = response.cookies.map(({ name, value }) => `${name}=${value}`).join("; ");
  expect(cookie).toContain("session_token");
  return { cookie };
}

describe("authentication (Better Auth + Prisma)", () => {
  it("signs up, then uses the session cookie to create and list applications", async () => {
    const { cookie } = await signUp("alice@example.com");

    const created = await app.inject({
      method: "POST",
      url: "/applications",
      headers: { cookie },
      payload: { company: "Acme", role: "Dev" },
    });
    const list = await app.inject({ method: "GET", url: "/applications", headers: { cookie } });

    expect(created.statusCode).toBe(201);
    expect(list.json().map((a: { company: string }) => a.company)).toEqual(["Acme"]);
  });

  it("keeps each user's applications private", async () => {
    const alice = await signUp("alice@example.com");
    const bob = await signUp("bob@example.com");
    await app.inject({
      method: "POST",
      url: "/applications",
      headers: { cookie: alice.cookie },
      payload: { company: "Acme", role: "Dev" },
    });

    const list = await app.inject({ method: "GET", url: "/applications", headers: { cookie: bob.cookie } });

    expect(list.json()).toEqual([]);
  });

  it("rejects a wrong password", async () => {
    await signUp("alice@example.com");

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      headers: { origin },
      payload: { email: "alice@example.com", password: "wrong-password" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects requests with an invalid session cookie", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/applications",
      headers: { cookie: "better-auth.session_token=forged" },
    });

    expect(response.statusCode).toBe(401);
  });
});
